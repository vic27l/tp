import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Paciente } from "@/entities/Paciente";
import { Consulta } from "@/entities/Consulta";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, FileText, User, Heart, Stethoscope, Smile, Activity, Baby, SmilePlus,
  Apple, Calendar, Loader2, Phone, MapPin, Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MapaDental from "../components/MapaDental";

// Loads logo from public/logo.png
async function getLogoBase64() {
  try {
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return null; // Return null if the logo can't be loaded
  }
}

export default function VisualizarFicha() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get("id");

  useEffect(() => {
    if (pacienteId) {
      loadPaciente();
      loadConsultas();
    } else {
        setIsLoading(false); // If no ID, stop loading
    }
    // eslint-disable-next-line
  }, [pacienteId]);

  const loadPaciente = async () => {
    try {
      const pacientes = await Paciente.list();
      const pacienteEncontrado = pacientes.find((p) => p.id === pacienteId);
      setPaciente(pacienteEncontrado);
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
    }
  };

  const loadConsultas = async () => {
    try {
      const todasConsultas = await Consulta.list();
      const consultasPaciente = todasConsultas
        .filter((c) => c.paciente_id === pacienteId)
        .sort((a,b) => new Date(b.data_atendimento) - new Date(a.data_atendimento));
      setConsultas(consultasPaciente);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addHeaderAndFooter = (pdf, totalPages, paciente, logoBase64) => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const logoW = 30, logoH = 13;

    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Header
        if (logoBase64) {
            pdf.addImage(logoBase64, "PNG", margin, 7, logoW, logoH);
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Ficha de Anamnese Odontopediátrica", pdfWidth / 2, 16, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(
            "Exportado em: " + format(new Date(), "dd/MM/yyyy HH:mm"),
            pdfWidth - margin,
            14,
            { align: "right" }
        );
        if (paciente && paciente.nome_crianca) {
            pdf.setFontSize(10);
            pdf.setTextColor(50, 50, 50);
            pdf.text("Paciente: " + paciente.nome_crianca, margin, 24);
            pdf.setTextColor(0, 0, 0);
        }
        pdf.setLineWidth(0.3);
        pdf.line(margin, 26, pdfWidth - margin, 26);

        // Footer
        pdf.setLineWidth(0.1);
        pdf.line(margin, pdfHeight - 15, pdfWidth - margin, pdfHeight - 15);
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
            `Página ${i} de ${totalPages}`,
            pdfWidth / 2,
            pdfHeight - 9,
            { align: "center" }
        );
        pdf.text(
            "Gerado pelo Sistema de Fichas",
            margin,
            pdfHeight - 9
        );
        pdf.setTextColor(0, 0, 0);
    }
  };

  async function handleExportPDF() {
    setIsExporting(true);
    const container = contentRef.current;
    if (!container) {
      setIsExporting(false);
      return;
    }

    container.classList.add("pdf-export");

    try {
        const logoBase64 = await getLogoBase64();
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 10;
        const contentWidth = pdfWidth - (margin * 2);
        const headerHeight = 30;
        const footerHeight = 20;
        const usablePdfHeight = pdf.internal.pageSize.getHeight() - headerHeight - footerHeight;
        let currentY = headerHeight;

        const contentBlocks = Array.from(container.children);

        for (const block of contentBlocks) {
            const canvas = await html2canvas(block, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = contentWidth / imgWidth;
            const imgHeightMm = imgHeight * ratio;

            if (currentY + imgHeightMm > usablePdfHeight + headerHeight && currentY > headerHeight) {
                pdf.addPage();
                currentY = headerHeight;
            }

            pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeightMm);
            currentY += imgHeightMm + 4;
        }

        const totalPages = pdf.internal.getNumberOfPages();
        addHeaderAndFooter(pdf, totalPages, paciente, logoBase64);

        pdf.save(`ficha_${paciente.nome_crianca.replace(/\s+/g, "_")}.pdf`);

    } catch (err) {
        console.error("Erro ao exportar PDF:", err);
    } finally {
        container.classList.remove("pdf-export");
        setIsExporting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-white mx-auto mb-4" />
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
          <p className="text-white/70 mb-6">Não foi possível encontrar os dados deste paciente. Verifique se o ID na URL está correto.</p>
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

  const formatarTexto = (texto) => texto || "Não informado";

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

        {/* Content to be exported */}
        <div className="space-y-2" ref={contentRef}>
          {/* -------- DADOS PESSOAIS -------- */}
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
                    : "Não informado"}
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

          {/* -------- DADOS DOS PAIS -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Dados dos Pais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-emerald-300">Mãe</h3>
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Nome</label>
                  <p className="text-white">{formatarTexto(paciente.nome_mae)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Idade</label>
                    <p className="text-white">{paciente.idade_mae || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Profissão</label>
                    <p className="text-white">{formatarTexto(paciente.profissao_mae)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-emerald-300">Pai</h3>
                <div>
                  <label className="text-emerald-200 text-sm font-medium">Nome</label>
                  <p className="text-white">{formatarTexto(paciente.nome_pai)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Idade</label>
                    <p className="text-white">{paciente.idade_pai || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-emerald-200 text-sm font-medium">Profissão</label>
                    <p className="text-white">{formatarTexto(paciente.profissao_pai)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* -------- MOTIVO DA CONSULTA -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Motivo da Consulta</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Motivo da consulta</label>
                <p className="text-white">{formatarTexto(paciente.motivo_consulta)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alterações durante a gestação</label>
                <p className="text-white">{formatarTexto(paciente.alteracao_gestacao)}</p>
              </div>
            </div>
          </div>

          {/* -------- NECESSIDADES ESPECIAIS -------- */}
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
               <div>
                <label className="text-emerald-200 text-sm font-medium">Como reage quando contrariado</label>
                <p className="text-white">{formatarTexto(paciente.reacao_contrariado)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Como reage com profissionais</label>
                <p className="text-white">{formatarTexto(paciente.reacao_profissionais)}</p>
              </div>
            </div>
          </div>

          {/* -------- HISTÓRICO MÉDICO -------- */}
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
                <label className="text-emerald-200 text-sm font-medium">Alergias a medicamentos</label>
                <p className="text-white">{formatarTexto(paciente.alergias_medicamento)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alergias alimentares</label>
                <p className="text-white">{formatarTexto(paciente.alergias_alimentar)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alergias respiratórias</label>
                <p className="text-white">{formatarTexto(paciente.alergias_respiratoria)}</p>
              </div>
            </div>
            <div>
              <label className="text-emerald-200 text-sm font-medium">Tratamentos atuais</label>
              <p className="text-white">{formatarTexto(paciente.tratamentos_atuais)}</p>
            </div>
          </div>

          {/* -------- ACOMPANHAMENTOS E HÁBITOS -------- */}
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
                <p className="text-white">{formatarTexto(paciente.outro_tratamento)}</p>
              </div>
            </div>
            <div>
              <label className="text-emerald-200 text-sm font-medium">Portador de IST</label>
              <p className="text-white">{formatarTexto(paciente.portador_ist)}</p>
            </div>
          </div>

          {/* -------- HÁBITOS ALIMENTARES E COMPORTAMENTAIS -------- */}
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
                <p className="text-white">{formatarTexto(paciente.engasga_vomita)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Chupa o dedo</label>
                <p className="text-white">{formatarTexto(paciente.chupa_dedo)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Chupa chupeta</label>
                <p className="text-white">{formatarTexto(paciente.chupa_chupeta)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Outros hábitos</label>
                <p className="text-white">{formatarTexto(paciente.outros_habitos)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Range os dentes</label>
                <p className="text-white">{formatarTexto(paciente.range_dentes)}</p>
              </div>
            </div>
          </div>

          {/* -------- HISTÓRICO ODONTOLÓGICO -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <SmilePlus className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Histórico Odontológico</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Idade na primeira consulta</label>
                <p className="text-white">{paciente.anos_primeira_consulta || "Não informado"}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Tratamento anterior</label>
                <p className="text-white">{formatarTexto(paciente.tratamento_anterior)}</p>
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

          {/* -------- ALIMENTAÇÃO E OUTRAS INFORMAÇÕES -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Apple className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Alimentação e Outras Informações</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Alimentação</label>
                <p className="text-white">{formatarTexto(paciente.alimentacao_notas)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Informações adicionais</label>
                <p className="text-white">{formatarTexto(paciente.informacoes_adicionais)}</p>
              </div>
            </div>
          </div>

          {/* -------- HIGIENE BUCAL -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Smile className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Higiene Bucal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-emerald-200 text-sm font-medium">Escova utilizada</label>
                <p className="text-white">{formatarTexto(paciente.escova_usa)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Creme dental</label>
                <p className="text-white">{formatarTexto(paciente.creme_dental)}</p>
              </div>
              <div>
                <label className="text-emerald-200 text-sm font-medium">Quem faz higiene</label>
                <p className="text-white">{formatarTexto(paciente.higiene_bucal)}</p>
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

          {/* -------- MAPA DENTAL -------- */}
          {paciente.mapa_dental && paciente.mapa_dental.length > 0 && (
            <MapaDental
              selectedTeeth={paciente.mapa_dental}
              onTeethChange={() => {}} // Read-only
              readOnly={true}
            />
          )}

          {/* -------- HISTÓRICO DE CONSULTAS -------- */}
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
                        <div className="md:col-span-3">
                          <label className="text-emerald-200 text-sm font-medium">Observações</label>
                          <p className="text-white whitespace-pre-wrap">{consulta.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------- RESPONSÁVEL -------- */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Responsável</h2>
            <div>
              <label className="text-emerald-200 text-sm font-medium">Nome do Responsável</label>
              <p className="text-white">{formatarTexto(paciente.responsavel_nome)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
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
