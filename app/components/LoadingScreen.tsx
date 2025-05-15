import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFA500] rounded-full filter blur-[128px] opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="text-center relative z-10">
        {/* Logo */}
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl blur-xl opacity-50 animate-pulse" />
          <div className="relative w-full h-full bg-[#1A1A1A] rounded-2xl flex items-center justify-center overflow-hidden">
            <img 
              src="/Ensigna.png" 
              alt="CampusCoin Logo" 
              className="w-full h-full object-contain p-4"
            />
          </div>
        </div>

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Texto de carga */}
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] animate-gradient">
          Cargando CampusCoin...
        </p>
        <p className="text-[#B8B8B8] mt-2">Tu ecosistema universitario inteligente</p>
      </div>
    </div>
  );
}; 