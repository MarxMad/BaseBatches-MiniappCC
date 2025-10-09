"use client";

import React, { useState, useEffect } from 'react';
import { BookMarketplace } from './BookMarketplace';
import { NotificationSystem } from './NotificationSystem';
import { SellerAnalytics } from './SellerAnalytics';
import { CouponSystem } from './CouponSystem';
import { RealProofOfDelivery } from './RealProofOfDelivery';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { ShoppingBag, User, Bell, BarChart3, Ticket, Package, Gift, MessageCircle, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface SimpleDashboardProps {
  userTokens?: number | null;
  onGoToBonus?: () => void;
}

export default function SimpleDashboard({ userTokens, onGoToBonus }: SimpleDashboardProps) {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'profile' | 'coupons' | 'delivery'>('marketplace');
  const [userPoints, setUserPoints] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  
  // Estados para perfil de Farcaster
  const [farcasterFname, setFarcasterFname] = useState<string | null>(null);
  const [farcasterPfpUrl, setFarcasterPfpUrl] = useState<string | null>(null);
  const [farcasterDisplayName, setFarcasterDisplayName] = useState<string | null>(null);

  // Integración real con Farcaster Quick Auth
  useEffect(() => {
    const initializeFarcasterAuth = async () => {
      if (address) {
        try {
          // Verificar si estamos en un Mini App de Farcaster
          const isFarcasterMiniApp = typeof window !== 'undefined' && 
            (window.location.href.includes('farcaster') || 
             window.location.href.includes('warpcast') ||
             window.location.href.includes('miniapp') ||
             window.parent !== window); // Detectar iframe de Farcaster
          
          console.log('🔍 Detectando Farcaster Mini App:', isFarcasterMiniApp);
          console.log('🌐 URL actual:', window.location.href);
          
          if (isFarcasterMiniApp) {
            // Importar SDK de Farcaster dinámicamente
            const { sdk } = await import('@farcaster/miniapp-sdk');
            console.log('📦 SDK de Farcaster cargado');
            
            // Obtener token de autenticación usando Quick Auth
            const { token } = await sdk.quickAuth.getToken();
            console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');
            
            if (token) {
              // Usar Quick Auth fetch para obtener datos del usuario
              try {
                console.log('🔑 Usando token para obtener datos del usuario');
                
                // Usar sdk.quickAuth.fetch que maneja automáticamente el token
                const response = await sdk.quickAuth.fetch('https://api.farcaster.xyz/fc/user', {
                  method: 'GET'
                });
                
                console.log('📡 Respuesta de Quick Auth:', response.status);
                
                if (response.ok) {
                  const userData = await response.json();
                  console.log('👤 Datos del usuario:', userData);
                  
                  // Procesar datos del usuario
                  if (userData.result && userData.result.user) {
                    const user = userData.result.user;
                    setFarcasterFname(user.username || user.fname || user.fid?.toString() || 'farcaster_user');
                    setFarcasterDisplayName(user.displayName || user.display_name || 'Usuario Farcaster');
                    setFarcasterPfpUrl(user.pfpUrl || user.pfp_url || 'https://warpcast.com/~/channel-images/base.png');
                    console.log('✅ Datos de Farcaster cargados:', {
                      fname: user.username || user.fname,
                      displayName: user.displayName || user.display_name,
                      pfpUrl: user.pfpUrl || user.pfp_url
                    });
                  } else {
                    console.log('⚠️ Estructura de datos inesperada:', userData);
                    // Usar datos básicos del token si no hay datos del usuario
                    setFarcasterFname('farcaster_user');
                    setFarcasterDisplayName('Usuario Farcaster');
                    setFarcasterPfpUrl('https://warpcast.com/~/channel-images/base.png');
                  }
                } else {
                  console.log('❌ Error en Quick Auth fetch:', response.status);
                  throw new Error(`API error: ${response.status}`);
                }
              } catch (apiError) {
                console.log('❌ Error en Quick Auth:', apiError);
                throw apiError;
              }
            } else {
              console.log('❌ No se pudo obtener token de Farcaster');
              throw new Error('No se pudo obtener token');
            }
          } else {
            console.log('🔄 No es Mini App de Farcaster, usando datos de wallet');
            // Si no es Farcaster, usar datos de la wallet conectada
            setFarcasterFname(null);
            setFarcasterDisplayName(null);
            setFarcasterPfpUrl(null);
          }
        } catch (error) {
          console.log('❌ Farcaster Quick Auth no disponible:', error);
          // Si falla, no mostrar datos de Farcaster
          setFarcasterFname(null);
          setFarcasterDisplayName(null);
          setFarcasterPfpUrl(null);
        }
      }
    };

    initializeFarcasterAuth();
  }, [address]);

  console.log('📊 SimpleDashboard renderizado con tokens:', userTokens);
  console.log('🔗 Estado de conexión en SimpleDashboard:', isConnected);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          {/* Logo CAMPUS */}
          <div className="mb-6">
            <img 
              src="/CampusCoin.png" 
              alt="CAMPUS Logo" 
              className="w-20 h-20 mx-auto mb-4"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#1D4ED8] to-[#10B981] mb-4">
            CAMPUS
          </h1>
          
          <p className="text-xl text-white mb-4">
            Tu Marketplace Universitario Global
          </p>
          
          <p className="text-base text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Conecta tu wallet para acceder al marketplace donde puedes vender y comprar 
            <span className="text-[#3B82F6] font-semibold"> libros, guías, comida, juguetes, pósters, arte, electrónicos</span> y mucho más.
          </p>
          
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border-b border-[#3A3A3A] p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-xl flex items-center justify-center shadow-lg">
                      <img src="/CampusCoin.png" alt="CAMPUS" className="w-8 h-8" />
            </div>
            <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-transparent bg-clip-text">CAMPUS</h1>
                      <p className="text-gray-300 text-sm font-medium">Marketplace Global</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {userTokens && (
              <div className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base">
                🎉 {userTokens} $CAMPUS
              </div>
            )}
            
            
                    <div className="flex items-center space-x-3">
                      {farcasterPfpUrl ? (
                        <Image
                          src={farcasterPfpUrl}
                          alt={farcasterDisplayName || 'Farcaster Profile'}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-[#8A63D2]"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {address?.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="text-white font-semibold">
                          {farcasterDisplayName || `Usuario ${address?.slice(0, 6)}...${address?.slice(-4)}`}
                        </div>
                        {farcasterFname ? (
                          <button
                            onClick={() => window.open('https://warpcast.com', '_blank')}
                            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-[#8A63D2] transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>@{farcasterFname}</span>
                            <ExternalLink className="w-2 h-2" />
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <span>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                          </div>
                        )}
                      </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] border-b border-[#3A3A3A] shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Pestañas principales */}
            <div className="flex space-x-2 sm:space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('marketplace')}
                        className={`py-4 px-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap rounded-t-lg ${
                activeTab === 'marketplace'
                            ? 'border-[#3B82F6] text-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/10 to-transparent'
                            : 'border-transparent text-gray-400 hover:text-white hover:border-[#3B82F6]/50'
              }`}
            >
                        <span className="flex flex-col items-center space-y-1">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-xs">Marketplace</span>
                        </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
                        className={`py-4 px-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap rounded-t-lg ${
                activeTab === 'profile'
                            ? 'border-[#3B82F6] text-[#3B82F6] bg-gradient-to-b from-[#3B82F6]/10 to-transparent'
                            : 'border-transparent text-gray-400 hover:text-white hover:border-[#3B82F6]/50'
                        }`}
                      >
                        <span className="flex flex-col items-center space-y-1">
                          <User className="w-4 h-4" />
                          <span className="text-xs">Perfil</span>
                        </span>
                      </button>
            </div>
            
            {/* Botones de funcionalidades */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onGoToBonus}
                className="px-3 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all duration-300 flex items-center space-x-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Bonus Diario"
              >
                <Gift className="w-4 h-4" />
                <span className="text-xs font-medium">Bonus</span>
              </button>
              
              
              <button
                onClick={() => setActiveTab('coupons')}
                className={`p-2 transition-colors ${
                  activeTab === 'coupons' 
                    ? 'text-[#3B82F6]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Cupones"
              >
                <Ticket className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setActiveTab('delivery')}
                className={`p-2 transition-colors ${
                  activeTab === 'delivery' 
                    ? 'text-[#3B82F6]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Confirmar Entrega"
              >
                <Package className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 sm:p-4 overflow-x-hidden">
        {activeTab === 'marketplace' && (
          <div className="space-y-4">
            {userTokens && (
              <div className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white p-4 sm:p-6 rounded-2xl text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">🎉 ¡Felicidades!</h2>
                <p className="text-base sm:text-lg">
                  Has ganado <span className="font-black text-2xl sm:text-3xl">{userTokens}</span> tokens $CAMPUS
                </p>
                <p className="text-xs sm:text-sm mt-2 opacity-80">
                  Los tokens están listos para usar en el marketplace
                </p>
              </div>
            )}
            <BookMarketplace userTokens={userTokens} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Header del perfil */}
            <div className="bg-gradient-to-r from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] rounded-2xl p-6 border border-[#3B82F6]/30 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
                  <p className="text-gray-400">Estudiante Universitario</p>
                </div>
              </div>
              {userTokens && (
                <div className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white p-4 rounded-xl text-center shadow-lg border border-[#3B82F6]/30">
                  <span className="font-bold text-lg">🎉 Tokens activos: {userTokens} $CAMPUS</span>
                </div>
              )}
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 rounded-xl border border-[#3B82F6]/30 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold text-[#3B82F6] mb-2">0</div>
                <div className="text-gray-400">Libros Comprados</div>
              </div>
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 rounded-xl border border-[#1D4ED8]/30 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold text-[#1D4ED8] mb-2">0</div>
                <div className="text-gray-400">Libros Vendidos</div>
              </div>
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 rounded-xl border border-[#2563EB]/30 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold text-[#2563EB] mb-2">0</div>
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
                    <span className="text-[#3B82F6] font-medium">{userTokens ? `${userTokens} $CAMPUS` : 'Ninguno'}</span>
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

            {/* Sección de Farcaster */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-6 border border-[#3B82F6]/30 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 text-[#3B82F6] mr-2" />
                <span>Perfil de Farcaster</span>
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {farcasterPfpUrl ? (
                    <Image
                      src={farcasterPfpUrl}
                      alt={farcasterDisplayName || 'Farcaster Profile'}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-[#8A63D2]"
                    />
                  ) : (
                    <Avatar address={address} />
                  )}
                  <div>
                    <div className="text-white font-semibold">
                      {farcasterDisplayName || <Name address={address} />}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {farcasterFname ? `@${farcasterFname}` : `Wallet: ${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open('https://warpcast.com', '_blank')}
                  className="px-4 py-2 bg-gradient-to-r from-[#8A63D2] to-[#6B46C1] text-white rounded-lg hover:from-[#9F7AEA] hover:to-[#8A63D2] transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Farcaster</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#3B82F6]/30 text-center">
                  <div className="text-2xl mb-2 text-[#3B82F6]">📝</div>
                  <div className="text-sm text-gray-400">Casts</div>
                  <div className="text-xl font-bold text-[#3B82F6]">0</div>
                </div>
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#1D4ED8]/30 text-center">
                  <div className="text-2xl mb-2 text-[#1D4ED8]">👥</div>
                  <div className="text-sm text-gray-400">Seguidores</div>
                  <div className="text-xl font-bold text-[#1D4ED8]">0</div>
                </div>
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2563EB]/30 text-center">
                  <div className="text-2xl mb-2 text-[#2563EB]">❤️</div>
                  <div className="text-sm text-gray-400">Likes</div>
                  <div className="text-xl font-bold text-[#2563EB]">0</div>
                </div>
              </div>
            </div>

            {/* Libros del usuario */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-2xl p-6 border border-[#3B82F6]/30 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2 text-[#3B82F6]">📚</span> Mis Libros
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl border border-[#3B82F6]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl mb-2 text-[#3B82F6]">🛒</div>
                  <div className="text-sm text-gray-400">Comprados</div>
                  <div className="text-xl font-bold text-[#3B82F6]">0</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl border border-[#1D4ED8]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl mb-2 text-[#1D4ED8]">💰</div>
                  <div className="text-sm text-gray-400">Vendidos</div>
                  <div className="text-xl font-bold text-[#1D4ED8]">0</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl border border-[#2563EB]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-2xl mb-2 text-[#2563EB]">⏳</div>
                  <div className="text-sm text-gray-400">En Venta</div>
                  <div className="text-xl font-bold text-[#2563EB]">0</div>
                </div>
              </div>
            </div>

            {/* Sección de Analytics dentro del perfil */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-6 border border-[#3B82F6]/30 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
                <span>Analytics de Ventas</span>
              </h3>
              <p className="text-gray-400 mb-6">Métricas y estadísticas de tus ventas</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl p-4 border border-[#3B82F6]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl text-[#3B82F6]">💰</div>
                    <div className="text-[#3B82F6] text-sm font-bold">+12.5%</div>
                  </div>
                  <h4 className="text-white font-bold text-xl">2.35 ETH</h4>
                  <p className="text-gray-400 text-sm">Ingresos totales</p>
                </div>

                <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl p-4 border border-[#1D4ED8]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl text-[#1D4ED8]">📦</div>
                    <div className="text-[#1D4ED8] text-sm font-bold">+8.2%</div>
                  </div>
                  <h4 className="text-white font-bold text-xl">47</h4>
                  <p className="text-gray-400 text-sm">Productos vendidos</p>
                </div>

                <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl p-4 border border-[#2563EB]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl text-[#2563EB]">⭐</div>
                    <div className="text-[#2563EB] text-sm font-bold">+0.3</div>
                  </div>
                  <h4 className="text-white font-bold text-xl">4.7</h4>
                  <p className="text-gray-400 text-sm">Calificación promedio</p>
                </div>

                <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-xl p-4 border border-[#1E40AF]/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl text-[#1E40AF]">📈</div>
                    <div className="text-[#1E40AF] text-sm font-bold">+2.1%</div>
                  </div>
                  <h4 className="text-white font-bold text-xl">12.5%</h4>
                  <p className="text-gray-400 text-sm">Tasa de conversión</p>
                </div>
              </div>
            </div>
          </div>
        )}


                {/* Sección de Cupones */}
                {activeTab === 'coupons' && (
                  <div className="space-y-6">
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
                      <h2 className="text-2xl font-bold text-white mb-4">🎟️ Cupones y Descuentos</h2>
                      <p className="text-gray-400 mb-6">Aplica cupones para obtener descuentos especiales</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] hover:border-[#F59E0B] transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">WELCOME10</h3>
                              <p className="text-gray-400 text-sm">10% de descuento para nuevos usuarios</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#F59E0B]">10%</div>
                              <div className="text-gray-400 text-sm">descuento</div>
                            </div>
                          </div>
                          <div className="w-full bg-[#333333] rounded-full h-2 mb-4">
                            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-2 rounded-full" style={{ width: '23%' }}></div>
                          </div>
                          <button className="w-full px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg font-medium hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all">
                            🎟️ Aplicar Cupón
                          </button>
                        </div>

                        <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] hover:border-[#F59E0B] transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">STUDENT20</h3>
                              <p className="text-gray-400 text-sm">Descuento especial para estudiantes</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#F59E0B]">20%</div>
                              <div className="text-gray-400 text-sm">descuento</div>
                            </div>
                          </div>
                          <div className="w-full bg-[#333333] rounded-full h-2 mb-4">
                            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] h-2 rounded-full" style={{ width: '24%' }}></div>
                          </div>
                          <button className="w-full px-4 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg font-medium hover:from-[#FBBF24] hover:to-[#F59E0B] transition-all">
                            🎟️ Aplicar Cupón
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sección de Confirmación de Entrega */}
                {activeTab === 'delivery' && (
                  <div className="space-y-6">
                    <RealProofOfDelivery />
          </div>
        )}
      </main>
      
      {/* Nuevos componentes globales */}
      <NotificationSystem 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <SellerAnalytics 
        isOpen={showAnalytics} 
        onClose={() => setShowAnalytics(false)} 
      />
      
      <CouponSystem 
        isOpen={showCoupons} 
        onClose={() => setShowCoupons(false)} 
        onApplyCoupon={(coupon) => {
          console.log('Cupón aplicado:', coupon);
          // Implementar lógica de cupones
        }}
      />
    </div>
  );
}