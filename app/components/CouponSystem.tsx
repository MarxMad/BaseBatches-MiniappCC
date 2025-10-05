"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}

interface CouponSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (coupon: Coupon) => void;
}

export const CouponSystem: React.FC<CouponSystemProps> = ({ isOpen, onClose, onApplyCoupon }) => {
  const [searchCode, setSearchCode] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  const availableCoupons: Coupon[] = [
    {
      id: 1,
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minAmount: 0.01,
      maxDiscount: 0.05,
      expiresAt: '2024-12-31',
      usageLimit: 100,
      usedCount: 23,
      isActive: true,
      description: '10% de descuento para nuevos usuarios'
    },
    {
      id: 2,
      code: 'STUDENT20',
      type: 'percentage',
      value: 20,
      minAmount: 0.02,
      maxDiscount: 0.1,
      expiresAt: '2024-06-30',
      usageLimit: 50,
      usedCount: 12,
      isActive: true,
      description: 'Descuento especial para estudiantes'
    },
    {
      id: 3,
      code: 'SAVE5',
      type: 'fixed',
      value: 0.05,
      minAmount: 0.1,
      expiresAt: '2024-03-31',
      usageLimit: 200,
      usedCount: 45,
      isActive: true,
      description: '5 ETH de descuento en compras mayores a 0.1 ETH'
    },
    {
      id: 4,
      code: 'FLASH50',
      type: 'percentage',
      value: 50,
      minAmount: 0.01,
      maxDiscount: 0.2,
      expiresAt: '2024-01-31',
      usageLimit: 10,
      usedCount: 8,
      isActive: true,
      description: '¡Oferta flash! 50% de descuento (limitado)'
    }
  ];

  const handleApplyCoupon = (coupon: Coupon) => {
    onApplyCoupon(coupon);
    onClose();
  };

  const filteredCoupons = availableCoupons.filter(coupon => 
    coupon.isActive && 
    (searchCode === '' || coupon.code.toLowerCase().includes(searchCode.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🎟️ Cupones y Descuentos</h2>
                <p className="text-gray-400">Aplica cupones para obtener descuentos especiales</p>
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

          {/* Search */}
          <div className="p-6 border-b border-[#333333]">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Buscar cupón por código..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all">
                🔍 Buscar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCoupons.map((coupon) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedCoupon?.id === coupon.id
                      ? 'border-[#FFD700] bg-[#FFD700]/10'
                      : 'border-[#333333] bg-[#0A0A0A] hover:border-[#FFD700]/50'
                  }`}
                  onClick={() => setSelectedCoupon(coupon)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{coupon.code}</h3>
                      <p className="text-gray-400 text-sm">{coupon.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#FFD700]">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ETH`}
                      </div>
                      <div className="text-gray-400 text-sm">descuento</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Válido hasta:</span>
                      <span className="text-white">{coupon.expiresAt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Usos restantes:</span>
                      <span className="text-white">
                        {coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : '∞'}
                      </span>
                    </div>
                    {coupon.minAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Compra mínima:</span>
                        <span className="text-white">{coupon.minAmount} ETH</span>
                      </div>
                    )}
                    {coupon.maxDiscount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Descuento máximo:</span>
                        <span className="text-white">{coupon.maxDiscount} ETH</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-[#333333] rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-2 rounded-full"
                      style={{ 
                        width: `${coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>

                  <button
                    onClick={() => handleApplyCoupon(coupon)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                  >
                    🎟️ Aplicar Cupón
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎟️</div>
                <h3 className="text-xl font-bold text-white mb-2">No se encontraron cupones</h3>
                <p className="text-gray-400">Intenta con otro código de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#333333] bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                💡 Tip: Los cupones se aplican automáticamente al checkout
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                >
                  Cancelar
                </button>
                {selectedCoupon && (
                  <button
                    onClick={() => handleApplyCoupon(selectedCoupon)}
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                  >
                    🎟️ Aplicar {selectedCoupon.code}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
