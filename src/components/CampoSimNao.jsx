import React from "react";

export default function CampoSimNao({ 
  label, 
  value, 
  onChange, 
  textField = null,
  textValue = "",
  onTextChange = null,
  required = false 
}) {
  return (
    <div className="space-y-2">
      <label className="text-white font-medium text-sm">
        {label}
        {required && <span className="text-red-300 ml-1">*</span>}
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === true
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'glass-button text-white hover:bg-white/30'
            }`}
          >
            SIM
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === false
                ? 'bg-red-500 text-white shadow-lg'
                : 'glass-button text-white hover:bg-white/30'
            }`}
          >
            NÃO
          </button>
        </div>
        
        {textField && (
          <div className="flex-1">
            <input
              type="text"
              placeholder={textField}
              value={textValue}
              onChange={(e) => onTextChange?.(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}