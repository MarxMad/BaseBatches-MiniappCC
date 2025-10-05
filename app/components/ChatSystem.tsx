"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  productId: number;
  productName: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ 
  isOpen, 
  onClose, 
  sellerId,
  sellerName,
  productId,
  productName
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderId: sellerId,
      senderName: sellerName,
      senderAvatar: "👨‍💼",
      content: "¡Hola! Gracias por tu interés en mi producto. ¿En qué puedo ayudarte?",
      timestamp: "2024-01-15 10:30",
      isRead: true,
      type: 'text'
    },
    {
      id: 2,
      senderId: "buyer",
      senderName: "Tú",
      senderAvatar: "👤",
      content: "Hola, me interesa este producto. ¿Está disponible?",
      timestamp: "2024-01-15 10:32",
      isRead: true,
      type: 'text'
    },
    {
      id: 3,
      senderId: sellerId,
      senderName: sellerName,
      senderAvatar: "👨‍💼",
      content: "Sí, está disponible. ¿Te gustaría ver más fotos?",
      timestamp: "2024-01-15 10:35",
      isRead: true,
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      senderId: "buyer",
      senderName: "Tú",
      senderAvatar: "👤",
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular respuesta del vendedor
    setIsTyping(true);
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        senderId: sellerId,
        senderName: sellerName,
        senderAvatar: "👨‍💼",
        content: "Gracias por tu mensaje. Te responderé pronto.",
        timestamp: new Date().toLocaleString(),
        isRead: true,
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl h-[80vh] border border-[#333333] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h2 className="text-xl font-bold text-white">Chat con {sellerName}</h2>
                  <p className="text-gray-400 text-sm">Producto: {productName}</p>
                </div>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderId === 'buyer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.senderId === 'buyer'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
                    : 'bg-[#0A0A0A] text-white border border-[#333333]'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">{message.senderAvatar}</span>
                    <span className="text-xs font-medium">{message.senderName}</span>
                    <span className="text-xs opacity-70">{message.timestamp}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#0A0A0A] text-white border border-[#333333] px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">👨‍💼</span>
                    <span className="text-xs font-medium">{sellerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">escribiendo...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#333333] bg-[#0A0A0A]">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 bg-[#1A1A1A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤
              </button>
            </div>
            
            {/* Quick actions */}
            <div className="flex space-x-2 mt-3">
              <button className="px-3 py-1 bg-[#333333] text-white rounded-full text-xs hover:bg-[#444444] transition-colors">
                📷 Foto
              </button>
              <button className="px-3 py-1 bg-[#333333] text-white rounded-full text-xs hover:bg-[#444444] transition-colors">
                📎 Archivo
              </button>
              <button className="px-3 py-1 bg-[#333333] text-white rounded-full text-xs hover:bg-[#444444] transition-colors">
                📍 Ubicación
              </button>
              <button className="px-3 py-1 bg-[#333333] text-white rounded-full text-xs hover:bg-[#444444] transition-colors">
                💰 Precio
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
