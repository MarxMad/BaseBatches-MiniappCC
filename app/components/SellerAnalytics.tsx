"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  monthlyData: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'sale' | 'review' | 'message';
    description: string;
    timestamp: string;
  }>;
}

interface SellerAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ isOpen, onClose }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const analyticsData: AnalyticsData = {
    totalSales: 47,
    totalRevenue: 2.35,
    averageRating: 4.7,
    totalReviews: 23,
    conversionRate: 12.5,
    topProducts: [
      { id: 1, name: "Libro de Matemáticas", sales: 15, revenue: 0.75 },
      { id: 2, name: "Guía de Física", sales: 12, revenue: 0.60 },
      { id: 3, name: "Curso de Programación", sales: 8, revenue: 0.40 },
      { id: 4, name: "Manual de Química", sales: 7, revenue: 0.35 },
      { id: 5, name: "Resumen de Historia", sales: 5, revenue: 0.25 }
    ],
    monthlyData: [
      { month: "Ene", sales: 8, revenue: 0.40 },
      { month: "Feb", sales: 12, revenue: 0.60 },
      { month: "Mar", sales: 15, revenue: 0.75 },
      { month: "Abr", sales: 18, revenue: 0.90 },
      { month: "May", sales: 22, revenue: 1.10 },
      { month: "Jun", sales: 19, revenue: 0.95 }
    ],
    recentActivity: [
      {
        id: 1,
        type: 'sale',
        description: "Vendiste 'Libro de Matemáticas' por 0.05 ETH",
        timestamp: "2024-01-15 14:30"
      },
      {
        id: 2,
        type: 'review',
        description: "Nueva reseña 5⭐ para 'Guía de Física'",
        timestamp: "2024-01-15 13:45"
      },
      {
        id: 3,
        type: 'message',
        description: "Nuevo mensaje sobre 'Curso de Programación'",
        timestamp: "2024-01-15 12:20"
      },
      {
        id: 4,
        type: 'sale',
        description: "Vendiste 'Manual de Química' por 0.05 ETH",
        timestamp: "2024-01-15 11:15"
      }
    ]
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1A1A1A] rounded-2xl w-full max-w-6xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">📊 Analytics de Vendedor</h2>
              <p className="text-gray-400">Métricas y estadísticas de tus ventas</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <div className="text-green-400 text-sm">+12.5%</div>
              </div>
              <h3 className="text-white font-bold text-2xl">{analyticsData.totalRevenue} ETH</h3>
              <p className="text-gray-400 text-sm">Ingresos totales</p>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📦</div>
                <div className="text-green-400 text-sm">+8.2%</div>
              </div>
              <h3 className="text-white font-bold text-2xl">{analyticsData.totalSales}</h3>
              <p className="text-gray-400 text-sm">Productos vendidos</p>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⭐</div>
                <div className="text-green-400 text-sm">+0.3</div>
              </div>
              <h3 className="text-white font-bold text-2xl">{analyticsData.averageRating}</h3>
              <p className="text-gray-400 text-sm">Calificación promedio</p>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📈</div>
                <div className="text-green-400 text-sm">+2.1%</div>
              </div>
              <h3 className="text-white font-bold text-2xl">{analyticsData.conversionRate}%</h3>
              <p className="text-gray-400 text-sm">Tasa de conversión</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <h3 className="text-xl font-bold text-white mb-6">🏆 Productos Top</h3>
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{product.name}</h4>
                        <p className="text-gray-400 text-sm">{product.sales} ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FFD700] font-bold">{product.revenue} ETH</p>
                      <p className="text-gray-400 text-sm">Ingresos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
              <h3 className="text-xl font-bold text-white mb-6">🕒 Actividad Reciente</h3>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 bg-[#1A1A1A] rounded-lg">
                    <div className="text-2xl">
                      {activity.type === 'sale' ? '💰' : 
                       activity.type === 'review' ? '⭐' : '💬'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="mt-8 bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]">
            <h3 className="text-xl font-bold text-white mb-6">📈 Rendimiento Mensual</h3>
            <div className="flex items-end justify-between space-x-2">
              {analyticsData.monthlyData.map((data, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className="bg-gradient-to-t from-[#FFD700] to-[#FFA500] rounded-t-lg mb-2"
                       style={{ height: `${(data.sales / 25) * 100}px` }}>
                  </div>
                  <p className="text-gray-400 text-xs">{data.month}</p>
                  <p className="text-white text-sm font-semibold">{data.sales}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="mt-8 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl p-6 border border-[#FFD700]/20">
            <h3 className="text-xl font-bold text-white mb-4">💡 Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">🎯 Mejor momento para vender</h4>
                <p className="text-gray-300 text-sm">Los martes y jueves entre 2-4 PM son tus horas pico de ventas.</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">📚 Categoría popular</h4>
                <p className="text-gray-300 text-sm">Los libros de matemáticas representan el 32% de tus ventas.</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">💰 Precio óptimo</h4>
                <p className="text-gray-300 text-sm">Productos entre 0.03-0.05 ETH tienen la mejor conversión.</p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">⭐ Calidad</h4>
                <p className="text-gray-300 text-sm">Tu calificación promedio de 4.7⭐ está por encima del promedio.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
