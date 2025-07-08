import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Paciente } from "@/entities/Paciente";
import { Consulta } from "@/entities/Consulta";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, FileText, User, Heart, Stethoscope, Smile, Activity, Baby, SmilePlus,
  Apple, Calendar, Edit3, Phone, MapPin, Download, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MapaDental from "../components/MapaDental";

// COLE SUA LOGO BASE64 AQUI
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // <-- troque pelo seu logo!

export default function VisualizarFicha() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pegar o ID do paciente da URL
  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get("id");

  useEffect(() => {
    if (pacienteId) {
      loadPaciente();
      loadConsultas();
    }
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
      const consultasPaciente = todasConsultas.filter(
        (c) => c.paciente_id === pacienteId
      );
      setConsultas(consultasPaciente);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para desenhar header/rodapé em cada página do PDF
  function addHeaderAndFooter(pdf, pageNum, totalPages, paciente) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // HEADER
    const margin = 10;
    const logoWidth = 30;
    const logoHeight = 12;
    if (LOGO_BASE64 && LOGO_BASE64.length > 30) {
      pdf.addImage(LOGO_BASE64, "PNG", margin, 7, logoWidth, logoHeight);
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Ficha de Anamnese Odontopediátrica", pdfWidth / 2, 16, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    // Data de exportação
    pdf.text(
      "Exportado em: " + format(new Date(), "dd/MM/yyyy HH:mm"),
      pdfWidth - margin,
      14,
      { align: "right" }
    );
    // Nome do paciente (opcional)
    if (paciente && paciente.nome_crianca) {
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text("Paciente: " + paciente.nome_crianca, margin, 24);
      pdf.setTextColor(0, 0, 0);
    }
    // LINHA separadora
    pdf.setLineWidth(0.3);
    pdf.line(margin, 26, pdfWidth - margin, 26);

    // FOOTER
    pdf.setLineWidth(0.1);
    pdf.line(margin, pdf.internal.pageSize.getHeight() - 15, pdfWidth - margin, pdf.internal.pageSize.getHeight() - 15);
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Página ${pageNum} de ${totalPages}`,
      pdfWidth / 2,
      pdf.internal.pageSize.getHeight() - 9,
      { align: "center" }
    );
    pdf.text(
      "Gerado pelo Sistema de Fichas",
      margin,
      pdf.internal.pageSize.getHeight() - 9
    );
    pdf.setTextColor(0, 0, 0);
  }

  // Exportação PDF profissional
  const handleExportPDF = async () => {
    setIsExporting(true);
    const input = document.getElementById("ficha-content");
    if (!input) {
      setIsExporting(false);
      return;
    }

    input.classList.add("pdf-export");

    setTimeout(async () => {
      try {
        const scale = 2;
        const canvas = await html2canvas(input, {
          scale,
          useCORS: true,
          backgroundColor: "#fff",
          width: input.scrollWidth,
          height: input.scrollHeight,
          windowWidth: input.scrollWidth,
          windowHeight: input.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20; // margens laterais
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // altura útil descontando header/rodapé
        const headerFooterHeight = 36;
        const usablePdfHeight = pdfHeight - headerFooterHeight * 2;

        let heightLeft = imgHeight;
        let position = headerFooterHeight;

        let pageNum = 1;
        let totalPages = Math.ceil(imgHeight / usablePdfHeight);

        // Primeira página
        pdf.addImage(
          imgData,
          "PNG",
          10,
          position,
          imgWidth,
          imgHeight
        );
        addHeaderAndFooter(pdf, pageNum, totalPages, paciente);

        heightLeft -= usablePdfHeight;

        // Demais páginas
        while (heightLeft > 0) {
          pdf.addPage();
          pageNum++;
          position = headerFooterHeight - (imgHeight - heightLeft);

          pdf.addImage(
            imgData,
            "PNG",
            10,
            position,
            imgWidth,
            imgHeight
          );
          addHeaderAndFooter(pdf, pageNum, totalPages, paciente);
          heightLeft -= usablePdfHeight;
        }

        pdf.save(
          `ficha_${paciente.nome_crianca.replace(/\s+/g, "_")}.pdf`
        );
      } catch (err) {
        console.error("Erro ao exportar PDF:", err);
      } finally {
        input.classList.remove("pdf-export");
        setIsExporting(false);
      }
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

  // Funções auxiliares
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

        <div className="space-y-8" id="ficha-content">
          {/* ...todo o conteúdo igual ao seu layout acima... */}
          {/* ...mantenha todas as seções (dados pessoais, pais, etc) exatamente como já está... */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
}

/* CSS SUGERIDO PARA PDF */
.pdf-export,
.pdf-export * {
  background: #fff !important;
  color: #000 !important;
  box-shadow: none !important;
  filter: none !important;
}
