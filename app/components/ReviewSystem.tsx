"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

interface ReviewSystemProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: Omit<Review, 'id' | 'date' | 'helpful'>) => void;
}

const mockReviews: Review[] = [
  {
    id: 1,
    userId: "0x1234...5678",
    userName: "Ana García",
    userAvatar: "👩",
    rating: 5,
    title: "¡Excelente producto!",
    comment: "Llegó en perfecto estado y antes de lo esperado. El vendedor fue muy atento y respondió todas mis preguntas rápidamente.",
    date: "2024-01-15",
    helpful: 12,
    verified: true,
    images: ["https://via.placeholder.com/150x150/FFD700/000000?text=Imagen+1"]
  },
  {
    id: 2,
    userId: "0x9876...5432",
    userName: "Carlos López",
    userAvatar: "👨",
    rating: 4,
    title: "Muy bueno",
    comment: "El producto cumple con lo esperado. La calidad es buena y el precio justo. Lo recomiendo.",
    date: "2024-01-14",
    helpful: 8,
    verified: true
  },
  {
    id: 3,
    userId: "0x4567...8901",
    userName: "María Rodríguez",
    userAvatar: "👩‍🎓",
    rating: 5,
    title: "Super recomendado",
    comment: "Increíble experiencia de compra. El vendedor fue muy profesional y el producto superó mis expectativas.",
    date: "2024-01-13",
    helpful: 15,
    verified: true,
    images: ["https://via.placeholder.com/150x150/4CAF50/FFFFFF?text=Imagen+2", "https://via.placeholder.com/150x150/2196F3/FFFFFF?text=Imagen+3"]
  }
];

export const ReviewSystem: React.FC<ReviewSystemProps> = ({ 
  productId, 
  isOpen, 
  onClose, 
  onSubmitReview 
}) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  });
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating'>('newest');

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || !newReview.title || !newReview.comment) return;

    const review: Omit<Review, 'id' | 'date' | 'helpful'> = {
      userId: "0x" + Math.random().toString(16).substr(2, 8) + "...",
      userName: "Usuario Anónimo",
      userAvatar: "👤",
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      verified: false,
      images: newReview.images
    };

    onSubmitReview(review);
    setNewReview({ rating: 0, title: '', comment: '', images: [] });
    setShowWriteReview(false);
  };

  const handleHelpful = (reviewId: number) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const filteredReviews = reviews
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

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
                <h2 className="text-2xl font-bold text-white mb-2">⭐ Reseñas y Calificaciones</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-2xl ${star <= averageRating ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">({totalReviews} reseñas)</span>
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Filtros y ordenamiento */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterRating(0)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterRating === 0 
                      ? 'bg-[#FFD700] text-black' 
                      : 'bg-[#333333] text-gray-400 hover:bg-[#444444]'
                  }`}
                >
                  Todas
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filterRating === rating 
                        ? 'bg-[#FFD700] text-black' 
                        : 'bg-[#333333] text-gray-400 hover:bg-[#444444]'
                    }`}
                  >
                    {rating}⭐
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="newest">Más recientes</option>
                  <option value="helpful">Más útiles</option>
                  <option value="rating">Mejor calificadas</option>
                </select>
                
                <button
                  onClick={() => setShowWriteReview(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                >
                  ✍️ Escribir Reseña
                </button>
              </div>
            </div>

            {/* Lista de reseñas */}
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{review.userAvatar}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{review.userName}</span>
                          {review.verified && (
                            <span className="text-[#FFD700] text-sm">✓ Verificado</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-lg ${star <= review.rating ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center space-x-1 text-gray-400 hover:text-[#FFD700] transition-colors"
                    >
                      <span>👍</span>
                      <span>{review.helpful}</span>
                    </button>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2">{review.title}</h3>
                  <p className="text-gray-300 mb-4">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-[#333333]"
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modal para escribir reseña */}
          <AnimatePresence>
            {showWriteReview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-60"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#1A1A1A] rounded-2xl w-full max-w-2xl border border-[#333333] shadow-2xl"
                >
                  <div className="p-6 border-b border-[#333333]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">✍️ Escribir Reseña</h3>
                      <button
                        onClick={() => setShowWriteReview(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-white font-medium mb-2 block">⭐ Calificación</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className={`text-3xl transition-colors ${
                              star <= newReview.rating ? 'text-[#FFD700]' : 'text-gray-400'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white font-medium mb-2 block">📝 Título</label>
                      <input
                        type="text"
                        placeholder="Resume tu experiencia..."
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                      />
                    </div>
                    
                    <div>
                      <label className="text-white font-medium mb-2 block">💬 Comentario</label>
                      <textarea
                        placeholder="Cuéntanos más detalles sobre tu experiencia..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-[#0A0A0A] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-[#333333] flex justify-end space-x-4">
                    <button
                      onClick={() => setShowWriteReview(false)}
                      className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                    >
                      📝 Publicar Reseña
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
