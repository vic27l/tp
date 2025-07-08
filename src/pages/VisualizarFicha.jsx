import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Paciente } from "@/entities/Paciente";
import { Consulta } from "@/entities/Consulta";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, FileText, User, Heart, Stethoscope, Smile, Activity, Baby, SmilePlus, Apple,
  Calendar, Phone, MapPin, Download, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MapaDental from "../components/MapaDental";

/**
 * CSS para exportação do PDF – bordas, cores mais neutras, grid.
 */
const pdfExportCss = `
.pdf-export {
  background: #fff !important;
  color: #222 !important;
  padding: 24px !important;
  font-family: Arial, Helvetica, sans-serif !important;
}
.pdf-export .pdf-section {
  border: 1.5px solid #2dd4bf !important;
  border-radius: 10px !important;
  background: #f8fafc !important;
  margin-bottom: 24px !important;
  padding: 18px 22px 12px 22px !important;
  box-shadow: none !important;
}
.pdf-export .pdf-title {
  color: #059669 !important;
  margin-bottom: 10px !important;
  font-size: 1.18rem !important;
  font-weight: bold !important;
  border-bottom: 1.5px solid #2dd4bf !important;
  padding-bottom: 4px !important;
}
.pdf-export label {
  font-size: 0.97em !important;
  color: #155e75 !important;
  font-weight: bold !important;
  margin-bottom: 1px !important;
  display: block !important;
}
.pdf-export .pdf-value {
  color: #222 !important;
  font-size: 1.02em !important;
  margin-bottom: 8px !important;
  display: block !important;
}
.pdf-export .pdf-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 20px !important;
}
.pdf-export .pdf-col {
  min-width: 200px !important;
  flex: 1 1 200px !important;
}
.pdf-export .pdf-footer {
  margin-top: 24px !important;
  font-size: 0.95em !important;
  color: #155e75 !important;
  text-align: right !important;
  font-style: italic !important;
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
    // eslint-disable-next-line
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

  // Insere o CSS apenas para exportação PDF
  const addPdfExportCss = () => {
    if (!document.getElementById('pdf-export-style')) {
      let style = document.createElement('style');
      style.id = 'pdf-export-style';
      style.innerHTML = pdfExportCss;
      document.head.appendChild(style);
    }
  };
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

    input.classList.add('pdf-export');
    addPdfExportCss();

    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff',
        width: input.scrollWidth,
        height: input.scrollHeight
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
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
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Nome da Criança</label>
                <span className="pdf-value">{paciente.nome_crianca}</span>
              </div>
              <div className="pdf-col">
                <label>Data de Nascimento</label>
                <span className="pdf-value">
                  {paciente.data_nascimento
                    ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })
                    : "Não informado"}
                  {paciente.idade && <span style={{ color: "#059669", marginLeft: 6 }}>({paciente.idade} anos)</span>}
                </span>
              </div>
              {paciente.cel && (
                <div className="pdf-col">
                  <label>Celular</label>
                  <span className="pdf-value">{paciente.cel}</span>
                </div>
              )}
              {paciente.endereco && (
                <div className="pdf-col" style={{ minWidth: 270 }}>
                  <label>Endereço</label>
                  <span className="pdf-value">
                    {paciente.endereco}
                    <br />
                    <span style={{ color: "#059669", fontSize: "0.97em" }}>
                      {paciente.bairro} - {paciente.cidade} - {paciente.cep}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dados dos Pais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title">Dados dos Pais</div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Mãe</label>
                <span className="pdf-value">{formatarTexto(paciente.nome_mae)}</span>
                <label>Idade</label>
                <span className="pdf-value">{paciente.idade_mae || "Não informado"}</span>
                <label>Profissão</label>
                <span className="pdf-value">{formatarTexto(paciente.profissao_mae)}</span>
              </div>
              <div className="pdf-col">
                <label>Pai</label>
                <span className="pdf-value">{formatarTexto(paciente.nome_pai)}</span>
                <label>Idade</label>
                <span className="pdf-value">{paciente.idade_pai || "Não informado"}</span>
                <label>Profissão</label>
                <span className="pdf-value">{formatarTexto(paciente.profissao_pai)}</span>
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
            <span className="pdf-value">{formatarTexto(paciente.motivo_consulta)}</span>
            <label>Alterações durante a gestação</label>
            <span className="pdf-value">{formatarTexto(paciente.alteracao_gestacao)}</span>
          </div>

          {/* Necessidades Especiais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Heart className="w-5 h-5 text-emerald-400" />
              <span>Necessidades Especiais</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Necessidade especial</label>
                <span className="pdf-value">{formatarSimNao(paciente.necessidade_especial)}</span>
                {paciente.qual_necessidade && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_necessidade}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Comprometimento de coordenação</label>
                <span className="pdf-value">{formatarSimNao(paciente.comprometimento_coordenacao)}</span>
                {paciente.qual_coordenacao && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_coordenacao}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Comprometimento visual</label>
                <span className="pdf-value">{formatarSimNao(paciente.comprometimento_visual)}</span>
                {paciente.qual_visual && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_visual}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Comprometimento de comunicação</label>
                <span className="pdf-value">{formatarSimNao(paciente.comprometimento_comunicacao)}</span>
                {paciente.qual_comunicacao && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_comunicacao}</span>
                )}
              </div>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Como reage quando contrariado</label>
                <span className="pdf-value">{formatarTexto(paciente.reacao_contrariado)}</span>
              </div>
              <div className="pdf-col">
                <label>Como reage com profissionais</label>
                <span className="pdf-value">{formatarTexto(paciente.reacao_profissionais)}</span>
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
              <span>Histórico Médico</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Sofreu cirurgia</label>
                <span className="pdf-value">{formatarSimNao(paciente.sofreu_cirurgia)}</span>
                {paciente.qual_cirurgia && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_cirurgia}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Alterações sanguíneas</label>
                <span className="pdf-value">{formatarSimNao(paciente.alteracoes_sanguineas)}</span>
              </div>
              <div className="pdf-col">
                <label>Problemas respiratórios</label>
                <span className="pdf-value">{formatarSimNao(paciente.problemas_respiratorios)}</span>
              </div>
              <div className="pdf-col">
                <label>Problemas hepáticos</label>
                <span className="pdf-value">{formatarSimNao(paciente.problemas_hepaticos)}</span>
              </div>
              <div className="pdf-col">
                <label>Cardiopatias</label>
                <span className="pdf-value">{formatarSimNao(paciente.cardiopatias)}</span>
              </div>
              <div className="pdf-col">
                <label>Problemas gástricos</label>
                <span className="pdf-value">{formatarSimNao(paciente.problemas_gastricos)}</span>
              </div>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Alergias medicamentos</label>
                <span className="pdf-value">{formatarTexto(paciente.alergias_medicamento)}</span>
              </div>
              <div className="pdf-col">
                <label>Alergias alimentares</label>
                <span className="pdf-value">{formatarTexto(paciente.alergias_alimentar)}</span>
              </div>
              <div className="pdf-col">
                <label>Alergias respiratórias</label>
                <span className="pdf-value">{formatarTexto(paciente.alergias_respiratoria)}</span>
              </div>
            </div>
            <div>
              <label>Tratamentos atuais</label>
              <span className="pdf-value">{formatarTexto(paciente.tratamentos_atuais)}</span>
            </div>
          </div>

          {/* Acompanhamentos e Hábitos */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Acompanhamentos e Hábitos</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Fonoaudiologia</label>
                <span className="pdf-value">{formatarSimNao(paciente.fonoaudiologia)}</span>
              </div>
              <div className="pdf-col">
                <label>Fisioterapia</label>
                <span className="pdf-value">{formatarSimNao(paciente.fisioterapia)}</span>
              </div>
              <div className="pdf-col">
                <label>Psicologia</label>
                <span className="pdf-value">{formatarSimNao(paciente.psicologia)}</span>
              </div>
              <div className="pdf-col">
                <label>Psiquiátrico</label>
                <span className="pdf-value">{formatarSimNao(paciente.psiquiatrico)}</span>
              </div>
              <div className="pdf-col">
                <label>Terapia Ocupacional</label>
                <span className="pdf-value">{formatarSimNao(paciente.psiquiatrico_to)}</span>
              </div>
              <div className="pdf-col">
                <label>Outro tratamento</label>
                <span className="pdf-value">{formatarTexto(paciente.outro_tratamento)}</span>
              </div>
            </div>
            <div>
              <label>Portador de IST</label>
              <span className="pdf-value">{formatarTexto(paciente.portador_ist)}</span>
            </div>
          </div>

          {/* Hábitos Alimentares e Comportamentais */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Baby className="w-5 h-5 text-emerald-400" />
              <span>Hábitos Alimentares e Comportamentais</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Mama no peito</label>
                <span className="pdf-value">{formatarSimNao(paciente.mama_peito)}</span>
              </div>
              <div className="pdf-col">
                <label>Já mamou no peito</label>
                <span className="pdf-value">{formatarSimNao(paciente.mamou_peito)}</span>
                {paciente.ate_quando_mamou && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>Até: {paciente.ate_quando_mamou}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Toma mamadeira</label>
                <span className="pdf-value">{formatarSimNao(paciente.toma_mamadeira)}</span>
              </div>
              <div className="pdf-col">
                <label>Já tomou mamadeira</label>
                <span className="pdf-value">{formatarSimNao(paciente.tomou_mamadeira)}</span>
                {paciente.ate_quando_mamadeira && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>Até: {paciente.ate_quando_mamadeira}</span>
                )}
              </div>
              <div className="pdf-col">
                <label>Engasga ou vomita</label>
                <span className="pdf-value">{formatarTexto(paciente.engasga_vomita)}</span>
              </div>
              <div className="pdf-col">
                <label>Chupa o dedo</label>
                <span className="pdf-value">{formatarTexto(paciente.chupa_dedo)}</span>
              </div>
              <div className="pdf-col">
                <label>Chupa chupeta</label>
                <span className="pdf-value">{formatarTexto(paciente.chupa_chupeta)}</span>
              </div>
              <div className="pdf-col">
                <label>Outros hábitos</label>
                <span className="pdf-value">{formatarTexto(paciente.outros_habitos)}</span>
              </div>
              <div className="pdf-col">
                <label>Range os dentes</label>
                <span className="pdf-value">{formatarTexto(paciente.range_dentes)}</span>
              </div>
            </div>
          </div>

          {/* Histórico Odontológico */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <SmilePlus className="w-5 h-5 text-emerald-400" />
              <span>Histórico Odontológico</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Anos na primeira consulta</label>
                <span className="pdf-value">{paciente.anos_primeira_consulta || "Não informado"}</span>
              </div>
              <div className="pdf-col">
                <label>Tratamento anterior</label>
                <span className="pdf-value">{formatarTexto(paciente.tratamento_anterior)}</span>
              </div>
              <div className="pdf-col">
                <label>Já foi ao dentista</label>
                <span className="pdf-value">{formatarSimNao(paciente.foi_dentista)}</span>
                {paciente.qual_dentista && (
                  <span style={{ color: "#059669", fontSize: "0.95em" }}>{paciente.qual_dentista}</span>
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
            <span className="pdf-value">{formatarTexto(paciente.alimentacao_notas)}</span>
            <label>Informações adicionais</label>
            <span className="pdf-value">{formatarTexto(paciente.informacoes_adicionais)}</span>
          </div>

          {/* Higiene Bucal */}
          <div className="glass-card rounded-2xl p-6 space-y-6 pdf-section">
            <div className="pdf-title flex items-center space-x-3 mb-3">
              <Smile className="w-5 h-5 text-emerald-400" />
              <span>Higiene Bucal</span>
            </div>
            <div className="pdf-grid">
              <div className="pdf-col">
                <label>Escova utilizada</label>
                <span className="pdf-value">{formatarTexto(paciente.escova_usa)}</span>
              </div>
              <div className="pdf-col">
                <label>Creme dental</label>
                <span className="pdf-value">{formatarTexto(paciente.creme_dental)}</span>
              </div>
              <div className="pdf-col">
                <label>Quem faz higiene</label>
                <span className="pdf-value">{formatarTexto(paciente.higiene_bucal)}</span>
              </div>
              <div className="pdf-col">
                <label>Vezes por dia</label>
                <span className="pdf-value">{paciente.vezes_dia_higiene || "Não informado"}</span>
              </div>
              <div className="pdf-col">
                <label>Tomou anestesia</label>
                <span className="pdf-value">{formatarSimNao(paciente.tomou_anestesia)}</span>
              </div>
              <div className="pdf-col">
                <label>Gengiva sangra</label>
                <span className="pdf-value">{formatarSimNao(paciente.gengiva_sangra)}</span>
              </div>
              <div className="pdf-col">
                <label>Extrações dentárias</label>
                <span className="pdf-value">{formatarSimNao(paciente.extracoes_dentarias)}</span>
              </div>
              <div className="pdf-col">
                <label>Escova a língua</label>
                <span className="pdf-value">{formatarSimNao(paciente.escova_lingua)}</span>
              </div>
              <div className="pdf-col">
                <label>Usa fio dental</label>
                <span className="pdf-value">{formatarSimNao(paciente.usa_fio_dental)}</span>
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
                    <div className="pdf-grid">
                      <div className="pdf-col">
                        <label>Data</label>
                        <span className="pdf-value">
                          {format(new Date(consulta.data_atendimento), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="pdf-col">
                        <label>Peso</label>
                        <span className="pdf-value">{consulta.peso} kg</span>
                      </div>
                      {consulta.observacoes && (
                        <div className="pdf-col" style={{ minWidth: 180 }}>
                          <label>Observações</label>
                          <span className="pdf-value">{consulta.observacoes}</span>
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
            <span className="pdf-value">{formatarTexto(paciente.responsavel_nome)}</span>
            <div style={{ display: "flex", alignItems: "center", marginTop: 9 }}>
              <span style={{
                display: "inline-flex", width: 17, height: 17, border: "1.5px solid #059669",
                borderRadius: 3, alignItems: "center", justifyContent: "center", marginRight: 7,
                background: paciente.informacoes_verdadeiras ? "#059669" : "#fff"
              }}>
                {paciente.informacoes_verdadeiras && (
                  <svg width="11" height="10" viewBox="0 0 20 20" fill="none">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="#fff" />
                  </svg>
                )}
              </span>
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
