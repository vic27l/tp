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

  const handleExportPDF = () => {
    setIsExporting(true);
    const input = document.getElementById('ficha-content');
    if (!input) {
      setIsExporting(false);
      return;
    }
  
    // Add PDF export class
    input.classList.add('pdf-export');
  
    // Wait for styles to apply
    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: input.scrollWidth,
        height: input.scrollHeight,
        scrollX: 0,
        scrollY: 0
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
        setIsExporting(false);
      });
    }, 100);
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
          {/* PDF Header */}
          <div className="pdf-export-header">
            <div className="pdf-export-logo-section">
              <div className="pdf-export-logo">Odontologia</div>
              <div className="pdf-export-title">FICHA DE</div>
              <div className="pdf-export-subtitle">ANAMNESE</div>
            </div>
            <div className="pdf-export-doctor-section">
              <div className="pdf-export-doctor-image" style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                FOTO DO<br />PROFISSIONAL
              </div>
            </div>
          </div>

          {/* PDF Form */}
          <div className="pdf-export-form">
            {/* Coluna Esquerda */}
            <div className="pdf-export-column">
              
              {/* Dados Pessoais */}
              <div className="pdf-export-field">
                <label>👤 Nome da Criança</label>
                <div className="pdf-export-field-value">{paciente.nome_crianca}</div>
              </div>

              <div className="pdf-export-row">
                <div className="pdf-export-field">
                  <label>📅 Data de Nascimento</label>
                  <div className="pdf-export-field-value">
                    {paciente.data_nascimento 
                      ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })
                      : "Não informado"
                    }
                  </div>
                </div>
                <div className="pdf-export-field">
                  <label>🎂 Idade</label>
                  <div className="pdf-export-field-value">{paciente.idade || "Não informado"}</div>
                </div>
              </div>

              <div className="pdf-export-field">
                <label>📞 Celular</label>
                <div className="pdf-export-field-value">{paciente.cel || "Não informado"}</div>
              </div>

              <div className="pdf-export-field">
                <label>📍 Endereço</label>
                <div className="pdf-export-field-value">{paciente.endereco || "Não informado"}</div>
              </div>

              <div className="pdf-export-row">
                <div className="pdf-export-field">
                  <label>🏘️ Bairro</label>
                  <div className="pdf-export-field-value">{paciente.bairro || "Não informado"}</div>
                </div>
                <div className="pdf-export-field">
                  <label>🏙️ Cidade</label>
                  <div className="pdf-export-field-value">{paciente.cidade || "Não informado"}</div>
                </div>
              </div>

              <div className="pdf-export-field">
                <label>📮 CEP</label>
                <div className="pdf-export-field-value">{paciente.cep || "Não informado"}</div>
              </div>

              {/* Dados dos Pais */}
              <div className="pdf-export-field">
                <label>👩 Nome da Mãe</label>
                <div className="pdf-export-field-value">{formatarTexto(paciente.nome_mae)}</div>
              </div>

              <div className="pdf-export-row">
                <div className="pdf-export-field">
                  <label>📊 Idade da Mãe</label>
                  <div className="pdf-export-field-value">{paciente.idade_mae || "Não informado"}</div>
                </div>
                <div className="pdf-export-field">
                  <label>💼 Profissão da Mãe</label>
                  <div className="pdf-export-field-value">{formatarTexto(paciente.profissao_mae)}</div>
                </div>
              </div>

              <div className="pdf-export-field">
                <label>👨 Nome do Pai</label>
                <div className="pdf-export-field-value">{formatarTexto(paciente.nome_pai)}</div>
              </div>

              <div className="pdf-export-row">
                <div className="pdf-export-field">
                  <label>📊 Idade do Pai</label>
                  <div className="pdf-export-field-value">{paciente.idade_pai || "Não informado"}</div>
                </div>
                <div className="pdf-export-field">
                  <label>💼 Profissão do Pai</label>
                  <div className="pdf-export-field-value">{formatarTexto(paciente.profissao_pai)}</div>
                </div>
              </div>

              {/* Motivo da Consulta */}
              <div className="pdf-export-text-field">
                <label>📝 Motivo da Consulta</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.motivo_consulta)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🤰 Alterações durante a Gestação</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.alteracao_gestacao)}</div>
              </div>

              {/* Necessidades Especiais */}
              <div className="pdf-export-checkbox-field">
                <label>❤️ Necessidade Especial</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.necessidade_especial === true ? 'checked' : ''}`}>
                      {paciente.necessidade_especial === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.necessidade_especial === false ? 'checked' : ''}`}>
                      {paciente.necessidade_especial === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.qual_necessidade && (
                  <div className="pdf-export-qual-field">{paciente.qual_necessidade}</div>
                )}
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🤲 Comprometimento de Coordenação</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_coordenacao === true ? 'checked' : ''}`}>
                      {paciente.comprometimento_coordenacao === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_coordenacao === false ? 'checked' : ''}`}>
                      {paciente.comprometimento_coordenacao === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.qual_coordenacao && (
                  <div className="pdf-export-qual-field">{paciente.qual_coordenacao}</div>
                )}
              </div>

              <div className="pdf-export-checkbox-field">
                <label>👁️ Comprometimento Visual</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_visual === true ? 'checked' : ''}`}>
                      {paciente.comprometimento_visual === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_visual === false ? 'checked' : ''}`}>
                      {paciente.comprometimento_visual === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.qual_visual && (
                  <div className="pdf-export-qual-field">{paciente.qual_visual}</div>
                )}
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🗣️ Comprometimento de Comunicação</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_comunicacao === true ? 'checked' : ''}`}>
                      {paciente.comprometimento_comunicacao === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.comprometimento_comunicacao === false ? 'checked' : ''}`}>
                      {paciente.comprometimento_comunicacao === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.qual_comunicacao && (
                  <div className="pdf-export-qual-field">{paciente.qual_comunicacao}</div>
                )}
              </div>

              <div className="pdf-export-text-field">
                <label>😤 Como reage quando contrariado</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.reacao_contrariado)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>👨‍⚕️ Como reage com profissionais</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.reacao_profissionais)}</div>
              </div>

            </div>

            {/* Coluna Direita */}
            <div className="pdf-export-column">
              
              {/* Histórico Médico */}
              <div className="pdf-export-checkbox-field">
                <label>🏥 Sofreu Cirurgia</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.sofreu_cirurgia === true ? 'checked' : ''}`}>
                      {paciente.sofreu_cirurgia === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.sofreu_cirurgia === false ? 'checked' : ''}`}>
                      {paciente.sofreu_cirurgia === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.qual_cirurgia && (
                  <div className="pdf-export-qual-field">{paciente.qual_cirurgia}</div>
                )}
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🩸 Alterações Sanguíneas</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.alteracoes_sanguineas === true ? 'checked' : ''}`}>
                      {paciente.alteracoes_sanguineas === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.alteracoes_sanguineas === false ? 'checked' : ''}`}>
                      {paciente.alteracoes_sanguineas === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🫁 Problemas Respiratórios</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_respiratorios === true ? 'checked' : ''}`}>
                      {paciente.problemas_respiratorios === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_respiratorios === false ? 'checked' : ''}`}>
                      {paciente.problemas_respiratorios === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🫀 Problemas Hepáticos</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_hepaticos === true ? 'checked' : ''}`}>
                      {paciente.problemas_hepaticos === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_hepaticos === false ? 'checked' : ''}`}>
                      {paciente.problemas_hepaticos === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>❤️ Cardiopatias</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.cardiopatias === true ? 'checked' : ''}`}>
                      {paciente.cardiopatias === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.cardiopatias === false ? 'checked' : ''}`}>
                      {paciente.cardiopatias === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🫄 Problemas Gástricos</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_gastricos === true ? 'checked' : ''}`}>
                      {paciente.problemas_gastricos === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.problemas_gastricos === false ? 'checked' : ''}`}>
                      {paciente.problemas_gastricos === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-field">
                <label>💊 Alergias - Medicamentos</label>
                <div className="pdf-export-field-value">{formatarTexto(paciente.alergias_medicamento)}</div>
              </div>

              <div className="pdf-export-field">
                <label>🍎 Alergias - Alimentares</label>
                <div className="pdf-export-field-value">{formatarTexto(paciente.alergias_alimentar)}</div>
              </div>

              <div className="pdf-export-field">
                <label>🌬️ Alergias - Respiratórias</label>
                <div className="pdf-export-field-value">{formatarTexto(paciente.alergias_respiratoria)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🩺 Tratamentos Atuais</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.tratamentos_atuais)}</div>
              </div>

              {/* Acompanhamentos */}
              <div className="pdf-export-checkbox-field">
                <label>🗣️ Fonoaudiologia</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.fonoaudiologia === true ? 'checked' : ''}`}>
                      {paciente.fonoaudiologia === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.fonoaudiologia === false ? 'checked' : ''}`}>
                      {paciente.fonoaudiologia === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🏃 Fisioterapia</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.fisioterapia === true ? 'checked' : ''}`}>
                      {paciente.fisioterapia === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.fisioterapia === false ? 'checked' : ''}`}>
                      {paciente.fisioterapia === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧠 Psicologia</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.psicologia === true ? 'checked' : ''}`}>
                      {paciente.psicologia === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.psicologia === false ? 'checked' : ''}`}>
                      {paciente.psicologia === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧑‍⚕️ Psiquiátrico</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.psiquiatrico === true ? 'checked' : ''}`}>
                      {paciente.psiquiatrico === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.psiquiatrico === false ? 'checked' : ''}`}>
                      {paciente.psiquiatrico === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div></div>

              <div className="pdf-export-checkbox-field">
                <label>🏥 Outros Acompanhamentos</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.outros_acompanhamentos === true ? 'checked' : ''}`}>
                      {paciente.outros_acompanhamentos === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.outros_acompanhamentos === false ? 'checked' : ''}`}>
                      {paciente.outros_acompanhamentos === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.quais_acompanhamentos && (
                  <div className="pdf-export-qual-field">{paciente.quais_acompanhamentos}</div>
                )}
              </div>

              {/* Hábitos Alimentares */}
              <div className="pdf-export-checkbox-field">
                <label>🍼 Mamadeira</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.mamadeira === true ? 'checked' : ''}`}>
                      {paciente.mamadeira === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.mamadeira === false ? 'checked' : ''}`}>
                      {paciente.mamadeira === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🍭 Chupeta</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupeta === true ? 'checked' : ''}`}>
                      {paciente.chupeta === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupeta === false ? 'checked' : ''}`}>
                      {paciente.chupeta === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>👍 Chupar Dedo</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupar_dedo === true ? 'checked' : ''}`}>
                      {paciente.chupar_dedo === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupar_dedo === false ? 'checked' : ''}`}>
                      {paciente.chupar_dedo === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🦷 Roer Unha</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.roer_unha === true ? 'checked' : ''}`}>
                      {paciente.roer_unha === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.roer_unha === false ? 'checked' : ''}`}>
                      {paciente.roer_unha === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>💊 Uso de Flúor</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.uso_fluor === true ? 'checked' : ''}`}>
                      {paciente.uso_fluor === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.uso_fluor === false ? 'checked' : ''}`}>
                      {paciente.uso_fluor === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-text-field">
                <label>🍽️ Frequência das Refeições</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_refeicoes)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🥤 Frequência de Doces</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_doces)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🪥 Frequência de Escovação</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_escovacao)}</div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧽 Usa Fio Dental</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_fio_dental === true ? 'checked' : ''}`}>
                      {paciente.usa_fio_dental === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_fio_dental === false ? 'checked' : ''}`}>
                      {paciente.usa_fio_dental === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧴 Usa Enxaguante</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_enxaguante === true ? 'checked' : ''}`}>
                      {paciente.usa_enxaguante === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_enxaguante === false ? 'checked' : ''}`}>
                      {paciente.usa_enxaguante === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-text-field">
                <label>📝 Observações</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.observacoes)}</div>
              </div>

            </div>
          </div>

          {/* Mapa Dental */}
          <div className="pdf-export-dental-map">
            <h3 className="pdf-export-section-title">MAPA DENTAL</h3>
            <MapaDental readonly={true} />
          </div>

          {/* Assinaturas */}
          <div className="pdf-export-signatures">
            <div className="pdf-export-signature">
              <div className="pdf-export-signature-line"></div>
              <div className="pdf-export-signature-text">Assinatura do Responsável</div>
            </div>
            <div className="pdf-export-signature">
              <div className="pdf-export-signature-line"></div>
              <div className="pdf-export-signature-text">Assinatura do Profissional</div>
            </div>
          </div>
        </div>

        {/* Seção de Consultas - Visível apenas na tela */}
        <div className="screen-only space-y-6">
          {/* Histórico de Consultas */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Histórico de Consultas
              </h2>
              <button
                onClick={() => navigate(createPageUrl("NovaConsulta", { paciente_id: paciente.id }))}
                className="glass-button px-4 py-2 rounded-lg text-white font-medium hover:bg-emerald-500/30 transition-all"
              >
                Nova Consulta
              </button>
            </div>

            {consultas.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/70 mb-4">Nenhuma consulta registrada</p>
                <button
                  onClick={() => navigate(createPageUrl("NovaConsulta", { paciente_id: paciente.id }))}
                  className="glass-button px-6 py-3 rounded-lg text-white font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  Registrar Primeira Consulta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((consulta) => (
                  <div key={consulta.id} className="glass-card rounded-lg p-4 hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {consulta.data_consulta 
                              ? format(new Date(consulta.data_consulta), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              : "Data não informada"
                            }
                          </h3>
                          <p className="text-white/70 text-sm">
                            {consulta.motivo_consulta || "Consulta de rotina"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(createPageUrl("VisualizarConsulta", { id: consulta.id }))}
                        className="glass-button p-2 rounded-lg text-white hover:bg-emerald-500/30 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    {consulta.observacoes && (
                      <div className="mt-3 pl-13">
                        <p className="text-white/80 text-sm">{consulta.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
