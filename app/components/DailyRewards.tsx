"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyRewardsProps {
  onComplete: (tokens: number) => void;
}

interface UserStreak {
  currentStreak: number;
  lastClaimDate: string;
  totalClaims: number;
}

export default function DailyRewards({ onComplete }: DailyRewardsProps) {
  const [userStreak, setUserStreak] = useState<UserStreak>({
    currentStreak: 0,
    lastClaimDate: '',
    totalClaims: 0
  });
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [rewardTokens, setRewardTokens] = useState(0);
  const [isStreakBonus, setIsStreakBonus] = useState(false);

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('campusStreak');
    if (savedStreak) {
      setUserStreak(JSON.parse(savedStreak));
    }
    checkClaimAvailability();
  }, []);

  // Verificar si puede reclamar
  const checkClaimAvailability = () => {
    const now = new Date();
    const today = now.toDateString();
    const lastClaim = userStreak.lastClaimDate ? new Date(userStreak.lastClaimDate) : null;
    
    if (!lastClaim || lastClaim.toDateString() !== today) {
      setCanClaim(true);
    } else {
      setCanClaim(false);
      // Calcular tiempo hasta el próximo claim
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNext(`${hours}h ${minutes}m`);
    }
  };

  // Actualizar streak
  const updateStreak = (newStreak: UserStreak) => {
    setUserStreak(newStreak);
    localStorage.setItem('campusStreak', JSON.stringify(newStreak));
  };

  // Generar recompensa aleatoria (500-3500)
  const generateDailyReward = (): number => {
    return Math.floor(Math.random() * 3001) + 500; // 500-3500
  };

  // Reclamar recompensa diaria
  const claimDailyReward = () => {
    if (!canClaim) return;

    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = { ...userStreak };
    let tokens = generateDailyReward();
    let isBonus = false;

    // Verificar si es streak de 5 días
    if (userStreak.currentStreak === 5) {
      tokens *= 3; // Bonus x3
      isBonus = true;
      newStreak.currentStreak = 0; // Reset streak
    } else if (userStreak.lastClaimDate === yesterdayStr) {
      // Streak continuo
      newStreak.currentStreak += 1;
    } else if (userStreak.lastClaimDate !== today) {
      // Streak roto, empezar de nuevo
      newStreak.currentStreak = 1;
    }

    newStreak.lastClaimDate = today;
    newStreak.totalClaims += 1;

    setRewardTokens(tokens);
    setIsStreakBonus(isBonus);
    setShowReward(true);
    updateStreak(newStreak);
    setCanClaim(false);

    // Completar después de mostrar la animación
    setTimeout(() => {
      onComplete(tokens);
    }, 3000);
  };

  // Actualizar contador de tiempo
  useEffect(() => {
    if (!canClaim) {
      const interval = setInterval(() => {
        checkClaimAvailability();
      }, 60000); // Cada minuto

      return () => clearInterval(interval);
    }
  }, [canClaim, userStreak.lastClaimDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full filter blur-[50px] sm:blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full filter blur-[60px] sm:blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center w-full max-w-4xl mx-auto px-2 sm:px-4">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#10B981] mb-2 sm:mb-4 leading-tight">
            🎁 Bonus Diario
          </h1>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white font-semibold px-2">
            Reclama tus tokens $CAMPUS diarios
          </p>
        </motion.div>

        {/* Información del streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6 border border-[#3B82F6]/30 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-[#0A0A0A] rounded-lg p-3 sm:p-4 border border-[#3B82F6]/20">
              <div className="text-2xl sm:text-3xl mb-2">🔥</div>
              <div className="text-white font-bold text-lg sm:text-xl">{userStreak.currentStreak}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Días seguidos</div>
            </div>
            
            <div className="bg-[#0A0A0A] rounded-lg p-3 sm:p-4 border border-[#3B82F6]/20">
              <div className="text-2xl sm:text-3xl mb-2">📊</div>
              <div className="text-white font-bold text-lg sm:text-xl">{userStreak.totalClaims}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Total reclamados</div>
            </div>
            
            <div className="bg-[#0A0A0A] rounded-lg p-3 sm:p-4 border border-[#3B82F6]/20">
              <div className="text-2xl sm:text-3xl mb-2">🎯</div>
              <div className="text-white font-bold text-lg sm:text-xl">500-3500</div>
              <div className="text-gray-400 text-xs sm:text-sm">Tokens diarios</div>
            </div>
          </div>
        </motion.div>

        {/* Botón de reclamar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6"
        >
          {canClaim ? (
            <motion.button
              onClick={claimDailyReward}
              className="w-full max-w-md py-4 sm:py-6 bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#3B82F6] text-white font-black text-lg sm:text-xl lg:text-2xl rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 sm:border-4 border-white overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl animate-bounce">🎁</span>
                <span className="animate-pulse">¡RECLAMAR BONUS!</span>
                <span className="text-2xl sm:text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎁</span>
              </div>
            </motion.button>
          ) : (
            <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6 border border-[#3B82F6]/30">
              <div className="text-4xl sm:text-6xl mb-4">⏰</div>
              <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Ya reclamaste hoy</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Próximo bonus en: <span className="text-[#3B82F6] font-bold">{timeUntilNext}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Información del bonus x3 */}
        {userStreak.currentStreak >= 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 rounded-xl p-4 sm:p-6 border border-[#F59E0B]/50 mb-6"
          >
            <div className="text-3xl sm:text-4xl mb-2">🚀</div>
            <h3 className="text-[#F59E0B] font-bold text-lg sm:text-xl mb-2">
              ¡Bonus x3 en camino!
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">
              {userStreak.currentStreak === 4 
                ? "¡1 día más para el bonus x3!" 
                : `¡${5 - userStreak.currentStreak} días más para el bonus x3!`
              }
            </p>
          </motion.div>
        )}

        {/* Información del sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center text-gray-400 max-w-4xl mx-auto px-2 sm:px-4"
        >
          <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-xl p-3 sm:p-4 border border-[#3B82F6]/30">
            <h3 className="text-sm sm:text-base font-bold text-[#3B82F6] mb-2">💡 ¿Cómo funciona el Bonus Diario?</h3>
            <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-1">
              <p>• Reclama entre 500-3500 tokens $CAMPUS cada 24 horas</p>
              <p>• Mantén tu streak por 5 días consecutivos para ganar x3 tokens</p>
              <p>• Los tokens se resetean cada 24 horas a las 00:00</p>
              <p>• ¡No pierdas tu streak o empezarás de nuevo!</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de recompensa */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4 z-50"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-center max-w-sm sm:max-w-md mx-auto border-2 sm:border-4 border-white shadow-2xl ${
                isStreakBonus 
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white' 
                  : 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white'
              }`}
            >
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">
                {isStreakBonus ? '🚀' : '🎉'}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 sm:mb-4">
                {isStreakBonus ? '¡BONUS x3!' : '¡FELICIDADES!'}
              </h2>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 sm:mb-4">{rewardTokens}</div>
              <p className="text-sm sm:text-base lg:text-xl font-bold mb-2 sm:mb-4">
                TOKENS $CAMPUS GANADOS
              </p>
              {isStreakBonus && (
                <div className="text-xs sm:text-sm opacity-80 mb-2">
                  ¡Streak de 5 días completado!
                </div>
              )}
              <div className="text-xs sm:text-sm opacity-80">
                Los tokens se agregarán a tu wallet automáticamente
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
