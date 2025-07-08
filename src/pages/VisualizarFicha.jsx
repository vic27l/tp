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

  // Corrigido: Exportação fiel ao layout, multipágina, e com ajuste de estilos.
  const handleExportPDF = async () => {
    setIsExporting(true);
    const input = document.getElementById("ficha-content");
    if (!input) {
      setIsExporting(false);
      return;
    }

    // Adiciona classe para ajustar estilos para PDF (ex: fundo branco, tira sombra, etc)
    input.classList.add("pdf-export");

    // Aguarda os estilos serem aplicados
    setTimeout(async () => {
      try {
        const scale = 2; // qualidade, pode ajustar
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

        // Dimensões da imagem em px
        const imgWidthPx = canvas.width;
        const imgHeightPx = canvas.height;

        // Dimensões da imagem em mm (proporção para A4)
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Adiciona primeira página
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pdfHeight;

        // Adiciona páginas extras se necessário
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
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
    }, 200); // tempo para garantir aplicação dos estilos
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

        {/* Conteúdo principal */}
        <div className="space-y-8" id="ficha-content">
          {/* ...todos os seus cards e seções exatamente como no seu código original... */}

          {/* ---- Cole e mantenha todo o restante do seu JSX igual ao seu código acima ---- */}
          {/* (Não altere o conteúdo das seções, apenas mantenha o id="ficha-content" na div principal do conteúdo!) */}

          {/* ... */}
        </div>
      </div>
    </div>
  );
}

/* -------------- RECOMENDAÇÃO DE CSS PARA PDF ------------------

Adicione ao seu CSS global:

.pdf-export {
  background: #fff !important;
  box-shadow: none !important;
  color: #000 !important;
}
.pdf-export * {
  background: transparent !important;
  box-shadow: none !important;
  color: #000 !important;
}
@media print {
  .pdf-export {
    background: #fff !important;
    box-shadow: none !important;
    color: #000 !important;
  }
  .pdf-export * {
    background: transparent !important;
    box-shadow: none !important;
    color: #000 !important;
  }
}

--------------------------------------------------------------*/
