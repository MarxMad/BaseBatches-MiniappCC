"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  id: number;
  emoji: string;
  subject: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  isOpen: boolean;
  onClose: () => void;
  onPointsEarned: (points: number) => void;
}

const subjects = [
  { emoji: '📚', subject: 'Matemáticas' },
  { emoji: '🧪', subject: 'Química' },
  { emoji: '⚡', subject: 'Física' },
  { emoji: '🧬', subject: 'Biología' },
  { emoji: '💻', subject: 'Programación' },
  { emoji: '💰', subject: 'Economía' },
  { emoji: '⚖️', subject: 'Derecho' },
  { emoji: '🏗️', subject: 'Arquitectura' }
];

export const MemoryGame: React.FC<MemoryGameProps> = ({ isOpen, onClose, onPointsEarned }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  // Crear el mazo de cartas
  const createCards = () => {
    const gameSubjects = subjects.slice(0, 6); // Usar 6 materias para 12 cartas
    const cardPairs = [...gameSubjects, ...gameSubjects].map((item, index) => ({
      id: index,
      emoji: item.emoji,
      subject: item.subject,
      isFlipped: false,
      isMatched: false
    }));
    
    // Mezclar las cartas
    return cardPairs.sort(() => Math.random() - 0.5);
  };

  // Inicializar el juego
  const startGame = () => {
    setCards(createCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(true);
    setGameCompleted(false);
    setTimeLeft(60);
    setScore(0);
  };

  // Manejar click en carta
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2 || cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [first, second] = newFlippedCards;
        const firstCard = cards[first];
        const secondCard = cards[second];

        if (firstCard.subject === secondCard.subject) {
          // Match encontrado
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setScore(prev => prev + 100);
        } else {
          // No match, voltear cartas
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameCompleted]);

  // Verificar si el juego está completo
  useEffect(() => {
    if (matches === 6 && gameStarted) {
      setGameCompleted(true);
      endGame();
    }
  }, [matches, gameStarted]);

  // Finalizar juego
  const endGame = () => {
    setGameStarted(false);
    const finalScore = score + (timeLeft * 10); // Bonus por tiempo restante
    onPointsEarned(finalScore);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🧠 Memory Match Académico</h2>
                <p className="text-gray-400">Encuentra las parejas de materias y gana puntos</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Game Stats */}
          {gameStarted && (
            <div className="p-4 bg-[#0A0A0A] border-b border-[#333333]">
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-6">
                  <div className="text-white">
                    <span className="text-gray-400">Movimientos:</span> {moves}
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400">Parejas:</span> {matches}/6
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400">Puntos:</span> {score}
                  </div>
                </div>
                <div className="text-[#FFD700] font-bold">
                  ⏰ {timeLeft}s
                </div>
              </div>
            </div>
          )}

          {/* Game Content */}
          <div className="p-6">
            {!gameStarted ? (
              <div className="text-center">
                <div className="text-6xl mb-6">🧠</div>
                <h3 className="text-2xl font-bold text-white mb-4">¡Bienvenido al Memory Match!</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Encuentra las parejas de materias académicas. Tienes 60 segundos para completar el juego.
                  ¡Cada pareja encontrada te da 100 puntos!
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                  <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-white font-semibold">Objetivo</div>
                    <div className="text-gray-400 text-sm">Encuentra 6 parejas</div>
                  </div>
                  <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#333333]">
                    <div className="text-2xl mb-2">⏰</div>
                    <div className="text-white font-semibold">Tiempo</div>
                    <div className="text-gray-400 text-sm">60 segundos</div>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-bold text-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all transform hover:scale-105"
                >
                  🚀 ¡Comenzar Juego!
                </button>
              </div>
            ) : gameCompleted ? (
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-white mb-4">¡Felicitaciones!</h3>
                <p className="text-gray-400 mb-6">Has completado el juego en {moves} movimientos</p>
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-6 rounded-xl mb-6">
                  <div className="text-4xl font-bold mb-2">{score + (timeLeft * 10)} puntos</div>
                  <div className="text-lg">¡Puntos ganados!</div>
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                  >
                    🔄 Jugar de Nuevo
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                  >
                    ✅ Continuar
                  </button>
                </div>
              </div>
            ) : timeLeft === 0 ? (
              <div className="text-center">
                <div className="text-6xl mb-6">⏰</div>
                <h3 className="text-3xl font-bold text-white mb-4">¡Tiempo Agotado!</h3>
                <p className="text-gray-400 mb-6">Has encontrado {matches} de 6 parejas</p>
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-6 rounded-xl mb-6">
                  <div className="text-4xl font-bold mb-2">{score} puntos</div>
                  <div className="text-lg">¡Puntos ganados!</div>
                </div>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                  >
                    🔄 Intentar de Nuevo
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                  >
                    ✅ Continuar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-xl cursor-pointer flex items-center justify-center text-4xl font-bold transition-all duration-300 ${
                      card.isFlipped || card.isMatched
                        ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black'
                        : 'bg-[#0A0A0A] border-2 border-[#333333] hover:border-[#FFD700] hover:bg-[#1A1A1A]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={card.isFlipped ? { rotateY: 180 } : { rotateY: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <div className="text-center">
                        <div className="text-3xl mb-1">{card.emoji}</div>
                        <div className="text-xs font-medium">{card.subject}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400">?</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
