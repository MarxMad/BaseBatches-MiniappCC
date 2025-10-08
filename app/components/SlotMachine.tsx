"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotMachineProps {
  onComplete: (tokens: number) => void;
}

const symbols = [
  { emoji: '📚', name: 'Libro', multiplier: 1, tokens: 10 },
  { emoji: '🎓', name: 'Graduación', multiplier: 2, tokens: 25 },
  { emoji: '💻', name: 'Laptop', multiplier: 3, tokens: 50 },
  { emoji: '🧪', name: 'Ciencia', multiplier: 4, tokens: 75 },
  { emoji: '🎨', name: 'Arte', multiplier: 5, tokens: 100 },
  { emoji: '🏆', name: 'Trofeo', multiplier: 10, tokens: 200 },
  { emoji: '💎', name: 'Diamante', multiplier: 20, tokens: 500 },
  { emoji: '🎰', name: 'Jackpot', multiplier: 50, tokens: 1000 }
];

const baseTokens = [5, 10, 15, 20, 25, 30, 40, 50];

export default function SlotMachine({ onComplete }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    { symbol: symbols[0], position: 0 },
    { symbol: symbols[1], position: 0 },
    { symbol: symbols[2], position: 0 }
  ]);
  const [showResult, setShowResult] = useState(false);
  const [winningCombo, setWinningCombo] = useState<string[]>([]);
  const [tokens, setTokens] = useState<number | null>(null);
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
    setTokens(null);
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
    const symbolEmojis = finalReels.map(reel => reel.emoji);
    const symbolNames = finalReels.map(reel => reel.name);
    
    // Combinaciones ganadoras
    const winningCombinations = [
      // Tres iguales
      { pattern: [symbolEmojis[0], symbolEmojis[0], symbolEmojis[0]], type: 'TRIPLE', multiplier: 3 },
      // Dos iguales
      { pattern: [symbolEmojis[0], symbolEmojis[0], symbolEmojis[1]], type: 'DOUBLE', multiplier: 2 },
      // Secuencia
      { pattern: ['📚', '🎓', '💻'], type: 'SEQUENCE', multiplier: 5 },
      // Jackpot
      { pattern: ['🎰', '🎰', '🎰'], type: 'JACKPOT', multiplier: 10 }
    ];

    let bestMatch = null;
    let maxMultiplier = 0;

    winningCombinations.forEach(combo => {
      if (JSON.stringify(symbolEmojis) === JSON.stringify(combo.pattern)) {
        if (combo.multiplier > maxMultiplier) {
          maxMultiplier = combo.multiplier;
          bestMatch = combo;
        }
      }
    });

    if (bestMatch) {
      setWinningCombo(symbolEmojis);
      const baseTokensAmount = baseTokens[Math.floor(Math.random() * baseTokens.length)];
      const finalTokens = Math.min(baseTokensAmount * (bestMatch as any).multiplier, 2000);
      setTokens(finalTokens);
      setShowResult(true);
      
      setTimeout(() => {
        onComplete(finalTokens);
      }, 3000);
    } else {
      // Sin premio, pero dar tokens mínimos
      const minTokens = 5;
      setTokens(minTokens);
      setShowResult(true);
      
      setTimeout(() => {
        onComplete(minTokens);
      }, 2000);
    }

    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Efectos de fondo responsivos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full filter blur-[50px] sm:blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full filter blur-[60px] sm:blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
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

      <div className="relative z-10 text-center w-full max-w-4xl mx-auto px-2 sm:px-4">
        {/* Título de bienvenida responsivo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#10B981] mb-2 sm:mb-4 leading-tight">
            ¡Bienvenido a CU-Shop!
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white font-semibold px-2">
            Gira la máquina y gana tokens $CAMPUS para intercambiar por productos
          </p>
        </motion.div>

        {/* Máquina Tragamonedas Responsiva */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-4 sm:mb-8 w-full max-w-2xl mx-auto"
        >
          {/* Marco de la máquina responsivo */}
          <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 sm:border-4 border-[#3B82F6] shadow-2xl">
            {/* Pantalla de la máquina responsiva */}
            <div className="bg-black rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 border-2 border-[#3B82F6]">
              <div className="flex justify-center space-x-2 sm:space-x-3 lg:space-x-4">
                {reels.map((reel, index) => (
                  <motion.div
                    key={index}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-white shadow-lg"
                    animate={isSpinning ? { 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ 
                      duration: 0.1,
                      repeat: isSpinning ? Infinity : 0
                    }}
                  >
                    <span className="text-2xl sm:text-3xl lg:text-4xl">{reel.symbol.emoji}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Línea ganadora responsiva */}
              <div className="mt-3 sm:mt-4 text-center">
                <div className="text-white font-bold text-sm sm:text-base lg:text-lg">
                  {isSpinning ? '🎰 Girando...' : '🎯 ¡Presiona SPIN!'}
                </div>
              </div>
            </div>

            {/* Botón SPIN Responsivo */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={spinReels}
              disabled={isSpinning}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#3B82F6] text-white font-black text-lg sm:text-xl lg:text-2xl rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 sm:border-4 border-white overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                {isSpinning ? (
                  <>
                    <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base lg:text-lg">🎰 GIRANDO...</span>
                    <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <span className="text-lg sm:text-xl lg:text-2xl animate-bounce">🎰</span>
                    <span className="animate-pulse text-sm sm:text-base lg:text-lg">SPIN!</span>
                    <span className="text-lg sm:text-xl lg:text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎰</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Resultado Responsivo */}
        <AnimatePresence>
          {showResult && tokens && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4 z-50"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-center max-w-sm sm:max-w-md mx-auto border-2 sm:border-4 border-white shadow-2xl"
              >
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🎉</div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 sm:mb-4">¡FELICIDADES!</h2>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-4">{tokens}</div>
                <p className="text-sm sm:text-base lg:text-xl font-bold mb-2 sm:mb-4">TOKENS $CAMPUS GANADOS</p>
                {winningCombo.length > 0 && (
                  <div className="text-sm sm:text-base lg:text-lg mb-2 sm:mb-4">
                    <span className="font-bold">Combinación: </span>
                    <span className="text-lg sm:text-xl lg:text-2xl">{winningCombo.join(' ')}</span>
                  </div>
                )}
                <div className="text-xs sm:text-sm opacity-80">
                  Los tokens se agregarán a tu wallet automáticamente
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información del juego responsiva */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center text-gray-400 max-w-4xl mx-auto px-2 sm:px-4"
        >
          <p className="text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
            🎰 Gira los carretes y combina símbolos para ganar tokens $CAMPUS
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
            <div className="bg-[#1A1A1A] p-2 sm:p-3 rounded-lg border border-[#3B82F6]/20">
              <div className="text-lg sm:text-2xl mb-1">🎯</div>
              <div className="font-semibold text-xs sm:text-sm">3 Iguales</div>
              <div className="text-xs">Tokens x3</div>
            </div>
            <div className="bg-[#1A1A1A] p-2 sm:p-3 rounded-lg border border-[#3B82F6]/20">
              <div className="text-lg sm:text-2xl mb-1">🎪</div>
              <div className="font-semibold text-xs sm:text-sm">2 Iguales</div>
              <div className="text-xs">Tokens x2</div>
            </div>
            <div className="bg-[#1A1A1A] p-2 sm:p-3 rounded-lg border border-[#3B82F6]/20">
              <div className="text-lg sm:text-2xl mb-1">🎓</div>
              <div className="font-semibold text-xs sm:text-sm">Secuencia</div>
              <div className="text-xs">Tokens x5</div>
            </div>
            <div className="bg-[#1A1A1A] p-2 sm:p-3 rounded-lg border border-[#3B82F6]/20">
              <div className="text-lg sm:text-2xl mb-1">🎰</div>
              <div className="font-semibold text-xs sm:text-sm">JACKPOT</div>
              <div className="text-xs">Tokens x10</div>
            </div>
          </div>
          
          {/* Información sobre tokens */}
          <div className="mt-4 sm:mt-6 bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-xl p-3 sm:p-4 border border-[#3B82F6]/30">
            <h3 className="text-sm sm:text-base font-bold text-[#3B82F6] mb-2">💡 ¿Qué son los tokens $CAMPUS?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Los tokens $CAMPUS son la moneda digital de CU-Shop. Puedes intercambiarlos por libros, 
              productos, cursos y más en nuestro marketplace global.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
