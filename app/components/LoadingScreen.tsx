import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
      {/* Efectos de fondo azules */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3B82F6] rounded-full filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1D4ED8] rounded-full filter blur-[128px] opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-2xl blur-xl opacity-50 animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl flex items-center justify-center overflow-hidden border border-[#3B82F6]/30 shadow-2xl">
            <img 
              src="/CampusCoin.png" 
              alt="CAMPUS Logo" 
              className="w-full h-full object-contain p-4"
            />
          </div>
        </div>

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Texto de carga */}
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] animate-gradient">
          Cargando CAMPUS...
        </p>
        <p className="text-[#B8B8B8] mt-2">Tu marketplace universitario global</p>
      </div>
    </div>
  );
}; 