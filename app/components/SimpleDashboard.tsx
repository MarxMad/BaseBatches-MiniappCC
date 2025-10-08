"use client";

import React, { useState } from 'react';
import { BookMarketplace } from './BookMarketplace';
import { NotificationSystem } from './NotificationSystem';
import { SellerAnalytics } from './SellerAnalytics';
import { CouponSystem } from './CouponSystem';
import { ProofOfDelivery } from './ProofOfDelivery';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { ShoppingBag, User, Bell, BarChart3, Ticket, Package, Gift } from 'lucide-react';

interface SimpleDashboardProps {
  userTokens?: number | null;
  onGoToBonus?: () => void;
}

export default function SimpleDashboard({ userTokens, onGoToBonus }: SimpleDashboardProps) {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'profile' | 'notifications' | 'analytics' | 'coupons' | 'delivery'>('marketplace');
  const [userPoints, setUserPoints] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);

  console.log('📊 SimpleDashboard renderizado con tokens:', userTokens);
  console.log('🔗 Estado de conexión en SimpleDashboard:', isConnected);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] mb-4">
            CU-Shop
          </h1>
          <p className="text-xl text-white mb-8">
            Conecta tu wallet para acceder al marketplace global
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
            <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#3B82F6] text-transparent bg-clip-text">CU-Shop</h1>
              <p className="text-gray-300 text-sm font-medium">Marketplace Global</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {userTokens && (
              <div className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base">
                🎉 {userTokens} $CAMPUS
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
                onClick={() => setActiveTab('notifications')}
                className={`relative p-2 transition-colors ${
                  activeTab === 'notifications' 
                    ? 'text-[#3B82F6]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  3
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`p-2 transition-colors ${
                  activeTab === 'analytics' 
                    ? 'text-[#3B82F6]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5" />
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
              {userTokens && (
                <div className="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white p-3 rounded-xl text-center">
                  <span className="font-bold">🎉 Tokens activos: {userTokens} $CAMPUS</span>
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

        {/* Sección de Notificaciones */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <h2 className="text-2xl font-bold text-white mb-4">🔔 Notificaciones</h2>
              <p className="text-gray-400 mb-6">Mantente al día con todas tus actividades</p>
              
              <div className="space-y-4">
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">¡Compra exitosa!</h3>
                      <p className="text-gray-300 text-sm">Tu producto "Libro de Matemáticas" ha sido comprado exitosamente.</p>
                      <p className="text-gray-500 text-xs mt-1">Hace 2 horas</p>
                    </div>
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💬</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Nuevo mensaje</h3>
                      <p className="text-gray-300 text-sm">Tienes un nuevo mensaje de Carlos López sobre tu producto.</p>
                      <p className="text-gray-500 text-xs mt-1">Hace 4 horas</p>
                    </div>
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                  </div>
                </div>
                
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⭐</div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Nueva reseña</h3>
                      <p className="text-gray-300 text-sm">Ana García ha dejado una reseña de 5 estrellas en tu producto.</p>
                      <p className="text-gray-500 text-xs mt-1">Ayer</p>
                    </div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
              <p className="text-gray-400 mb-6">Métricas y estadísticas de tus ventas</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">💰</div>
                    <div className="text-green-400 text-sm">+12.5%</div>
                  </div>
                  <h3 className="text-white font-bold text-2xl">2.35 ETH</h3>
                  <p className="text-gray-400 text-sm">Ingresos totales</p>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">📦</div>
                    <div className="text-green-400 text-sm">+8.2%</div>
                  </div>
                  <h3 className="text-white font-bold text-2xl">47</h3>
                  <p className="text-gray-400 text-sm">Productos vendidos</p>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">⭐</div>
                    <div className="text-green-400 text-sm">+0.3</div>
                  </div>
                  <h3 className="text-white font-bold text-2xl">4.7</h3>
                  <p className="text-gray-400 text-sm">Calificación promedio</p>
                </div>

                <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">📈</div>
                    <div className="text-green-400 text-sm">+2.1%</div>
                  </div>
                  <h3 className="text-white font-bold text-2xl">12.5%</h3>
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
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
                      <h2 className="text-2xl font-bold text-white mb-4">📦 Confirmar Entrega</h2>
                      <p className="text-gray-400 mb-6">Sube una foto como prueba de que recibiste tu producto</p>
                      
                      {/* Lista de pedidos pendientes */}
                      <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold text-white">Pedidos Pendientes de Confirmación</h3>
                        
                        <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-lg flex items-center justify-center">
                                <span className="text-xl">📚</span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">Cálculo Diferencial</h4>
                                <p className="text-gray-400 text-sm">Pedido #12345</p>
                                <p className="text-gray-500 text-xs">Comprado hace 2 días</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#3B82F6]">0.01 ETH</div>
                              <div className="text-gray-400 text-sm">Pendiente</div>
                            </div>
                          </div>
                          
                          {/* Componente ProofOfDelivery integrado */}
                          <ProofOfDelivery 
                            orderId={12345} 
                            onProofSubmitted={() => {
                              console.log('Entrega confirmada para pedido #12345');
                              // Aquí podrías actualizar el estado de la UI
                            }} 
                          />
                        </div>

                        <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center">
                                <span className="text-xl">🎨</span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">Cuadro Abstracto</h4>
                                <p className="text-gray-400 text-sm">Pedido #12346</p>
                                <p className="text-gray-500 text-xs">Comprado hace 1 día</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#10B981]">0.02 ETH</div>
                              <div className="text-gray-400 text-sm">Pendiente</div>
                            </div>
                          </div>
                          
                          <ProofOfDelivery 
                            orderId={12346} 
                            onProofSubmitted={() => {
                              console.log('Entrega confirmada para pedido #12346');
                            }} 
                          />
                        </div>
                      </div>

                      {/* Información sobre el proceso */}
                      <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-xl p-4 border border-[#3B82F6]/30">
                        <h3 className="text-sm font-bold text-[#3B82F6] mb-2">💡 ¿Cómo funciona la confirmación de entrega?</h3>
                        <ul className="text-xs text-gray-300 space-y-1">
                          <li>• Sube una foto del producto recibido</li>
                          <li>• Firma un mensaje para confirmar la recepción</li>
                          <li>• El vendedor recibirá el pago automáticamente</li>
                          <li>• El sistema usa tecnología blockchain para garantizar la transparencia</li>
                        </ul>
              </div>
            </div>
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