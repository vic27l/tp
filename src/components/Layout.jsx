import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Calendar, Settings } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/bg.png)'}}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-teal-700/80 to-cyan-800/80"></div>
      
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <img 
                  src="/logo.png" 
                  alt="Tio Paulo Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tio Paulo</h1>
                <p className="text-emerald-100 text-sm">Ficha de Anamnese</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              <Link 
                to={createPageUrl("Dashboard")} 
                className={`glass-button px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 ${
                  location.pathname === createPageUrl("Dashboard") ? 'bg-white/30' : ''
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pacientes</span>
              </Link>
              <Link 
                to={createPageUrl("NovaFicha")} 
                className={`glass-button px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 ${
                  location.pathname === createPageUrl("NovaFicha") ? 'bg-white/30' : ''
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Nova Ficha</span>
              </Link>
              <Link 
                to={createPageUrl("Consultas")} 
                className={`glass-button px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 ${
                  location.pathname === createPageUrl("Consultas") ? 'bg-white/30' : ''
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Consultas</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-20">
        {children}
      </main>
    </div>
  );
}