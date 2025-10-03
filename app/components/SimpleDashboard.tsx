"use client";

import React, { useState } from 'react';
import { BookMarketplace } from './BookMarketplace';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';

interface SimpleDashboardProps {
  userDiscount?: number | null;
}

export default function SimpleDashboard({ userDiscount }: SimpleDashboardProps) {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'profile' | 'stories' | 'leaderboard' | 'game'>('marketplace');
  const [userPoints, setUserPoints] = useState(0);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] mb-4">
            CampusCoin
          </h1>
          <p className="text-xl text-white mb-8">
            Conecta tu wallet para acceder al marketplace
          </p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CampusCoin</h1>
              <p className="text-gray-400 text-sm">Marketplace Universitario</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {userDiscount && (
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-4 py-2 rounded-full font-bold text-sm sm:text-base">
                🎉 {userDiscount}% OFF
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Avatar address={address} />
              <Name address={address} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'marketplace'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              📚 Marketplace
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'stories'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              📖 Stories
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🏆 Ranking
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'game'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🎮 Juegos
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              👤 Perfil
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 sm:p-4 overflow-x-hidden">
        {activeTab === 'marketplace' && (
          <div className="space-y-4">
            {userDiscount && (
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-4 sm:p-6 rounded-2xl text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">🎉 ¡Felicidades!</h2>
                <p className="text-base sm:text-lg">
                  Tienes un descuento del <span className="font-black text-2xl sm:text-3xl">{userDiscount}%</span> en tu primer libro
                </p>
                <p className="text-xs sm:text-sm mt-2 opacity-80">
                  El descuento se aplicará automáticamente al checkout
                </p>
              </div>
            )}
            <BookMarketplace userDiscount={userDiscount} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Header del perfil */}
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-6 border border-[#2A2A2A]">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
                  <p className="text-gray-400">Estudiante Universitario</p>
                </div>
              </div>
              {userDiscount && (
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-3 rounded-xl text-center">
                  <span className="font-bold">🎉 Descuento activo: {userDiscount}% OFF</span>
                </div>
              )}
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] text-center">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">0</div>
                <div className="text-gray-400">Libros Comprados</div>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] text-center">
                <div className="text-3xl font-bold text-[#4CAF50] mb-2">0</div>
                <div className="text-gray-400">Libros Vendidos</div>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] text-center">
                <div className="text-3xl font-bold text-[#FF8C00] mb-2">0</div>
                <div className="text-gray-400">En Venta</div>
              </div>
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🔗</span> Información de Wallet
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dirección:</span>
                    <span className="text-white font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estado:</span>
                    <span className="text-green-400 font-medium">Conectado</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Descuento:</span>
                    <span className="text-[#FFD700] font-medium">{userDiscount ? `${userDiscount}%` : 'Ninguno'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span> Estadísticas de Actividad
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Miembro desde:</span>
                    <span className="text-white">Hoy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Puntos ganados:</span>
                    <span className="text-[#FFD700] font-bold">{userPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Nivel:</span>
                    <span className="text-[#4CAF50] font-medium">Principiante</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Libros del usuario */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">📚</span> Mis Libros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A]">
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="text-sm text-gray-400">Comprados</div>
                  <div className="text-xl font-bold text-white">0</div>
                </div>
                <div className="text-center p-4 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A]">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm text-gray-400">Vendidos</div>
                  <div className="text-xl font-bold text-white">0</div>
                </div>
                <div className="text-center p-4 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A]">
                  <div className="text-2xl mb-2">⏳</div>
                  <div className="text-sm text-gray-400">En Venta</div>
                  <div className="text-xl font-bold text-white">0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <h2 className="text-2xl font-bold text-white mb-4">📖 Stories de Exámenes</h2>
              <p className="text-gray-400 mb-6">Comparte y descubre respuestas de exámenes universitarios</p>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">Stories de Exámenes</h3>
                <p className="text-gray-400 mb-6">Próximamente: Sistema completo de stories con respuestas de exámenes</p>
                <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl p-6 border border-[#FFD700]/20">
                  <div className="text-sm text-gray-300">
                    <div className="mb-2">✨ Comparte respuestas de exámenes</div>
                    <div className="mb-2">👍 Vota por las mejores contribuciones</div>
                    <div className="mb-2">🏆 Gana puntos y badges</div>
                    <div>📊 Aparece en el leaderboard</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Leaderboard</h2>
              <p className="text-gray-400 mb-6">Los mejores contribuidores de la comunidad</p>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">Ranking de Usuarios</h3>
                <p className="text-gray-400 mb-6">Próximamente: Sistema completo de ranking y recompensas</p>
                <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl p-6 border border-[#FFD700]/20">
                  <div className="text-sm text-gray-300">
                    <div className="mb-2">🥇 Top contribuidores</div>
                    <div className="mb-2">⭐ Sistema de badges</div>
                    <div className="mb-2">🎁 Recompensas especiales</div>
                    <div>📈 Estadísticas detalladas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'game' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <h2 className="text-2xl font-bold text-white mb-4">🎮 Minijuegos</h2>
              <p className="text-gray-400 mb-6">Gana puntos jugando minijuegos académicos</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] hover:border-[#FFD700] transition-all cursor-pointer">
                  <div className="text-4xl mb-4">🧠</div>
                  <h3 className="text-xl font-bold text-white mb-2">Memory Match</h3>
                  <p className="text-gray-400 text-sm mb-4">Encuentra las parejas de materias académicas</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#FFD700]">+100 pts por pareja</span>
                    <span className="text-gray-400">60s</span>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] hover:border-[#FFD700] transition-all cursor-pointer opacity-50">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">Quiz Rápido</h3>
                  <p className="text-gray-400 text-sm mb-4">Responde preguntas de diferentes materias</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#FFD700]">+50 pts por respuesta</span>
                    <span className="text-gray-400">Próximamente</span>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] hover:border-[#FFD700] transition-all cursor-pointer opacity-50">
                  <div className="text-4xl mb-4">🔤</div>
                  <h3 className="text-xl font-bold text-white mb-2">Palabras Académicas</h3>
                  <p className="text-gray-400 text-sm mb-4">Forma palabras con términos universitarios</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#FFD700]">+25 pts por palabra</span>
                    <span className="text-gray-400">Próximamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}