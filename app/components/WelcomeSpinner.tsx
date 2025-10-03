"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeSpinnerProps {
  onComplete: (discount: number) => void;
}

const discounts = [10, 20, 30, 40, 50, 60];
const colors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'
];

// Colores estilo casino con efectos de brillo
const casinoColors = [
  'linear-gradient(45deg, #FF0000, #FF6666, #FF0000)',
  'linear-gradient(45deg, #00FF00, #66FF66, #00FF00)', 
  'linear-gradient(45deg, #0000FF, #6666FF, #0000FF)',
  'linear-gradient(45deg, #FFFF00, #FFFF66, #FFFF00)',
  'linear-gradient(45deg, #FF00FF, #FF66FF, #FF00FF)',
  'linear-gradient(45deg, #00FFFF, #66FFFF, #00FFFF)'
];

export default function WelcomeSpinner({ onComplete }: WelcomeSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedDiscount(null);
    setShowCongratulations(false);
    
    // Calcular rotación aleatoria (múltiplo de 60 grados + extra)
    const randomIndex = Math.floor(Math.random() * discounts.length);
    const extraRotations = 5 + Math.random() * 3; // 5-8 vueltas extra
    const finalRotation = 360 * extraRotations + (randomIndex * 60);
    
    setRotation(prev => prev + finalRotation);
    
    // Después de la animación, mostrar resultado
    setTimeout(() => {
      setSelectedDiscount(discounts[randomIndex]);
      setShowCongratulations(true);
      
      // Después de 3 segundos, proceder al marketplace
      setTimeout(() => {
        onComplete(discounts[randomIndex]);
      }, 3000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full filter blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] rounded-full filter blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center">
        {/* Título de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] mb-4">
            ¡Bienvenido a CampusCoin!
          </h1>
          <p className="text-xl md:text-2xl text-white font-semibold">
            Gira la ruleta y gana tu descuento especial
          </p>
        </motion.div>

        {/* Máquina de Casino - Ruleta */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-6 md:mb-8"
        >
          {/* Marco de la máquina de casino */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] mx-auto">
            {/* Marco exterior estilo casino */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-full border-8 border-[#FFD700] shadow-2xl">
              <div className="absolute inset-2 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-full border-4 border-[#FFD700]/50"></div>
            </div>

            {/* Ruleta principal */}
            <motion.div
              className="absolute inset-4 rounded-full relative overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              {/* Segmentos de la ruleta estilo casino */}
              {discounts.map((discount, index) => {
                const angle = 60; // 360 / 6 = 60 grados por segmento
                const startAngle = index * angle;
                const endAngle = startAngle + angle;
                
                return (
                  <div
                    key={discount}
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(from ${startAngle}deg, ${casinoColors[index]} ${startAngle}deg, ${casinoColors[index]} ${endAngle}deg, transparent ${endAngle}deg)`
                    }}
                  >
                    {/* Efecto de brillo en cada segmento */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `conic-gradient(from ${startAngle}deg, rgba(255,255,255,0.3) ${startAngle}deg, rgba(255,255,255,0.1) ${startAngle + 10}deg, transparent ${startAngle + 20}deg, transparent ${endAngle}deg)`
                      }}
                    ></div>
                    
                    {/* Texto del porcentaje con efecto casino */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotate(${startAngle + angle/2}deg)`
                      }}
                    >
                      <div 
                        className="text-white font-black text-2xl sm:text-3xl md:text-4xl drop-shadow-2xl"
                        style={{
                          transform: `rotate(${-(startAngle + angle/2)}deg)`,
                          textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)',
                          background: 'linear-gradient(45deg, #FFFFFF, #FFD700, #FFFFFF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {discount}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Centro de la ruleta - Estilo casino */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
              <div className="text-2xl sm:text-3xl md:text-4xl animate-pulse">🎰</div>
              {/* Efecto de brillo en el centro */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>

            {/* Puntero estilo casino */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 sm:border-l-10 sm:border-r-10 sm:border-b-20 border-l-transparent border-r-transparent border-b-[#FFD700] z-10 shadow-lg">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-12 sm:border-l-8 sm:border-r-8 sm:border-b-16 border-l-transparent border-r-transparent border-b-white"></div>
            </div>

            {/* Luces decorativas estilo casino */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </motion.div>

        {/* Botón estilo casino */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={spinWheel}
          disabled={isSpinning}
          className="relative px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-[#FF0000] via-[#FFD700] to-[#FF0000] text-white font-black text-xl sm:text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white overflow-hidden"
        >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center space-x-3">
            {isSpinning ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>🎰 Girando...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🎰</span>
                <span>¡JACKPOT!</span>
                <span className="text-2xl">🎰</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Mensaje de felicitación estilo casino */}
        <AnimatePresence>
          {showCongratulations && selectedDiscount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-2xl backdrop-blur-sm"
            >
              <div className="bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 border-4 border-white relative overflow-hidden">
                {/* Efecto de confeti */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 text-2xl animate-bounce">🎊</div>
                  <div className="absolute top-8 right-8 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
                  <div className="absolute bottom-8 left-8 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</div>
                  <div className="absolute bottom-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🎊</div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 animate-pulse">🎰</div>
                  <h2 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                    ¡JACKPOT!
                  </h2>
                  <p className="text-xl text-white mb-4 font-bold">
                    Has ganado un descuento del
                  </p>
                  <div className="text-6xl font-black text-white mb-4 drop-shadow-2xl animate-pulse">
                    {selectedDiscount}%
                  </div>
                  <p className="text-lg text-white mb-6 font-bold">
                    en tu primer libro
                  </p>
                  <div className="text-4xl mb-4 animate-bounce">📚</div>
                  <p className="text-sm text-white/80 font-medium">
                    Redirigiendo al marketplace...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-4 left-0 right-0 text-center"
      >
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-sm font-semibold">
          CampusCoin - Tu ecosistema universitario inteligente
        </p>
      </motion.div>
    </div>
  );
}
