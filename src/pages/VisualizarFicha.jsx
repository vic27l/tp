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

async function getLogoBase64() {
  const response = await fetch("/logo.png");
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export default function VisualizarFicha() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const blocoRefs = useRef([]);

  const urlParams = new URLSearchParams(window.location.search);
  const pacienteId = urlParams.get("id");

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

  function addHeaderAndFooter(pdf, pageNum, totalPages, paciente, logoBase64) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const logoW = 30, logoH = 13;

    // Header
    if (logoBase64 && logoBase64.length > 30) {
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
      `Página ${pageNum} de ${totalPages}`,
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

  // Função para exportação PDF bloco a bloco
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const logoBase64 = await getLogoBase64();
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 10;
      const marginRight = 10;
      const headerFooterHeight = 36;
      const usablePdfHeight = pdfHeight - headerFooterHeight * 2;
      const imgWidthMm = pdfWidth - marginLeft - marginRight;

      // Renderiza cada bloco/card como imagem separada
      let blocoImgs = [];
      for (let i = 0; i < blocoRefs.current.length; i++) {
        const bloco = blocoRefs.current[i];
        if (!bloco) continue;
        bloco.classList.add("pdf-export");
        // Aguarda renderização correta do CSS
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 10));
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(bloco, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });
        blocoImgs.push({
          img: canvas.toDataURL("image/png"),
          heightPx: canvas.height,
          widthPx: canvas.width,
        });
        bloco.classList.remove("pdf-export");
      }

      // px para mm
      const pxPerMm = blocoImgs[0] ? blocoImgs[0].widthPx / imgWidthMm : 2.6; // fallback

      let actualY = headerFooterHeight;
      let pageNum = 1;
      let totalPages = 1;
      let heightsByPage = [];
      let blocksByPage = [[]];

      // Pré-calcula distribuição dos blocos por página
      for (let i = 0; i < blocoImgs.length; i++) {
        const blocoH_mm = blocoImgs[i].heightPx / pxPerMm;
        if (actualY + blocoH_mm > pdfHeight - headerFooterHeight - 2) {
          // Nova página
          heightsByPage.push(actualY);
          actualY = headerFooterHeight;
          blocksByPage.push([]);
          totalPages++;
        }
        blocksByPage[blocksByPage.length - 1].push(i);
        actualY += blocoH_mm + 2;
      }
      heightsByPage.push(actualY);

      // Monta o PDF
      pageNum = 1;
      for (let p = 0; p < blocksByPage.length; p++) {
        if (p > 0) pdf.addPage();
        let y = headerFooterHeight;
        for (let b = 0; b < blocksByPage[p].length; b++) {
          const idx = blocksByPage[p][b];
          const bloco = blocoImgs[idx];
          const blocoH_mm = bloco.heightPx / pxPerMm;
          pdf.addImage(
            bloco.img,
            "PNG",
            marginLeft,
            y,
            imgWidthMm,
            blocoH_mm
          );
          y += blocoH_mm + 2;
        }
        addHeaderAndFooter(pdf, pageNum, totalPages, paciente, logoBase64);
        pageNum++;
      }

      pdf.save(
        `ficha_${paciente.nome_crianca.replace(/\s+/g, "_")}.pdf`
      );
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
    } finally {
      setIsExporting(false);
    }
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
  const formatarTexto = (texto) => texto || "Não informado";

  // Blocos separados e referenciados para exportação PDF bloco a bloco
  blocoRefs.current = [];
  let blocoIdx = 0;
  function blocoRef(idx) {
    return el => (blocoRefs.current[idx] = el);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
        <div className="space-y-4" id="ficha-content">
          {/* Cada bloco recebe ref={blocoRef(idx++)} */}
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Dados Pessoais... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Dados dos Pais... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Motivo da Consulta... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Necessidades Especiais... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Histórico Médico... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Acompanhamentos e Hábitos... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Hábitos Alimentares e Comportamentais... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Histórico Odontológico... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Alimentação e Outras Informações... */}</div>
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Higiene Bucal... */}</div>
          {paciente.mapa_dental && paciente.mapa_dental.length > 0 && (
            <div ref={blocoRef(blocoIdx++)}>
              <MapaDental
                selectedTeeth={paciente.mapa_dental}
                onTeethChange={() => {}} // Read-only
              />
            </div>
          )}
          {consultas.length > 0 && (
            <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Histórico de Consultas... */}</div>
          )}
          <div ref={blocoRef(blocoIdx++)} className="glass-card rounded-2xl p-6 space-y-6">{/* ...Responsável... */}</div>
        </div>
      </div>
    </div>
  );
}

// CSS PARA O PDF (adicione ao seu global.css)
/*
.pdf-export,
.pdf-export * {
  background: #fff !important;
  color: #000 !important;
  box-shadow: none !important;
  filter: none !important;
}
*/
