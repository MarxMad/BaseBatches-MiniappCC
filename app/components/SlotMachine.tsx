"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotMachineProps {
  onComplete: (discount: number) => void;
}

const symbols = [
  { emoji: '📚', name: 'Libro', multiplier: 1 },
  { emoji: '🎓', name: 'Graduación', multiplier: 2 },
  { emoji: '💻', name: 'Laptop', multiplier: 3 },
  { emoji: '🧪', name: 'Ciencia', multiplier: 4 },
  { emoji: '🎨', name: 'Arte', multiplier: 5 },
  { emoji: '🏆', name: 'Trofeo', multiplier: 10 },
  { emoji: '💎', name: 'Diamante', multiplier: 20 },
  { emoji: '🎰', name: 'Jackpot', multiplier: 50 }
];

const discounts = [10, 15, 20, 25, 30, 40, 50, 60];

export default function SlotMachine({ onComplete }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    { symbol: symbols[0], position: 0 },
    { symbol: symbols[1], position: 0 },
    { symbol: symbols[2], position: 0 }
  ]);
  const [showResult, setShowResult] = useState(false);
  const [winningCombo, setWinningCombo] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number | null>(null);
  const [spins, setSpins] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const createParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  };

  const spinReels = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setWinningCombo([]);
    setDiscount(null);
    setSpins(prev => prev + 1);
    createParticles();

    // Animar los carretes
    const spinDuration = 2000 + Math.random() * 1000; // 2-3 segundos
    const spinInterval = 100; // Cambiar símbolos cada 100ms

    let currentTime = 0;
    const interval = setInterval(() => {
      setReels(prev => prev.map((reel, index) => ({
        ...reel,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        position: (reel.position + 1) % symbols.length
      })));
      currentTime += spinInterval;
    }, spinInterval);

    // Detener después del tiempo
    setTimeout(() => {
      clearInterval(interval);
      
      // Resultado final
      const finalReels = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      setReels(prev => prev.map((reel, index) => ({
        ...reel,
        symbol: finalReels[index]
      })));

      // Verificar combinaciones ganadoras
      setTimeout(() => {
        checkWinningCombination(finalReels);
      }, 500);
    }, spinDuration);
  };

  const checkWinningCombination = (finalReels: typeof symbols) => {
    const symbols = finalReels.map(reel => reel.emoji);
    const names = finalReels.map(reel => reel.name);
    
    // Combinaciones ganadoras
    const winningCombinations = [
      // Tres iguales
      { pattern: [symbols[0], symbols[0], symbols[0]], type: 'TRIPLE', multiplier: 3 },
      // Dos iguales
      { pattern: [symbols[0], symbols[0], symbols[1]], type: 'DOUBLE', multiplier: 2 },
      // Secuencia
      { pattern: ['📚', '🎓', '💻'], type: 'SEQUENCE', multiplier: 5 },
      // Jackpot
      { pattern: ['🎰', '🎰', '🎰'], type: 'JACKPOT', multiplier: 10 }
    ];

    let bestMatch = null;
    let maxMultiplier = 0;

    winningCombinations.forEach(combo => {
      if (JSON.stringify(symbols) === JSON.stringify(combo.pattern)) {
        if (combo.multiplier > maxMultiplier) {
          maxMultiplier = combo.multiplier;
          bestMatch = combo;
        }
      }
    });

    if (bestMatch) {
      setWinningCombo(symbols);
      const baseDiscount = discounts[Math.floor(Math.random() * discounts.length)];
      const finalDiscount = Math.min(baseDiscount * bestMatch.multiplier, 80);
      setDiscount(finalDiscount);
      setShowResult(true);
      
      setTimeout(() => {
        onComplete(finalDiscount);
      }, 3000);
    } else {
      // Sin premio, pero dar descuento mínimo
      const minDiscount = 5;
      setDiscount(minDiscount);
      setShowResult(true);
      
      setTimeout(() => {
        onComplete(minDiscount);
      }, 2000);
    }

    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full filter blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] rounded-full filter blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Efectos de partículas durante el giro */}
      {isSpinning && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-[#FFD700] rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -50, -100]
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 text-center">
        {/* Título de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] mb-4">
            ¡Bienvenido a CU-Shop!
          </h1>
          <p className="text-xl md:text-2xl text-white font-semibold">
            Gira la máquina tragamonedas y gana tu descuento especial
          </p>
        </motion.div>

        {/* Máquina Tragamonedas */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-8"
        >
          {/* Marco de la máquina */}
          <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-3xl p-8 border-4 border-[#FFD700] shadow-2xl">
            {/* Pantalla de la máquina */}
            <div className="bg-black rounded-2xl p-6 mb-6 border-2 border-[#FFD700]">
              <div className="flex justify-center space-x-4">
                {reels.map((reel, index) => (
                  <motion.div
                    key={index}
                    className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center border-2 border-white shadow-lg"
                    animate={isSpinning ? { 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ 
                      duration: 0.1,
                      repeat: isSpinning ? Infinity : 0
                    }}
                  >
                    <span className="text-4xl">{reel.symbol.emoji}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Línea ganadora */}
              <div className="mt-4 text-center">
                <div className="text-white font-bold text-lg">
                  {isSpinning ? '🎰 Girando...' : '🎯 ¡Presiona SPIN!'}
                </div>
              </div>
            </div>

            {/* Botón SPIN */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={spinReels}
              disabled={isSpinning}
              className="w-full py-4 bg-gradient-to-r from-[#FF0000] via-[#FFD700] to-[#FF0000] text-white font-black text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex items-center justify-center space-x-3">
                {isSpinning ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>🎰 GIRANDO...</span>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl animate-bounce">🎰</span>
                    <span className="animate-pulse">SPIN!</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎰</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Resultado */}
        <AnimatePresence>
          {showResult && discount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-8 rounded-3xl text-center max-w-md mx-auto border-4 border-white shadow-2xl"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-black mb-4">¡FELICIDADES!</h2>
                <div className="text-6xl font-black mb-4">{discount}%</div>
                <p className="text-xl font-bold mb-4">DESCUENTO GANADO</p>
                {winningCombo.length > 0 && (
                  <div className="text-lg mb-4">
                    <span className="font-bold">Combinación: </span>
                    <span className="text-2xl">{winningCombo.join(' ')}</span>
                  </div>
                )}
                <div className="text-sm opacity-80">
                  El descuento se aplicará automáticamente
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información del juego */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center text-gray-400 max-w-2xl mx-auto"
        >
          <p className="text-lg mb-4">
            🎰 Gira los carretes y combina símbolos para ganar descuentos
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[#1A1A1A] p-3 rounded-lg">
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-semibold">3 Iguales</div>
              <div className="text-xs">Descuento x3</div>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-lg">
              <div className="text-2xl mb-1">🎪</div>
              <div className="font-semibold">2 Iguales</div>
              <div className="text-xs">Descuento x2</div>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-lg">
              <div className="text-2xl mb-1">🎓</div>
              <div className="font-semibold">Secuencia</div>
              <div className="text-xs">Descuento x5</div>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-lg">
              <div className="text-2xl mb-1">🎰</div>
              <div className="font-semibold">JACKPOT</div>
              <div className="text-xs">Descuento x10</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
