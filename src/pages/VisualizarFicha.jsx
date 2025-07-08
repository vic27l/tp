import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Paciente } from "@/entities/Paciente";
import { Consulta } from "@/entities/Consulta";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, FileText, User, Heart, Stethoscope, Smile, Activity, Baby, SmilePlus, Apple, Calendar, Edit3, Phone, MapPin, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MapaDental from "../components/MapaDental";

/**
 * Helper: Estilo CSS para PDF (aplicado só na exportação)
 */
const pdfExportCss = `
.pdf-export {
  font-family: 'Arial', sans-serif !important;
  background: #fff !important;
  color: #222 !important;
  padding: 24px !important;
  min-width: 680px;
  max-width: 900px;
}
.pdf-export .pdf-section {
  border: 1.5px solid #2dd4bf;
  border-radius: 10px;
  margin-bottom: 22px;
  padding: 18px 22px 12px 22px;
  background: #f8fafc;
}
.pdf-export .pdf-title {
  color: #059669;
  margin-bottom: 10px;
  font-size: 1.18rem;
  font-weight: bold;
  border-bottom: 1.5px solid #2dd4bf;
  padding-bottom: 4px;
  letter-spacing: 0.02em;
}
.pdf-export label {
  font-size: 0.97em;
  color: #155e75;
  font-weight: bold;
  margin-bottom: 1px;
}
.pdf-export .pdf-value {
  color: #222;
  font-size: 1.02em;
  margin-bottom: 7px;
}
.pdf-export .pdf-grid {
  display: grid;
  gap: 7px 24px;
}
.pdf-export .pdf-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.pdf-export .pdf-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.pdf-export .pdf-subtitle {
  font-size: 1.02em;
  color: #059669;
  font-weight: 600;
  margin-bottom: 2px;
  margin-top: 7px;
}
.pdf-export .pdf-checkbox {
  width: 17px;
  height: 17px;
  border-radius: 3px;
  border: 1.5px solid #059669;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  vertical-align: middle;
  background: #fff;
}
.pdf-export .pdf-checkbox.checked {
  background: #059669;
}
.pdf-export .pdf-checkbox.checked svg {
  color: #fff;
}
.pdf-export .pdf-footer {
  margin-top: 24px;
  font-size: 0.95em;
  color: #155e75;
  text-align: right;
  font-style: italic;
}
`;

export default function VisualizarFicha() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pegar o ID do paciente da URL
  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get('id');

  useEffect(() => {
    if (pacienteId) {
      loadPaciente();
      loadConsultas();
    }
  }, [pacienteId]);

  const loadPaciente = async () => {
    try {
      const pacientes = await Paciente.list();
      const pacienteEncontrado = pacientes.find(p => p.id === pacienteId);
      setPaciente(pacienteEncontrado);
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
    }
  };

  const loadConsultas = async () => {
    try {
      const todasConsultas = await Consulta.list();
      const consultasPaciente = todasConsultas.filter(c => c.paciente_id === pacienteId);
      setConsultas(consultasPaciente);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona CSS customizado ao DOM durante a exportação do PDF
   */
  const addPdfExportCss = () => {
    let style = document.createElement('style');
    style.id = 'pdf-export-style';
    style.innerHTML = pdfExportCss;
    document.head.appendChild(style);
  };
  /**
   * Remove o CSS customizado do DOM após a exportação
   */
  const removePdfExportCss = () => {
    const style = document.getElementById('pdf-export-style');
    if (style) style.remove();
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const input = document.getElementById('ficha-content');
    if (!input) {
      setIsExporting(false);
      return;
    }

    // Add PDF export class and styles
    input.classList.add('pdf-export');
    addPdfExportCss();

    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fff',
        width: input.scrollWidth,
        height: input.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate the width/height ratio to fit nicely in A4
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(`ficha_${paciente.nome_crianca.replace(/\s+/g, '_')}.pdf`);

      }).catch(err => {
        console.error("Error exporting PDF:", err);
      }).finally(() => {
        input.classList.remove('pdf-export');
        removePdfExportCss();
        setIsExporting(false);
      });
    }, 200);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando ficha...</p>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
          <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Paciente não encontrado</h3>
          <p className="text-white/70 mb-6">Não foi possível encontrar os dados deste paciente.</p>
          <button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="glass-button px-6 py-3 rounded-lg text-white font-semibold hover:bg-emerald-500/30 transition-all"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatarSimNao = (valor) => {
    if (valor === true) return "SIM";
    if (valor === false) return "NÃO";
    return "Não informado";
  };

  const formatarTexto = (texto) => {
    return texto || "Não informado";
  };

  // PDF/HTML icons for checkboxes
  const PdfCheck = ({ checked }) => (
    <span className={`pdf-checkbox${checked ? " checked" : ""}`}>
      {checked ? (
        <svg width="11" height="10" viewBox="0 0 20 20" fill="none">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
        </svg>
      ) : null}
    </span>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="glass-button p-3 rounded-lg text-white hover:bg-emerald-500/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{paciente.nome_crianca}</h1>
              <p className="text-emerald-100">Ficha de Anamnese</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="glass-button px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 hover:bg-emerald-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExporting ? "Exportando..." : "Exportar PDF"}</span>
          </button>
        </div>

        <div className="space-y-8" id="ficha-content">
          {/* Dados Pessoais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-emerald-400" />
              <span>Dados Pessoais</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Nome da Criança</label>
                <p className="pdf-value">{paciente.nome_crianca}</p>
              </div>
              <div>
                <label>Data de Nascimento</label>
                <p className="pdf-value">
                  {paciente.data_nascimento
                    ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })
                    : "Não informado"}
                  {paciente.idade && <span style={{ color: "#059669", marginLeft: 6 }}>({paciente.idade} anos)</span>}
                </p>
              </div>
              {paciente.cel && (
                <div>
                  <label>Celular</label>
                  <p className="pdf-value">{paciente.cel}</p>
                </div>
              )}
              {paciente.endereco && (
                <div>
                  <label>Endereço</label>
                  <p className="pdf-value">
                    {paciente.endereco}
                    <br />
                    <span style={{ color: "#059669", fontSize: "0.97em" }}>
                      {paciente.bairro} - {paciente.cidade} - {paciente.cep}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dados dos Pais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title">Dados dos Pais</div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <span className="pdf-subtitle">Mãe</span>
                <label>Nome</label>
                <p className="pdf-value">{formatarTexto(paciente.nome_mae)}</p>
                <div className="pdf-grid pdf-grid-2">
                  <div>
                    <label>Idade</label>
                    <p className="pdf-value">{paciente.idade_mae || "Não informado"}</p>
                  </div>
                  <div>
                    <label>Profissão</label>
                    <p className="pdf-value">{formatarTexto(paciente.profissao_mae)}</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="pdf-subtitle">Pai</span>
                <label>Nome</label>
                <p className="pdf-value">{formatarTexto(paciente.nome_pai)}</p>
                <div className="pdf-grid pdf-grid-2">
                  <div>
                    <label>Idade</label>
                    <p className="pdf-value">{paciente.idade_pai || "Não informado"}</p>
                  </div>
                  <div>
                    <label>Profissão</label>
                    <p className="pdf-value">{formatarTexto(paciente.profissao_pai)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivo da Consulta */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Motivo da Consulta</span>
            </div>
            <label>Motivo da consulta</label>
            <p className="pdf-value">{formatarTexto(paciente.motivo_consulta)}</p>
            <label>Alterações durante a gestação</label>
            <p className="pdf-value">{formatarTexto(paciente.alteracao_gestacao)}</p>
          </div>

          {/* Necessidades Especiais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Heart className="w-5 h-5 text-emerald-400" />
              <span>Necessidades Especiais</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Necessidade especial</label>
                <p className="pdf-value">{formatarSimNao(paciente.necessidade_especial)}</p>
                {paciente.qual_necessidade && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_necessidade}</p>
                )}
              </div>
              <div>
                <label>Comprometimento de coordenação</label>
                <p className="pdf-value">{formatarSimNao(paciente.comprometimento_coordenacao)}</p>
                {paciente.qual_coordenacao && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_coordenacao}</p>
                )}
              </div>
              <div>
                <label>Comprometimento visual</label>
                <p className="pdf-value">{formatarSimNao(paciente.comprometimento_visual)}</p>
                {paciente.qual_visual && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_visual}</p>
                )}
              </div>
              <div>
                <label>Comprometimento de comunicação</label>
                <p className="pdf-value">{formatarSimNao(paciente.comprometimento_comunicacao)}</p>
                {paciente.qual_comunicacao && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_comunicacao}</p>
                )}
              </div>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Como reage quando contrariado</label>
                <p className="pdf-value">{formatarTexto(paciente.reacao_contrariado)}</p>
              </div>
              <div>
                <label>Como reage com profissionais</label>
                <p className="pdf-value">{formatarTexto(paciente.reacao_profissionais)}</p>
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              <span>Histórico Médico</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Sofreu cirurgia</label>
                <p className="pdf-value">{formatarSimNao(paciente.sofreu_cirurgia)}</p>
                {paciente.qual_cirurgia && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_cirurgia}</p>
                )}
              </div>
              <div>
                <label>Alterações sanguíneas</label>
                <p className="pdf-value">{formatarSimNao(paciente.alteracoes_sanguineas)}</p>
              </div>
              <div>
                <label>Problemas respiratórios</label>
                <p className="pdf-value">{formatarSimNao(paciente.problemas_respiratorios)}</p>
              </div>
              <div>
                <label>Problemas hepáticos</label>
                <p className="pdf-value">{formatarSimNao(paciente.problemas_hepaticos)}</p>
              </div>
              <div>
                <label>Cardiopatias</label>
                <p className="pdf-value">{formatarSimNao(paciente.cardiopatias)}</p>
              </div>
              <div>
                <label>Problemas gástricos</label>
                <p className="pdf-value">{formatarSimNao(paciente.problemas_gastricos)}</p>
              </div>
            </div>
            <div className="pdf-grid pdf-grid-3">
              <div>
                <label>Alergias medicamentos</label>
                <p className="pdf-value">{formatarTexto(paciente.alergias_medicamento)}</p>
              </div>
              <div>
                <label>Alergias alimentares</label>
                <p className="pdf-value">{formatarTexto(paciente.alergias_alimentar)}</p>
              </div>
              <div>
                <label>Alergias respiratórias</label>
                <p className="pdf-value">{formatarTexto(paciente.alergias_respiratoria)}</p>
              </div>
            </div>
            <div>
              <label>Tratamentos atuais</label>
              <p className="pdf-value">{formatarTexto(paciente.tratamentos_atuais)}</p>
            </div>
          </div>

          {/* Acompanhamentos e Hábitos */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Acompanhamentos e Hábitos</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Fonoaudiologia</label>
                <p className="pdf-value">{formatarSimNao(paciente.fonoaudiologia)}</p>
              </div>
              <div>
                <label>Fisioterapia</label>
                <p className="pdf-value">{formatarSimNao(paciente.fisioterapia)}</p>
              </div>
              <div>
                <label>Psicologia</label>
                <p className="pdf-value">{formatarSimNao(paciente.psicologia)}</p>
              </div>
              <div>
                <label>Psiquiátrico</label>
                <p className="pdf-value">{formatarSimNao(paciente.psiquiatrico)}</p>
              </div>
              <div>
                <label>Terapia Ocupacional</label>
                <p className="pdf-value">{formatarSimNao(paciente.psiquiatrico_to)}</p>
              </div>
              <div>
                <label>Outro tratamento</label>
                <p className="pdf-value">{formatarTexto(paciente.outro_tratamento)}</p>
              </div>
            </div>
            <div>
              <label>Portador de IST</label>
              <p className="pdf-value">{formatarTexto(paciente.portador_ist)}</p>
            </div>
          </div>

          {/* Hábitos Alimentares e Comportamentais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Baby className="w-5 h-5 text-emerald-400" />
              <span>Hábitos Alimentares e Comportamentais</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Mama no peito</label>
                <p className="pdf-value">{formatarSimNao(paciente.mama_peito)}</p>
              </div>
              <div>
                <label>Já mamou no peito</label>
                <p className="pdf-value">{formatarSimNao(paciente.mamou_peito)}</p>
                {paciente.ate_quando_mamou && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>Até: {paciente.ate_quando_mamou}</p>
                )}
              </div>
              <div>
                <label>Toma mamadeira</label>
                <p className="pdf-value">{formatarSimNao(paciente.toma_mamadeira)}</p>
              </div>
              <div>
                <label>Já tomou mamadeira</label>
                <p className="pdf-value">{formatarSimNao(paciente.tomou_mamadeira)}</p>
                {paciente.ate_quando_mamadeira && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>Até: {paciente.ate_quando_mamadeira}</p>
                )}
              </div>
              <div>
                <label>Engasga ou vomita</label>
                <p className="pdf-value">{formatarTexto(paciente.engasga_vomita)}</p>
              </div>
              <div>
                <label>Chupa o dedo</label>
                <p className="pdf-value">{formatarTexto(paciente.chupa_dedo)}</p>
              </div>
              <div>
                <label>Chupa chupeta</label>
                <p className="pdf-value">{formatarTexto(paciente.chupa_chupeta)}</p>
              </div>
              <div>
                <label>Outros hábitos</label>
                <p className="pdf-value">{formatarTexto(paciente.outros_habitos)}</p>
              </div>
              <div>
                <label>Range os dentes</label>
                <p className="pdf-value">{formatarTexto(paciente.range_dentes)}</p>
              </div>
            </div>
          </div>

          {/* Histórico Odontológico */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <SmilePlus className="w-5 h-5 text-emerald-400" />
              <span>Histórico Odontológico</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Anos na primeira consulta</label>
                <p className="pdf-value">{paciente.anos_primeira_consulta || "Não informado"}</p>
              </div>
              <div>
                <label>Tratamento anterior</label>
                <p className="pdf-value">{formatarTexto(paciente.tratamento_anterior)}</p>
              </div>
              <div>
                <label>Já foi ao dentista</label>
                <p className="pdf-value">{formatarSimNao(paciente.foi_dentista)}</p>
                {paciente.qual_dentista && (
                  <p style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_dentista}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alimentação e Outras Informações */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Apple className="w-5 h-5 text-emerald-400" />
              <span>Alimentação e Outras Informações</span>
            </div>
            <label>Alimentação</label>
            <p className="pdf-value">{formatarTexto(paciente.alimentacao_notas)}</p>
            <label>Informações adicionais</label>
            <p className="pdf-value">{formatarTexto(paciente.informacoes_adicionais)}</p>
          </div>

          {/* Higiene Bucal */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Smile className="w-5 h-5 text-emerald-400" />
              <span>Higiene Bucal</span>
            </div>
            <div className="pdf-grid pdf-grid-2">
              <div>
                <label>Escova utilizada</label>
                <p className="pdf-value">{formatarTexto(paciente.escova_usa)}</p>
              </div>
              <div>
                <label>Creme dental</label>
                <p className="pdf-value">{formatarTexto(paciente.creme_dental)}</p>
              </div>
              <div>
                <label>Quem faz higiene</label>
                <p className="pdf-value">{formatarTexto(paciente.higiene_bucal)}</p>
              </div>
              <div>
                <label>Vezes por dia</label>
                <p className="pdf-value">{paciente.vezes_dia_higiene || "Não informado"}</p>
              </div>
              <div>
                <label>Tomou anestesia</label>
                <p className="pdf-value">{formatarSimNao(paciente.tomou_anestesia)}</p>
              </div>
              <div>
                <label>Gengiva sangra</label>
                <p className="pdf-value">{formatarSimNao(paciente.gengiva_sangra)}</p>
              </div>
              <div>
                <label>Extrações dentárias</label>
                <p className="pdf-value">{formatarSimNao(paciente.extracoes_dentarias)}</p>
              </div>
              <div>
                <label>Escova a língua</label>
                <p className="pdf-value">{formatarSimNao(paciente.escova_lingua)}</p>
              </div>
              <div>
                <label>Usa fio dental</label>
                <p className="pdf-value">{formatarSimNao(paciente.usa_fio_dental)}</p>
              </div>
            </div>
          </div>

          {/* Mapa Dental */}
          {paciente.mapa_dental && paciente.mapa_dental.length > 0 && (
            <div className="pdf-section">
              <span className="pdf-title">Mapa Dental</span>
              <MapaDental
                selectedTeeth={paciente.mapa_dental}
                onTeethChange={() => {}} // Read-only
              />
            </div>
          )}

          {/* Histórico de Consultas */}
          {consultas.length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
              <div className="pdf-title flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Histórico de Consultas</span>
              </div>
              <div>
                {consultas.map((consulta, index) => (
                  <div key={index} style={{
                    background: "#e0f2fe",
                    borderRadius: "7px",
                    padding: "8px 12px",
                    marginBottom: "7px"
                  }}>
                    <div className="pdf-grid pdf-grid-2">
                      <div>
                        <label>Data</label>
                        <p className="pdf-value">
                          {format(new Date(consulta.data_atendimento), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <label>Peso</label>
                        <p className="pdf-value">{consulta.peso} kg</p>
                      </div>
                      {consulta.observacoes && (
                        <div style={{ gridColumn: "1 / 3" }}>
                          <label>Observações</label>
                          <p className="pdf-value">{consulta.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsável */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title">Responsável</div>
            <label>Nome do Responsável</label>
            <p className="pdf-value">{formatarTexto(paciente.responsavel_nome)}</p>
            <div style={{ display: "flex", alignItems: "center", marginTop: 9 }}>
              <PdfCheck checked={!!paciente.informacoes_verdadeiras} />
              <span style={{ fontSize: "0.99em" }}>
                Declaro que todas as informações prestadas são verdadeiras
              </span>
            </div>
          </div>
          <div className="pdf-footer">
            Ficha exportada em {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
