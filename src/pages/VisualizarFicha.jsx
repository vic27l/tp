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
import "../styles/pdf-export.css";

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
    input.style.display = 'block';
  
    // Wait for styles to apply
    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#1e5128',
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
        
        // Calculate image dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / ratio;
        
        // If image is taller than page, scale it down
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * ratio;
        }
        
        let heightLeft = imgHeight;
        let position = 0;
  
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
  
        // Add additional pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save(`ficha_anamnese_${paciente.nome_crianca.replace(/\s+/g, '_')}.pdf`);
        
      }).catch(err => {
        console.error("Error exporting PDF:", err);
        alert("Erro ao exportar PDF. Tente novamente.");
      }).finally(() => {
        // Remove PDF export class and hide
        input.classList.remove('pdf-export');
        input.style.display = 'none';
        setIsExporting(false);
      });
    }, 500);
  };

  const formatarSimNao = (valor) => {
    if (valor === true) return "SIM";
    if (valor === false) return "NÃO";
    return "";
  };

  const formatarTexto = (texto) => {
    return texto || "";
  };

  const renderPDFContent = () => (
    <div className="pdf-export-content">
      {/* Header */}
      <div className="pdf-export-header">
        <div className="pdf-export-logo-section">
          <div className="pdf-export-logo">Tio Paulo</div>
          <div className="pdf-export-title">FICHA DE</div>
          <div className="pdf-export-subtitle">ANAMNESE</div>
        </div>
        <div className="pdf-export-doctor-section">
          <img 
            src="/logo.png" 
            alt="Dr. Paulo" 
            className="pdf-export-doctor-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div style="width: 200px; height: 200px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">FOTO</div>';
            }}
          />
        </div>
      </div>

      {/* Formulário com duas colunas */}
      <div className="pdf-export-form">
        {/* Coluna Esquerda */}
        <div className="pdf-export-column">
          {/* Nome da Criança */}
          <div className="pdf-export-field with-icon">
            <label>NOME DA CRIANÇA:</label>
            <div className="pdf-export-field-value">{paciente.nome_crianca}</div>
          </div>

          {/* Data de Nascimento e Idade */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>DATA DE NASCIMENTO:</label>
              <div className="pdf-export-field-value">
                {paciente.data_nascimento 
                  ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })
                  : ""
                }
              </div>
            </div>
            <div className="pdf-export-field">
              <label>IDADE:</label>
              <div className="pdf-export-field-value">{paciente.idade || ""}</div>
            </div>
          </div>

          {/* Endereço */}
          <div className="pdf-export-field">
            <label>ENDEREÇO:</label>
            <div className="pdf-export-field-value">{paciente.endereco || ""}</div>
          </div>

          {/* Bairro e CEP */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>BAIRRO:</label>
              <div className="pdf-export-field-value">{paciente.bairro || ""}</div>
            </div>
            <div className="pdf-export-field">
              <label>CEP:</label>
              <div className="pdf-export-field-value">{paciente.cep || ""}</div>
            </div>
          </div>

          {/* Cidade e Cel */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>CIDADE:</label>
              <div className="pdf-export-field-value">{paciente.cidade || ""}</div>
            </div>
            <div className="pdf-export-field">
              <label>CEL:</label>
              <div className="pdf-export-field-value">{paciente.cel || ""}</div>
            </div>
          </div>

          {/* Nome da Mãe */}
          <div className="pdf-export-field with-icon">
            <label>NOME DA MÃE:</label>
            <div className="pdf-export-field-value">{paciente.nome_mae || ""}</div>
          </div>

          {/* Idade e Profissão da Mãe */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>IDADE:</label>
              <div className="pdf-export-field-value">{paciente.idade_mae || ""}</div>
            </div>
            <div className="pdf-export-field">
              <label>PROFISSÃO:</label>
              <div className="pdf-export-field-value">{paciente.profissao_mae || ""}</div>
            </div>
          </div>

          {/* Nome do Pai */}
          <div className="pdf-export-field with-icon">
            <label>NOME DO PAI:</label>
            <div className="pdf-export-field-value">{paciente.nome_pai || ""}</div>
          </div>

          {/* Idade e Profissão do Pai */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>IDADE:</label>
              <div className="pdf-export-field-value">{paciente.idade_pai || ""}</div>
            </div>
            <div className="pdf-export-field">
              <label>PROFISSÃO:</label>
              <div className="pdf-export-field-value">{paciente.profissao_pai || ""}</div>
            </div>
          </div>

          {/* Motivo da Consulta */}
          <div className="pdf-export-text-field">
            <label>QUAL O MOTIVO DA CONSULTA:</label>
            <div className="pdf-export-text-field-value">{paciente.motivo_consulta || ""}</div>
          </div>

          {/* Alteração na Gestação */}
          <div className="pdf-export-text-field">
            <label>MÃE TEVE ALGUMA ALTERAÇÃO DURANTE A GESTAÇÃO:</label>
            <div className="pdf-export-text-field-value">{paciente.alteracao_gestacao || ""}</div>
          </div>

          {/* Necessidade Especial */}
          <div className="pdf-export-checkbox-field">
            <label>POSSUI NECESSIDADE ESPECIAL?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.necessidade_especial) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.necessidade_especial) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.necessidade_especial) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.necessidade_especial) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
            <div className="pdf-export-qual-field">{paciente.qual_necessidade || ""}</div>
          </div>

          {/* Comprometimento de Coordenação */}
          <div className="pdf-export-checkbox-field">
            <label>POSSUI COMPROMETIMENTO DE COORDENAÇÃO MOTORA?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_coordenacao) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_coordenacao) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_coordenacao) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_coordenacao) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
            <div className="pdf-export-qual-field">{paciente.qual_coordenacao || ""}</div>
          </div>

          {/* Comprometimento Visual */}
          <div className="pdf-export-checkbox-field">
            <label>POSSUI COMPROMETIMENTO VISUAL?:</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_visual) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_visual) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_visual) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_visual) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
            <div className="pdf-export-qual-field">{paciente.qual_visual || ""}</div>
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="pdf-export-column">
          {/* Comprometimento de Comunicação */}
          <div className="pdf-export-checkbox-field">
            <label>POSSUI COMPROMETIMENTO DE COMUNICAÇÃO?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_comunicacao) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_comunicacao) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.comprometimento_comunicacao) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.comprometimento_comunicacao) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
            <div className="pdf-export-qual-field">{paciente.qual_comunicacao || ""}</div>
          </div>

          {/* Como reage quando contrariado */}
          <div className="pdf-export-text-field">
            <label>COMO O PACIENTE REAGE QUANDO É CONTRARIADO?</label>
            <div className="pdf-export-text-field-value">{paciente.reacao_contrariado || ""}</div>
          </div>

          {/* Como reage com profissionais */}
          <div className="pdf-export-text-field">
            <label>COMO O PACIENTE REAGE DIANTE DE PROFISSIONAIS DA SAÚDE?</label>
            <div className="pdf-export-text-field-value">{paciente.reacao_profissionais || ""}</div>
          </div>

          {/* Sofreu Cirurgia */}
          <div className="pdf-export-checkbox-field">
            <label>SOFREU ALGUMA CIRURGIA ?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.sofreu_cirurgia) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.sofreu_cirurgia) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.sofreu_cirurgia) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.sofreu_cirurgia) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
            <div className="pdf-export-qual-field">{paciente.qual_cirurgia || ""}</div>
          </div>

          {/* Alterações Sanguíneas */}
          <div className="pdf-export-checkbox-field">
            <label>ALTERAÇÕES SANGUÍNEAS?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.alteracoes_sanguineas) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.alteracoes_sanguineas) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.alteracoes_sanguineas) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.alteracoes_sanguineas) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
          </div>

          {/* Problemas Respiratórios */}
          <div className="pdf-export-checkbox-field">
            <label>PROBLEMAS RESPIRATÓRIOS?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_respiratorios) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_respiratorios) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_respiratorios) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_respiratorios) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
          </div>

          {/* Problemas Hepáticos */}
          <div className="pdf-export-checkbox-field">
            <label>PROBLEMAS HEPÁTICOS?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_hepaticos) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_hepaticos) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_hepaticos) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_hepaticos) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
          </div>

          {/* Cardiopatias */}
          <div className="pdf-export-checkbox-field">
            <label>CARDIOPATIAS?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.cardiopatias) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.cardiopatias) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.cardiopatias) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.cardiopatias) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
          </div>

          {/* Problemas Gástricos */}
          <div className="pdf-export-checkbox-field">
            <label>PROBLEMAS GÁSTRICOS?</label>
            <div className="pdf-export-checkbox-container">
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_gastricos) === "SIM" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_gastricos) === "SIM" ? "SIM" : "SIM"}
                </div>
              </div>
              <div className="pdf-export-checkbox">
                <div className={`pdf-export-checkbox-box ${formatarSimNao(paciente.problemas_gastricos) === "NÃO" ? "checked" : ""}`}>
                  {formatarSimNao(paciente.problemas_gastricos) === "NÃO" ? "NÃO" : "NÃO"}
                </div>
              </div>
            </div>
          </div>

          {/* Alergias Medicamento */}
          <div className="pdf-export-field">
            <label>ALERGIAS MEDICAMENTO:</label>
            <div className="pdf-export-field-value">{paciente.alergias_medicamento || ""}</div>
          </div>

          {/* Alergias Alimentar e Respiratória */}
          <div className="pdf-export-row">
            <div className="pdf-export-field">
              <label>ALERGIAS ALIMENTAR:</label>
              <div className="pdf-export-field-value">{paciente.alergias_alimentar || ""}</div>
            </div>
            <div className="pdf-export-field">
              <label>ALERGIAS RESPIRATÓRIA:</label>
              <div className="pdf-export-field-value">{paciente.alergias_respiratoria || ""}</div>
            </div>
          </div>

          {/* Tratamentos Atuais */}
          <div className="pdf-export-text-field">
            <label>TRATAMENTOS ATUAIS :</label>
            <div className="pdf-export-text-field-value">{paciente.tratamentos_atuais || ""}</div>
          </div>

          {/* Qual Escova Usa */}
          <div className="pdf-export-field">
            <label>QUAL ESCOVA USA:</label>
            <div className="pdf-export-field-value">{paciente.escova_usa || ""}</div>
          </div>

          {/* Qual Creme Dental Usa */}
          <div className="pdf-export-field">
            <label>QUAL CREME DENTAL USA:</label>
            <div className="pdf-export-field-value">{paciente.creme_dental || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const formatarTextoDisplay = (texto) => {
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

        {/* Conteúdo para PDF (oculto na tela) */}
        <div id="ficha-content" style={{ display: 'none' }}>
          {renderPDFContent()}
        </div>

        {/* Conteúdo para visualização na tela */}
        <div className="space-y-8">
          {/* Dados Pessoais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Dados Pessoais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Nome da Criança</label>
                <p className="text-white text-lg">{paciente.nome_crianca}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Data de Nascimento</label>
                <p className="text-white">
                  {paciente.data_nascimento 
                    ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })
                    : "Não informado"
                  }
                  {paciente.idade && <span className="text-emerald-200 ml-2">({paciente.idade} anos)</span>}
                </p>
              </div>
              {paciente.cel && (
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Celular</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-300" />
                    <p className="text-white">{paciente.cel}</p>
                  </div>
                </div>
              )}
              {paciente.endereco && (
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Endereço</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-300 mt-1" />
                    <div className="text-white">
                      <p>{paciente.endereco}</p>
                      <p className="text-sm text-emerald-200">
                        {paciente.bairro} - {paciente.cidade} - {paciente.cep}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dados dos Pais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Dados dos Pais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-emerald-300">Mãe</h3>
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Nome</label>
                  <p className="text-white">{formatarTextoDisplay(paciente.nome_mae)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Idade</label>
                    <p className="text-white">{paciente.idade_mae || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Profissão</label>
                    <p className="text-white">{formatarTextoDisplay(paciente.profissao_mae)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-emerald-300">Pai</h3>
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Nome</label>
                  <p className="text-white">{formatarTextoDisplay(paciente.nome_pai)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Idade</label>
                    <p className="text-white">{paciente.idade_pai || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Profissão</label>
                    <p className="text-white">{formatarTextoDisplay(paciente.profissao_pai)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivo da Consulta */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Motivo da Consulta</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Motivo da consulta</label>
                <p className="text-white">{formatarTextoDisplay(paciente.motivo_consulta)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alterações durante a gestação</label>
                <p className="text-white">{formatarTextoDisplay(paciente.alteracao_gestacao)}</p>
              </div>
            </div>
          </div>

          {/* Necessidades Especiais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Necessidades Especiais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Necessidade especial</label>
                <p className="text-white">{formatarSimNao(paciente.necessidade_especial)}</p>
                {paciente.qual_necessidade && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_necessidade}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Comprometimento de coordenação</label>
                <p className="text-white">{formatarSimNao(paciente.comprometimento_coordenacao)}</p>
                {paciente.qual_coordenacao && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_coordenacao}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Comprometimento visual</label>
                <p className="text-white">{formatarSimNao(paciente.comprometimento_visual)}</p>
                {paciente.qual_visual && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_visual}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Comprometimento de comunicação</label>
                <p className="text-white">{formatarSimNao(paciente.comprometimento_comunicacao)}</p>
                {paciente.qual_comunicacao && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_comunicacao}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Como reage quando contrariado</label>
                <p className="text-white">{formatarTextoDisplay(paciente.reacao_contrariado)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Como reage com profissionais</label>
                <p className="text-white">{formatarTextoDisplay(paciente.reacao_profissionais)}</p>
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Stethoscope className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Histórico Médico</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Sofreu cirurgia</label>
                <p className="text-white">{formatarSimNao(paciente.sofreu_cirurgia)}</p>
                {paciente.qual_cirurgia && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_cirurgia}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alterações sanguíneas</label>
                <p className="text-white">{formatarSimNao(paciente.alteracoes_sanguineas)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Problemas respiratórios</label>
                <p className="text-white">{formatarSimNao(paciente.problemas_respiratorios)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Problemas hepáticos</label>
                <p className="text-white">{formatarSimNao(paciente.problemas_hepaticos)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Cardiopatias</label>
                <p className="text-white">{formatarSimNao(paciente.cardiopatias)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Problemas gástricos</label>
                <p className="text-white">{formatarSimNao(paciente.problemas_gastricos)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alergias medicamentos</label>
                <p className="text-white">{formatarTextoDisplay(paciente.alergias_medicamento)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alergias alimentares</label>
                <p className="text-white">{formatarTextoDisplay(paciente.alergias_alimentar)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alergias respiratórias</label>
                <p className="text-white">{formatarTextoDisplay(paciente.alergias_respiratoria)}</p>
              </div>
            </div>
            
            <div>
              <label className="text-emerald-200 text-sm font-medium">Tratamentos atuais</label>
              <p className="text-white">{formatarTextoDisplay(paciente.tratamentos_atuais)}</p>
            </div>
          </div>

          {/* Acompanhamentos e Hábitos */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Acompanhamentos e Hábitos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Fonoaudiologia</label>
                <p className="text-white">{formatarSimNao(paciente.fonoaudiologia)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Fisioterapia</label>
                <p className="text-white">{formatarSimNao(paciente.fisioterapia)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Psicologia</label>
                <p className="text-white">{formatarSimNao(paciente.psicologia)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Psiquiátrico</label>
                <p className="text-white">{formatarSimNao(paciente.psiquiatrico)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Terapia Ocupacional</label>
                <p className="text-white">{formatarSimNao(paciente.psiquiatrico_to)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Outro tratamento</label>
                <p className="text-white">{formatarTextoDisplay(paciente.outro_tratamento)}</p>
              </div>
            </div>
            
            <div>
              <label className="text-emerald-200 text-sm font-medium">Portador de IST</label>
              <p className="text-white">{formatarTextoDisplay(paciente.portador_ist)}</p>
            </div>
          </div>

          {/* Hábitos Alimentares e Comportamentais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Baby className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Hábitos Alimentares e Comportamentais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Mama no peito</label>
                <p className="text-white">{formatarSimNao(paciente.mama_peito)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Já mamou no peito</label>
                <p className="text-white">{formatarSimNao(paciente.mamou_peito)}</p>
                {paciente.ate_quando_mamou && (
                  <p className="text-emerald-200 text-sm mt-1">Até: {paciente.ate_quando_mamou}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Toma mamadeira</label>
                <p className="text-white">{formatarSimNao(paciente.toma_mamadeira)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Já tomou mamadeira</label>
                <p className="text-white">{formatarSimNao(paciente.tomou_mamadeira)}</p>
                {paciente.ate_quando_mamadeira && (
                  <p className="text-emerald-200 text-sm mt-1">Até: {paciente.ate_quando_mamadeira}</p>
                )}
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Engasga ou vomita</label>
                <p className="text-white">{formatarTextoDisplay(paciente.engasga_vomita)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Chupa o dedo</label>
                <p className="text-white">{formatarTextoDisplay(paciente.chupa_dedo)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Chupa chupeta</label>
                <p className="text-white">{formatarTextoDisplay(paciente.chupa_chupeta)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Outros hábitos</label>
                <p className="text-white">{formatarTextoDisplay(paciente.outros_habitos)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Range os dentes</label>
                <p className="text-white">{formatarTextoDisplay(paciente.range_dentes)}</p>
              </div>
            </div>
          </div>

          {/* Histórico Odontológico */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <SmilePlus className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Histórico Odontológico</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Anos na primeira consulta</label>
                <p className="text-white">{paciente.anos_primeira_consulta || "Não informado"}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Tratamento anterior</label>
                <p className="text-white">{formatarTextoDisplay(paciente.tratamento_anterior)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Já foi ao dentista</label>
                <p className="text-white">{formatarSimNao(paciente.foi_dentista)}</p>
                {paciente.qual_dentista && (
                  <p className="text-emerald-200 text-sm mt-1">{paciente.qual_dentista}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alimentação e Outras Informações */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Apple className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Alimentação e Outras Informações</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alimentação</label>
                <p className="text-white">{formatarTextoDisplay(paciente.alimentacao_notas)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Informações adicionais</label>
                <p className="text-white">{formatarTextoDisplay(paciente.informacoes_adicionais)}</p>
              </div>
            </div>
          </div>

          {/* Higiene Bucal */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Smile className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Higiene Bucal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Escova utilizada</label>
                <p className="text-white">{formatarTextoDisplay(paciente.escova_usa)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Creme dental</label>
                <p className="text-white">{formatarTextoDisplay(paciente.creme_dental)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Quem faz higiene</label>
                <p className="text-white">{formatarTextoDisplay(paciente.higiene_bucal)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Vezes por dia</label>
                <p className="text-white">{paciente.vezes_dia_higiene || "Não informado"}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Tomou anestesia</label>
                <p className="text-white">{formatarSimNao(paciente.tomou_anestesia)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Gengiva sangra</label>
                <p className="text-white">{formatarSimNao(paciente.gengiva_sangra)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Extrações dentárias</label>
                <p className="text-white">{formatarSimNao(paciente.extracoes_dentarias)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Escova a língua</label>
                <p className="text-white">{formatarSimNao(paciente.escova_lingua)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Usa fio dental</label>
                <p className="text-white">{formatarSimNao(paciente.usa_fio_dental)}</p>
              </div>
            </div>
          </div>

          {/* Mapa Dental */}
          {paciente.mapa_dental && paciente.mapa_dental.length > 0 && (
            <div>
              <MapaDental 
                selectedTeeth={paciente.mapa_dental}
                onTeethChange={() => {}} // Read-only
              />
            </div>
          )}

          {/* Histórico de Consultas */}
          {consultas.length > 0 && (
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-6 h-6 text-emerald-300" />
                <h2 className="text-xl font-semibold text-white">Histórico de Consultas</h2>
              </div>
              
              <div className="space-y-3">
                {consultas.map((consulta, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-emerald-200 text-sm font-medium">Data</label>
                        <p className="text-white">
                          {format(new Date(consulta.data_atendimento), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <label className="text-emerald-200 text-sm font-medium">Peso</label>
                        <p className="text-white">{consulta.peso} kg</p>
                      </div>
                      {consulta.observacoes && (
                        <div>
                          <label className="text-emerald-200 text-sm font-medium">Observações</label>
                          <p className="text-white">{consulta.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsável */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Responsável</h2>
            
            <div>
              <label className="text-emerald-200 text-sm font-medium">Nome do Responsável</label>
              <p className="text-white">{formatarTextoDisplay(paciente.responsavel_nome)}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded border-2 ${
                paciente.informacoes_verdadeiras 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-white/30'
              }`}>
                {paciente.informacoes_verdadeiras && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-white text-sm">
                Declaro que todas as informações prestadas são verdadeiras
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

