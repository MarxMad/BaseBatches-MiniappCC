"use client";

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookMarketplace } from './BookMarketplace';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';

interface SimpleDashboardProps {
  userDiscount?: number | null;
}

export default function SimpleDashboard({ userDiscount }: SimpleDashboardProps) {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'profile'>('marketplace');

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CampusCoin</h1>
              <p className="text-gray-400 text-sm">Marketplace Universitario</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {userDiscount && (
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-4 py-2 rounded-full font-bold">
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
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'marketplace'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              📚 Marketplace
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'marketplace' && (
          <div>
            {userDiscount && (
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black p-6 rounded-2xl mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">🎉 ¡Felicidades!</h2>
                <p className="text-lg">
                  Tienes un descuento del <span className="font-black text-3xl">{userDiscount}%</span> en tu primer libro
                </p>
                <p className="text-sm mt-2 opacity-80">
                  El descuento se aplicará automáticamente al checkout
                </p>
              </div>
            )}
            <BookMarketplace userDiscount={userDiscount} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
            <h2 className="text-2xl font-bold text-white mb-6">Mi Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-white mb-4">Información de Wallet</h3>
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <span className="text-white">Dirección:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white">Descuento activo:</span> {userDiscount ? `${userDiscount}%` : 'Ninguno'}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#2A2A2A]">
                <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
                <div className="space-y-2">
                  <p className="text-gray-400">
                    <span className="text-white">Libros comprados:</span> 0
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white">Libros vendidos:</span> 0
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white">Miembro desde:</span> Hoy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
