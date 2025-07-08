import React, { useState } from "react";
import { Paciente } from "@/entities/Paciente";
import { Consulta } from "@/entities/Consulta";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Save, FileText, User, Heart, Stethoscope, Smile, Activity, Baby, SmilePlus, Apple, Edit3 } from "lucide-react";

import CampoSimNao from "../components/CampoSimNao";
import MapaDental from "../components/MapaDental";
import HistoricoConsultas from "../components/HistoricoConsultas";

export default function NovaFicha() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_crianca: "",
    data_nascimento: "",
    idade: "",
    endereco: "",
    bairro: "",
    cep: "",
    cidade: "",
    cel: "",
    nome_mae: "",
    idade_mae: "",
    profissao_mae: "",
    nome_pai: "",
    idade_pai: "",
    profissao_pai: "",
    motivo_consulta: "",
    alteracao_gestacao: "",
    necessidade_especial: null,
    qual_necessidade: "",
    comprometimento_coordenacao: null,
    qual_coordenacao: "",
    comprometimento_visual: null,
    qual_visual: "",
    comprometimento_comunicacao: null,
    qual_comunicacao: "",
    reacao_contrariado: "",
    reacao_profissionais: "",
    sofreu_cirurgia: null,
    qual_cirurgia: "",
    alteracoes_sanguineas: null,
    problemas_respiratorios: null,
    problemas_hepaticos: null,
    cardiopatias: null,
    problemas_gastricos: null,
    alergias_medicamento: "",
    alergias_alimentar: "",
    alergias_respiratoria: "",
    tratamentos_atuais: "",
    escova_usa: "",
    creme_dental: "",
    anos_primeira_consulta: "",
    tratamento_anterior: "",
    tomou_anestesia: null,
    higiene_bucal: "",
    vezes_dia_higiene: "",
    gengiva_sangra: null,
    extracoes_dentarias: null,
    escova_lingua: null,
    usa_fio_dental: null,
    alimentacao_notas: "",
    fonoaudiologia: null,
    fisioterapia: null,
    psicologia: null,
    psiquiatrico: null,
    psiquiatrico_to: null,
    outro_tratamento: "",
    portador_ist: "",
    mama_peito: null,
    mamou_peito: null,
    ate_quando_mamou: "",
    toma_mamadeira: null,
    tomou_mamadeira: null,
    ate_quando_mamadeira: "",
    engasga_vomita: "",
    chupa_dedo: "",
    chupa_chupeta: "",
    outros_habitos: "",
    range_dentes: "",
    foi_dentista: null,
    qual_dentista: "",
    mapa_dental: [],
    responsavel_nome: "",
    informacoes_verdadeiras: false,
    informacoes_adicionais: ""
  });

  const [consultas, setConsultas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddConsulta = (consulta) => {
    setConsultas(prev => [...prev, consulta]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome_crianca.trim()) {
      alert('Nome da criança é obrigatório');
      return;
    }
    
    if (!formData.responsavel_nome.trim()) {
      alert('Nome do responsável é obrigatório');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Criar uma cópia dos dados do formulário
      const payload = { ...formData };
      
      // Campos numéricos que devem ser convertidos ou definidos como null
      const numberFields = ['idade', 'idade_mae', 'idade_pai', 'anos_primeira_consulta', 'vezes_dia_higiene'];
      
      // Converter campos numéricos
      for (const field of numberFields) {
        if (payload[field] === '' || payload[field] === null || payload[field] === undefined) {
          payload[field] = null;
        } else {
          const num = Number(payload[field]);
          payload[field] = isNaN(num) ? null : num;
        }
      }
      
      // Garantir que campos de texto vazios sejam null em vez de string vazia
      const textFields = [
        'endereco', 'bairro', 'cep', 'cidade', 'cel', 'nome_mae', 'profissao_mae',
        'nome_pai', 'profissao_pai', 'motivo_consulta', 'alteracao_gestacao',
        'qual_necessidade', 'qual_coordenacao', 'qual_visual', 'qual_comunicacao',
        'reacao_contrariado', 'reacao_profissionais', 'qual_cirurgia',
        'alergias_medicamento', 'alergias_alimentar', 'alergias_respiratoria',
        'tratamentos_atuais', 'escova_usa', 'creme_dental', 'tratamento_anterior',
        'higiene_bucal', 'alimentacao_notas', 'outro_tratamento', 'portador_ist',
        'ate_quando_mamou', 'ate_quando_mamadeira', 'engasga_vomita', 'chupa_dedo',
        'chupa_chupeta', 'outros_habitos', 'range_dentes', 'qual_dentista',
        'informacoes_adicionais'
      ];
      
      for (const field of textFields) {
        if (payload[field] === '') {
          payload[field] = null;
        }
      }
      
      // Garantir que a data de nascimento seja válida
      if (payload.data_nascimento === '') {
        payload.data_nascimento = null;
      }
      
      // Garantir que o mapa dental seja um array válido
      if (!Array.isArray(payload.mapa_dental)) {
        payload.mapa_dental = [];
      }

      console.log('Payload sendo enviado:', payload);
      
      // Criar o paciente
      const paciente = await Paciente.create(payload);
      
      console.log('Paciente criado:', paciente);
      
      // Se há consultas para adicionar
      if (consultas.length > 0) {
        const consultasPayload = consultas.map(c => ({
          ...c,
          paciente_id: paciente.id,
          peso: Number(c.peso) || null,
          observacoes: c.observacoes || null,
          procedimentos: c.procedimentos || null
        }));
        
        console.log('Consultas sendo criadas:', consultasPayload);
        await Consulta.bulkCreate(consultasPayload);
      }
      
      // Redirecionar para o dashboard
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      alert('Erro ao salvar a ficha. Tente novamente.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nova Ficha de Anamnese</h1>
          <p className="text-emerald-100">Preencha as informações do paciente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Pessoais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Dados Pessoais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Nome da Criança *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_crianca}
                  onChange={(e) => handleInputChange("nome_crianca", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Idade
                </label>
                <input
                  type="number"
                  value={formData.idade}
                  onChange={(e) => handleInputChange("idade", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Celular
                </label>
                <input
                  type="tel"
                  value={formData.cel}
                  onChange={(e) => handleInputChange("cel", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Endereço
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Dados dos Pais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Dados dos Pais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-emerald-300">Mãe</h3>
                <div>
                  <label className="text-white font-medium text-sm mb-2 block">
                    Nome da Mãe
                  </label>
                  <input
                    type="text"
                    value={formData.nome_mae}
                    onChange={(e) => handleInputChange("nome_mae", e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-medium text-sm mb-2 block">
                      Idade
                    </label>
                    <input
                      type="number"
                      value={formData.idade_mae}
                      onChange={(e) => handleInputChange("idade_mae", e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-white font-medium text-sm mb-2 block">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profissao_mae}
                      onChange={(e) => handleInputChange("profissao_mae", e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-emerald-300">Pai</h3>
                <div>
                  <label className="text-white font-medium text-sm mb-2 block">
                    Nome do Pai
                  </label>
                  <input
                    type="text"
                    value={formData.nome_pai}
                    onChange={(e) => handleInputChange("nome_pai", e.target.value)}
                    className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-medium text-sm mb-2 block">
                      Idade
                    </label>
                    <input
                      type="number"
                      value={formData.idade_pai}
                      onChange={(e) => handleInputChange("idade_pai", e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-white font-medium text-sm mb-2 block">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profissao_pai}
                      onChange={(e) => handleInputChange("profissao_pai", e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
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
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Qual o motivo da consulta?
              </label>
              <textarea
                value={formData.motivo_consulta}
                onChange={(e) => handleInputChange("motivo_consulta", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
                placeholder="Descreva o motivo da consulta..."
              />
            </div>
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Mãe teve alguma alteração durante a gestação?
              </label>
              <textarea
                value={formData.alteracao_gestacao}
                onChange={(e) => handleInputChange("alteracao_gestacao", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
                placeholder="Descreva as alterações..."
              />
            </div>
          </div>

          {/* Necessidades Especiais */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Necessidades Especiais</h2>
            </div>
            
            <div className="space-y-4">
              <CampoSimNao
                label="Possui necessidade especial?"
                value={formData.necessidade_especial}
                onChange={(value) => handleInputChange("necessidade_especial", value)}
                textField="Qual?"
                textValue={formData.qual_necessidade}
                onTextChange={(value) => handleInputChange("qual_necessidade", value)}
              />
              
              <CampoSimNao
                label="Possui comprometimento de coordenação motora?"
                value={formData.comprometimento_coordenacao}
                onChange={(value) => handleInputChange("comprometimento_coordenacao", value)}
                textField="Qual?"
                textValue={formData.qual_coordenacao}
                onTextChange={(value) => handleInputChange("qual_coordenacao", value)}
              />
              
              <CampoSimNao
                label="Possui comprometimento visual?"
                value={formData.comprometimento_visual}
                onChange={(value) => handleInputChange("comprometimento_visual", value)}
                textField="Qual?"
                textValue={formData.qual_visual}
                onTextChange={(value) => handleInputChange("qual_visual", value)}
              />
              
              <CampoSimNao
                label="Possui comprometimento de comunicação?"
                value={formData.comprometimento_comunicacao}
                onChange={(value) => handleInputChange("comprometimento_comunicacao", value)}
                textField="Qual?"
                textValue={formData.qual_comunicacao}
                onTextChange={(value) => handleInputChange("qual_comunicacao", value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Como o paciente reage quando é contrariado?
                </label>
                <textarea
                  value={formData.reacao_contrariado}
                  onChange={(e) => handleInputChange("reacao_contrariado", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-20 resize-none"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Como o paciente reage diante de profissionais da saúde?
                </label>
                <textarea
                  value={formData.reacao_profissionais}
                  onChange={(e) => handleInputChange("reacao_profissionais", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Histórico Médico */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Stethoscope className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Histórico Médico</h2>
            </div>
            
            <div className="space-y-4">
              <CampoSimNao
                label="Sofreu alguma cirurgia?"
                value={formData.sofreu_cirurgia}
                onChange={(value) => handleInputChange("sofreu_cirurgia", value)}
                textField="Qual?"
                textValue={formData.qual_cirurgia}
                onTextChange={(value) => handleInputChange("qual_cirurgia", value)}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoSimNao
                  label="Alterações sanguíneas?"
                  value={formData.alteracoes_sanguineas}
                  onChange={(value) => handleInputChange("alteracoes_sanguineas", value)}
                />
                
                <CampoSimNao
                  label="Problemas respiratórios?"
                  value={formData.problemas_respiratorios}
                  onChange={(value) => handleInputChange("problemas_respiratorios", value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CampoSimNao
                  label="Problemas hepáticos?"
                  value={formData.problemas_hepaticos}
                  onChange={(value) => handleInputChange("problemas_hepaticos", value)}
                />
                
                <CampoSimNao
                  label="Cardiopatias?"
                  value={formData.cardiopatias}
                  onChange={(value) => handleInputChange("cardiopatias", value)}
                />
              </div>
              
              <CampoSimNao
                label="Problemas gástricos?"
                value={formData.problemas_gastricos}
                onChange={(value) => handleInputChange("problemas_gastricos", value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Alergias a medicamentos
                </label>
                <input
                  type="text"
                  value={formData.alergias_medicamento}
                  onChange={(e) => handleInputChange("alergias_medicamento", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Alergias alimentares
                </label>
                <input
                  type="text"
                  value={formData.alergias_alimentar}
                  onChange={(e) => handleInputChange("alergias_alimentar", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Alergias respiratórias
                </label>
                <input
                  type="text"
                  value={formData.alergias_respiratoria}
                  onChange={(e) => handleInputChange("alergias_respiratoria", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Tratamentos atuais
              </label>
              <textarea
                value={formData.tratamentos_atuais}
                onChange={(e) => handleInputChange("tratamentos_atuais", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-20 resize-none"
              />
            </div>
          </div>

          {/* Acompanhamentos e Hábitos */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Acompanhamentos e Hábitos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <CampoSimNao
                label="Fonoaudiologia?"
                value={formData.fonoaudiologia}
                onChange={(value) => handleInputChange("fonoaudiologia", value)}
              />
              <CampoSimNao
                label="Fisioterapia?"
                value={formData.fisioterapia}
                onChange={(value) => handleInputChange("fisioterapia", value)}
              />
              <CampoSimNao
                label="Psicologia?"
                value={formData.psicologia}
                onChange={(value) => handleInputChange("psicologia", value)}
              />
              <div className="flex items-center space-x-4">
                <CampoSimNao
                  label="Psiquiátrico?"
                  value={formData.psiquiatrico}
                  onChange={(value) => handleInputChange("psiquiatrico", value)}
                />
                 <CampoSimNao
                  label="TO?"
                  value={formData.psiquiatrico_to}
                  onChange={(value) => handleInputChange("psiquiatrico_to", value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Outro tratamento?
              </label>
              <input
                type="text"
                value={formData.outro_tratamento}
                onChange={(e) => handleInputChange("outro_tratamento", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                É portador de alguma IST?
              </label>
              <input
                type="text"
                value={formData.portador_ist}
                onChange={(e) => handleInputChange("portador_ist", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Baby className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Hábitos</h2>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <CampoSimNao
                label="Paciente mama no peito?"
                value={formData.mama_peito}
                onChange={(value) => handleInputChange("mama_peito", value)}
              />
              <CampoSimNao
                label="Já mamou no peito?"
                value={formData.mamou_peito}
                onChange={(value) => handleInputChange("mamou_peito", value)}
                textField="Até quando?"
                textValue={formData.ate_quando_mamou}
                onTextChange={(value) => handleInputChange("ate_quando_mamou", value)}
              />
               <CampoSimNao
                label="Paciente toma mamadeira?"
                value={formData.toma_mamadeira}
                onChange={(value) => handleInputChange("toma_mamadeira", value)}
              />
              <CampoSimNao
                label="Já tomou mamadeira?"
                value={formData.tomou_mamadeira}
                onChange={(value) => handleInputChange("tomou_mamadeira", value)}
                textField="Até quando?"
                textValue={formData.ate_quando_mamadeira}
                onTextChange={(value) => handleInputChange("ate_quando_mamadeira", value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">Engasga ou vomita com facilidade?</label>
                <input type="text" value={formData.engasga_vomita} onChange={(e) => handleInputChange("engasga_vomita", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">Chupa o dedo?</label>
                <input type="text" value={formData.chupa_dedo} onChange={(e) => handleInputChange("chupa_dedo", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">Chupa chupeta?</label>
                <input type="text" value={formData.chupa_chupeta} onChange={(e) => handleInputChange("chupa_chupeta", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">Possui outros hábitos?</label>
                <input type="text" value={formData.outros_habitos} onChange={(e) => handleInputChange("outros_habitos", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">Range os dentes?</label>
                <input type="text" value={formData.range_dentes} onChange={(e) => handleInputChange("range_dentes", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <SmilePlus className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Histórico Odontológico</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="text-white font-medium text-sm mb-2 block">Quantos anos na primeira consulta?</label>
                  <input type="number" value={formData.anos_primeira_consulta} onChange={(e) => handleInputChange("anos_primeira_consulta", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
               </div>
               <div>
                  <label className="text-white font-medium text-sm mb-2 block">Como foi o tratamento anterior?</label>
                  <input type="text" value={formData.tratamento_anterior} onChange={(e) => handleInputChange("tratamento_anterior", e.target.value)} className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60"/>
               </div>
            </div>
             <CampoSimNao
                label="Já foi ao dentista?"
                value={formData.foi_dentista}
                onChange={(value) => handleInputChange("foi_dentista", value)}
                textField="Qual?"
                textValue={formData.qual_dentista}
                onTextChange={(value) => handleInputChange("qual_dentista", value)}
              />
          </div>

          {/* Higiene Bucal */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Smile className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Higiene Bucal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Qual escova usa?
                </label>
                <input
                  type="text"
                  value={formData.escova_usa}
                  onChange={(e) => handleInputChange("escova_usa", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Qual creme dental usa?
                </label>
                <input
                  type="text"
                  value={formData.creme_dental}
                  onChange={(e) => handleInputChange("creme_dental", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Quem faz a higiene bucal?
                </label>
                <input
                  type="text"
                  value={formData.higiene_bucal}
                  onChange={(e) => handleInputChange("higiene_bucal", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-white font-medium text-sm mb-2 block">
                  Quantas vezes ao dia?
                </label>
                <input
                  type="number"
                  value={formData.vezes_dia_higiene}
                  onChange={(e) => handleInputChange("vezes_dia_higiene", e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <CampoSimNao
                label="Já tomou anestesia?"
                value={formData.tomou_anestesia}
                onChange={(value) => handleInputChange("tomou_anestesia", value)}
              />
              
              <CampoSimNao
                label="Gengiva sangra com facilidade?"
                value={formData.gengiva_sangra}
                onChange={(value) => handleInputChange("gengiva_sangra", value)}
              />
              
              <CampoSimNao
                label="Já realizou extrações dentárias?"
                value={formData.extracoes_dentarias}
                onChange={(value) => handleInputChange("extracoes_dentarias", value)}
              />
              
              <CampoSimNao
                label="Escova a língua?"
                value={formData.escova_lingua}
                onChange={(value) => handleInputChange("escova_lingua", value)}
              />
              
              <CampoSimNao
                label="Usa fio dental?"
                value={formData.usa_fio_dental}
                onChange={(value) => handleInputChange("usa_fio_dental", value)}
              />
            </div>
          </div>

          {/* Alimentação e Outras Informações */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
             <div className="flex items-center space-x-3 mb-6">
              <Apple className="w-6 h-6 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">Alimentação e Outras Informações</h2>
            </div>
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Vamos falar sobre a alimentação do paciente:
              </label>
              <textarea
                value={formData.alimentacao_notas}
                onChange={(e) => handleInputChange("alimentacao_notas", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
              />
            </div>
             <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Alguma informação adicional não relatada?
              </label>
              <textarea
                value={formData.informacoes_adicionais}
                onChange={(e) => handleInputChange("informacoes_adicionais", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 h-24 resize-none"
              />
            </div>
          </div>
          
          {/* Mapa Dental */}
          <MapaDental 
            selectedTeeth={formData.mapa_dental}
            onTeethChange={(teeth) => handleInputChange("mapa_dental", teeth)}
          />

          {/* Histórico de Consultas */}
          <HistoricoConsultas 
            consultas={consultas}
            onAddConsulta={handleAddConsulta}
          />

          {/* Responsável */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Responsável</h2>
            
            <div>
              <label className="text-white font-medium text-sm mb-2 block">
                Nome do Responsável *
              </label>
              <input
                type="text"
                required
                value={formData.responsavel_nome}
                onChange={(e) => handleInputChange("responsavel_nome", e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="informacoes_verdadeiras"
                checked={formData.informacoes_verdadeiras}
                onChange={(e) => handleInputChange("informacoes_verdadeiras", e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-white/20 border-white/30 rounded focus:ring-emerald-500"
              />
              <label htmlFor="informacoes_verdadeiras" className="text-white text-sm">
                Declaro que todas as informações prestadas são verdadeiras
              </label>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button px-8 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Salvando..." : "Salvar Ficha"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}