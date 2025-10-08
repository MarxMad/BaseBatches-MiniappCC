"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: number | bigint;
  category: string;
  image: string;
  seller: string;
  buyer?: string;
  delivered: boolean;
  rating: number;
  tokenURI: string;
  isAvailable?: boolean;
}

interface BookCardProps {
  book: Book;
  userTokens?: number | null;
  onBuy?: (bookId: number) => void;
  isBuying?: boolean;
}

export default function BookCard({ book, userTokens, onBuy, isBuying }: BookCardProps) {
  const originalPrice = typeof book.price === 'bigint' ? Number(book.price) : book.price;
  const discountedPrice = userTokens 
    ? originalPrice - (originalPrice * 10 / 100) // 10% de descuento por tokens
    : originalPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl border border-[#333333] overflow-hidden hover:border-[#FFD700] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
    >
      {/* Imagen del libro */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Image
          src={book.image || '/placeholder-book.jpg'}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Badge de descuento */}
        {userTokens && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white px-3 py-1 rounded-full text-sm font-bold">
            -10%
          </div>
        )}
        
        {/* Badge de categoría */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
          {book.category}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5">
        {/* Título y autor */}
        <div className="mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-[#FFD700] transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-1">
            por {book.author}
          </p>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
          {book.description}
        </p>

        {/* Precio */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {userTokens && (
              <span className="text-lg text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold text-[#FFD700]">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-400">{book.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Botón de compra */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onBuy?.(book.id)}
          disabled={isBuying || !book.isAvailable}
          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBuying ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Procesando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🛒</span>
              <span>Comprar Ahora</span>
            </div>
          )}
        </motion.button>

        {/* Información adicional */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Vendido por: {book.seller.slice(0, 6)}...{book.seller.slice(-4)}</span>
          <span className="flex items-center space-x-1">
            <span>📚</span>
            <span>Disponible</span>
          </span>
        </div>
      </div>

      {/* Efecto de hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 to-[#FFA500]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
