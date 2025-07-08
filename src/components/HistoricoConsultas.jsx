import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, Copyright as Weight } from "lucide-react";

export default function HistoricoConsultas({ 
  consultas = [], 
  onAddConsulta 
}) {
  const [novaConsulta, setNovaConsulta] = useState({
    data_atendimento: "",
    peso: ""
  });

  const handleAddConsulta = () => {
    if (novaConsulta.data_atendimento && novaConsulta.peso) {
      onAddConsulta(novaConsulta);
      setNovaConsulta({ data_atendimento: "", peso: "" });
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Histórico de Consultas</h3>
      
      {/* Adicionar nova consulta */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-white font-medium text-sm mb-2 block">
              Data do Atendimento
            </label>
            <input
              type="date"
              value={novaConsulta.data_atendimento}
              onChange={(e) => setNovaConsulta({...novaConsulta, data_atendimento: e.target.value})}
              className="w-full px-3 py-2 glass-input rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          
          <div>
            <label className="text-white font-medium text-sm mb-2 block">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 25.5"
              value={novaConsulta.peso}
              onChange={(e) => setNovaConsulta({...novaConsulta, peso: e.target.value})}
              className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddConsulta}
              className="w-full glass-button px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center space-x-2 hover:bg-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de consultas */}
      <div className="space-y-3">
        {consultas.map((consulta, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  {format(new Date(consulta.data_atendimento), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Weight className="w-4 h-4" />
                <span>{consulta.peso} kg</span>
              </div>
            </div>
          </div>
        ))}
        
        {consultas.length === 0 && (
          <div className="text-center py-8 text-white/70">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma consulta registrada ainda</p>
            <p className="text-sm">Adicione a primeira consulta acima</p>
          </div>
        )}
      </div>
    </div>
  );
}