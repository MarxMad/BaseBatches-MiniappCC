"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactScreenProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  sellerAddress: string;
  buyerAddress: string;
  onContactSent: (message: string, contactInfo: string) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({
  isOpen,
  onClose,
  bookTitle,
  sellerAddress,
  buyerAddress,
  onContactSent
}) => {
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !contactInfo.trim()) {
      return;
    }

    setIsSending(true);
    
    // Simular envío de mensaje
    setTimeout(() => {
      onContactSent(message, contactInfo);
      setIsSending(false);
      onClose();
    }, 2000);
  };

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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-2xl border border-[#333333] shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">📞 Contactar al Vendedor</h2>
                <p className="text-gray-400">Libro: <span className="text-[#FFD700] font-medium">{bookTitle}</span></p>
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Información de la transacción */}
            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#2A2A2A]">
              <h3 className="text-lg font-semibold text-white mb-3">📋 Detalles de la Compra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Vendedor:</span>
                  <p className="text-white font-mono">{sellerAddress.slice(0, 6)}...{sellerAddress.slice(-4)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Comprador:</span>
                  <p className="text-white font-mono">{buyerAddress.slice(0, 6)}...{buyerAddress.slice(-4)}</p>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">
                  📧 Información de Contacto
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email, teléfono, o método de contacto preferido"
                  className="w-full px-4 py-3 bg-[#222222] text-white rounded-xl border border-[#333333] 
                           focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700] 
                           transition-all placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">
                  💬 Mensaje para el Vendedor
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí... (ej: Hola, me gustaría coordinar la entrega del libro...)"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#222222] text-white rounded-xl border border-[#333333] 
                           focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700] 
                           transition-all placeholder-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl p-4 border border-[#FFD700]/20">
              <h4 className="text-[#FFD700] font-semibold mb-2">📝 Instrucciones</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Proporciona tu información de contacto para coordinar la entrega</li>
                <li>• Especifica el método de entrega preferido (presencial, envío, etc.)</li>
                <li>• Acuerda el lugar y horario de encuentro</li>
                <li>• Una vez entregado, confirma la recepción en la plataforma</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#333333] bg-[#1A1A1A] rounded-b-2xl">
            <div className="flex gap-4 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#333333] text-white rounded-xl hover:bg-[#444444] 
                         transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !contactInfo.trim() || isSending}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl 
                         hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Enviar Contacto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
