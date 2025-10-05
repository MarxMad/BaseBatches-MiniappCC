"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'success',
      title: '¡Compra exitosa!',
      message: 'Tu producto "Libro de Matemáticas" ha sido comprado exitosamente.',
      timestamp: '2024-01-15 14:30',
      isRead: false,
      action: {
        label: 'Ver detalles',
        onClick: () => console.log('Ver detalles de compra')
      }
    },
    {
      id: 2,
      type: 'info',
      title: 'Nuevo mensaje',
      message: 'Tienes un nuevo mensaje de Carlos López sobre tu producto.',
      timestamp: '2024-01-15 13:45',
      isRead: false,
      action: {
        label: 'Responder',
        onClick: () => console.log('Abrir chat')
      }
    },
    {
      id: 3,
      type: 'warning',
      title: 'Producto pendiente',
      message: 'Tu producto "Curso de Programación" está pendiente de aprobación.',
      timestamp: '2024-01-15 12:20',
      isRead: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Venta completada',
      message: 'Has vendido "Guía de Física" por 0.05 ETH.',
      timestamp: '2024-01-15 11:15',
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'error' | 'warning' | 'info'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-2xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🔔 Notificaciones</h2>
                <p className="text-gray-400">{unreadCount} sin leer</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors text-sm"
                >
                  Marcar todas como leídas
                </button>
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

          {/* Filters */}
          <div className="p-4 border-b border-[#333333]">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todas', icon: '📢' },
                { key: 'unread', label: 'Sin leer', icon: '🔴' },
                { key: 'success', label: 'Éxito', icon: '✅' },
                { key: 'error', label: 'Error', icon: '❌' },
                { key: 'warning', label: 'Advertencia', icon: '⚠️' },
                { key: 'info', label: 'Info', icon: 'ℹ️' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === filterOption.key
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] hover:text-white'
                  }`}
                >
                  {filterOption.icon} {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔔</div>
                  <h3 className="text-xl font-bold text-white mb-2">No hay notificaciones</h3>
                  <p className="text-gray-400">No tienes notificaciones en esta categoría</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.isRead ? 'bg-[#0A0A0A]' : 'bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-white font-semibold">{notification.title}</h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                          <p className="text-gray-500 text-xs">{notification.timestamp}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {notification.action && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              notification.action?.onClick();
                            }}
                            className="px-3 py-1 bg-[#FFD700] text-black rounded text-xs font-medium hover:bg-[#FFA500] transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {notification.isRead ? '✓' : '○'}
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
