import React, { useState } from "react";

const dentes = [
  { id: 55, position: "top-left", label: "55" },
  { id: 54, position: "top-left", label: "54" },
  { id: 53, position: "top-left", label: "53" },
  { id: 52, position: "top-left", label: "52" },
  { id: 51, position: "top-left", label: "51" },
  { id: 61, position: "top-right", label: "61" },
  { id: 62, position: "top-right", label: "62" },
  { id: 63, position: "top-right", label: "63" },
  { id: 64, position: "top-right", label: "64" },
  { id: 65, position: "top-right", label: "65" },
  { id: 18, position: "top-left-adult", label: "18" },
  { id: 17, position: "top-left-adult", label: "17" },
  { id: 16, position: "top-left-adult", label: "16" },
  { id: 15, position: "top-left-adult", label: "15" },
  { id: 14, position: "top-left-adult", label: "14" },
  { id: 13, position: "top-left-adult", label: "13" },
  { id: 12, position: "top-left-adult", label: "12" },
  { id: 11, position: "top-left-adult", label: "11" },
  { id: 21, position: "top-right-adult", label: "21" },
  { id: 22, position: "top-right-adult", label: "22" },
  { id: 23, position: "top-right-adult", label: "23" },
  { id: 24, position: "top-right-adult", label: "24" },
  { id: 25, position: "top-right-adult", label: "25" },
  { id: 26, position: "top-right-adult", label: "26" },
  { id: 27, position: "top-right-adult", label: "27" },
  { id: 28, position: "top-right-adult", label: "28" },
  { id: 48, position: "bottom-left-adult", label: "48" },
  { id: 47, position: "bottom-left-adult", label: "47" },
  { id: 46, position: "bottom-left-adult", label: "46" },
  { id: 45, position: "bottom-left-adult", label: "45" },
  { id: 44, position: "bottom-left-adult", label: "44" },
  { id: 43, position: "bottom-left-adult", label: "43" },
  { id: 42, position: "bottom-left-adult", label: "42" },
  { id: 41, position: "bottom-left-adult", label: "41" },
  { id: 31, position: "bottom-right-adult", label: "31" },
  { id: 32, position: "bottom-right-adult", label: "32" },
  { id: 33, position: "bottom-right-adult", label: "33" },
  { id: 34, position: "bottom-right-adult", label: "34" },
  { id: 35, position: "bottom-right-adult", label: "35" },
  { id: 36, position: "bottom-right-adult", label: "36" },
  { id: 37, position: "bottom-right-adult", label: "37" },
  { id: 38, position: "bottom-right-adult", label: "38" },
  { id: 85, position: "bottom-left", label: "85" },
  { id: 84, position: "bottom-left", label: "84" },
  { id: 83, position: "bottom-left", label: "83" },
  { id: 82, position: "bottom-left", label: "82" },
  { id: 81, position: "bottom-left", label: "81" },
  { id: 71, position: "bottom-right", label: "71" },
  { id: 72, position: "bottom-right", label: "72" },
  { id: 73, position: "bottom-right", label: "73" },
  { id: 74, position: "bottom-right", label: "74" },
  { id: 75, position: "bottom-right", label: "75" }
];

export default function MapaDental({ selectedTeeth = [], onTeethChange }) {
  const [selected, setSelected] = useState(selectedTeeth);

  const handleToothClick = (denteId) => {
    const newSelected = selected.includes(denteId)
      ? selected.filter(id => id !== denteId)
      : [...selected, denteId];
    
    setSelected(newSelected);
    onTeethChange(newSelected);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Mapa Dental</h3>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
        {/* Dentes superiores adultos */}
        <div className="flex justify-center space-x-1">
          {dentes.filter(d => d.position === "top-left-adult").reverse().map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-8 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
          {dentes.filter(d => d.position === "top-right-adult").map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-8 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
        </div>
        
        {/* Dentes superiores criança */}
        <div className="flex justify-center space-x-1">
          {dentes.filter(d => d.position === "top-left").reverse().map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-6 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
          {dentes.filter(d => d.position === "top-right").map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-6 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
        </div>
        
        <div className="h-4 border-l-2 border-white/30 mx-auto w-0"></div>
        
        {/* Dentes inferiores criança */}
        <div className="flex justify-center space-x-1">
          {dentes.filter(d => d.position === "bottom-left").reverse().map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-6 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
          {dentes.filter(d => d.position === "bottom-right").map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-6 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
        </div>
        
        {/* Dentes inferiores adultos */}
        <div className="flex justify-center space-x-1">
          {dentes.filter(d => d.position === "bottom-left-adult").reverse().map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-8 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
          {dentes.filter(d => d.position === "bottom-right-adult").map(dente => (
            <button
              key={dente.id}
              onClick={() => handleToothClick(dente.id)}
              className={`w-6 h-8 text-xs font-mono border rounded-sm transition-all ${
                selected.includes(dente.id)
                  ? 'bg-red-500 border-red-600 text-white shadow-lg'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              {dente.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-white/80 text-center">
        Clique nos dentes para selecionar problemas dentários
      </div>
    </div>
  );
}