"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  location: string;
  rating: number;
  sortBy: 'price' | 'rating' | 'newest' | 'popular';
  availability: 'all' | 'available' | 'sold';
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  categories: Array<{ id: number; name: string; icon: string }>;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  isOpen, 
  onClose, 
  onSearch, 
  categories 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    priceRange: [0, 1000],
    location: '',
    rating: 0,
    sortBy: 'newest',
    availability: 'all'
  });

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: 'all',
      priceRange: [0, 1000],
      location: '',
      rating: 0,
      sortBy: 'newest',
      availability: 'all'
    });
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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🔍 Búsqueda Avanzada</h2>
                <p className="text-gray-400">Encuentra exactamente lo que buscas</p>
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Búsqueda por texto */}
              <div className="space-y-2">
                <label className="text-white font-medium">🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="text-white font-medium">📂 Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de precio */}
              <div className="space-y-2">
                <label className="text-white font-medium">💰 Rango de Precio</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                    }))}
                    className="w-full px-3 py-2 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000] 
                    }))}
                    className="w-full px-3 py-2 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="text-white font-medium">📍 Ubicación</label>
                <input
                  type="text"
                  placeholder="Ciudad, estado o código postal"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              {/* Calificación mínima */}
              <div className="space-y-2">
                <label className="text-white font-medium">⭐ Calificación Mínima</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFilters(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition-colors ${
                        star <= filters.rating ? 'text-[#FFD700]' : 'text-gray-400'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                    className="text-sm text-gray-400 hover:text-white ml-2"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Ordenar por */}
              <div className="space-y-2">
                <label className="text-white font-medium">🔄 Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price">Precio (menor a mayor)</option>
                  <option value="rating">Mejor calificados</option>
                  <option value="popular">Más populares</option>
                </select>
              </div>

              {/* Disponibilidad */}
              <div className="space-y-2">
                <label className="text-white font-medium">📦 Disponibilidad</label>
                <div className="flex space-x-4">
                  {[
                    { value: 'all', label: 'Todos', icon: '📦' },
                    { value: 'available', label: 'Disponibles', icon: '✅' },
                    { value: 'sold', label: 'Vendidos', icon: '❌' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, availability: option.value as any }))}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        filters.availability === option.value
                          ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                          : 'border-[#333333] bg-[#0A0A0A] text-gray-400 hover:border-[#FFD700]'
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtros aplicados */}
            <div className="mt-6 p-4 bg-[#0A0A0A] rounded-lg border border-[#333333]">
              <h3 className="text-white font-medium mb-3">🎯 Filtros Aplicados</h3>
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <span className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm">
                    🔍 "{filters.query}"
                  </span>
                )}
                {filters.category !== 'all' && (
                  <span className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm">
                    📂 {filters.category}
                  </span>
                )}
                <span className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm">
                  💰 ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </span>
                {filters.rating > 0 && (
                  <span className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm">
                    ⭐ {filters.rating}+ estrellas
                  </span>
                )}
                {filters.location && (
                  <span className="px-3 py-1 bg-[#FFD700] text-black rounded-full text-sm">
                    📍 {filters.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#333333] bg-[#0A0A0A]">
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
              >
                🔄 Limpiar Filtros
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                >
                  🔍 Buscar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
