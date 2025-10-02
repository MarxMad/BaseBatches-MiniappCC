"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeSpinnerProps {
  onComplete: (discount: number) => void;
}

const discounts = [10, 20, 30, 40, 50, 60];
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
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

        {/* Ruleta */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="relative w-80 h-80 mx-auto">
            {/* Ruleta */}
            <motion.div
              className="w-full h-full rounded-full border-8 border-[#FFD700] relative overflow-hidden shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
            >
              {discounts.map((discount, index) => (
                <div
                  key={discount}
                  className="absolute w-1/2 h-1/2 origin-bottom-right"
                  style={{
                    transform: `rotate(${index * 60}deg)`,
                    transformOrigin: 'bottom right'
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `conic-gradient(from ${index * 60}deg, ${colors[index]} 0deg, ${colors[index]} 60deg, transparent 60deg)`
                    }}
                  >
                    <span className="transform -rotate-45 text-2xl font-black">
                      {discount}%
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Centro de la ruleta */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="text-2xl">📚</div>
            </div>

            {/* Puntero */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-[#FFD700] z-10" />
          </div>
        </motion.div>

        {/* Botón para girar */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold text-xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Girando...' : '🎯 ¡Gira la Ruleta!'}
        </motion.button>

        {/* Mensaje de felicitación */}
        <AnimatePresence>
          {showCongratulations && selectedDiscount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl"
            >
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  ¡Felicidades!
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  Has ganado un descuento del
                </p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] mb-4">
                  {selectedDiscount}%
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  en tu primer libro
                </p>
                <div className="text-4xl mb-4">📚</div>
                <p className="text-sm text-gray-500">
                  Redirigiendo al marketplace...
                </p>
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
