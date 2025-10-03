"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardUser {
  id: number;
  address: string;
  name: string;
  points: number;
  stories: number;
  votes: number;
  rank: number;
  avatar: string;
  badges: string[];
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers: LeaderboardUser[] = [
  {
    id: 1,
    address: "0x1234...5678",
    name: "Estudiante Pro",
    points: 1250,
    stories: 15,
    votes: 89,
    rank: 1,
    avatar: "👑",
    badges: ["🏆", "⭐", "🔥"]
  },
  {
    id: 2,
    address: "0x9876...5432",
    name: "Math Genius",
    points: 980,
    stories: 12,
    votes: 67,
    rank: 2,
    avatar: "🧠",
    badges: ["🏆", "⭐"]
  },
  {
    id: 3,
    address: "0x4567...8901",
    name: "Physics Master",
    points: 850,
    stories: 10,
    votes: 54,
    rank: 3,
    avatar: "⚡",
    badges: ["🏆"]
  },
  {
    id: 4,
    address: "0x2468...1357",
    name: "Chem Expert",
    points: 720,
    stories: 8,
    votes: 43,
    rank: 4,
    avatar: "🧪",
    badges: ["⭐"]
  },
  {
    id: 5,
    address: "0x1357...2468",
    name: "Code Wizard",
    points: 650,
    stories: 7,
    votes: 38,
    rank: 5,
    avatar: "💻",
    badges: ["🔥"]
  }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [users] = useState<LeaderboardUser[]>(mockUsers);

  if (!isOpen) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-[#FFD700] to-[#FFA500]";
    }
  };

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
                <h2 className="text-2xl font-bold text-white mb-2">🏆 Leaderboard</h2>
                <p className="text-gray-400">Los mejores contribuidores de la comunidad</p>
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

          {/* Filters */}
          <div className="p-4 border-b border-[#333333]">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Todos los tiempos' },
                { key: 'week', label: 'Esta semana' },
                { key: 'month', label: 'Este mes' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setTimeFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === filter.key
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
                      : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${getRankColor(user.rank)} p-1 rounded-xl`}
                >
                  <div className="bg-[#0A0A0A] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-bold">
                            {getRankIcon(user.rank)}
                          </div>
                          <div className="text-3xl">
                            {user.avatar}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{user.name}</h3>
                          <p className="text-gray-400 text-sm">{user.address}</p>
                          <div className="flex space-x-1 mt-1">
                            {user.badges.map((badge, idx) => (
                              <span key={idx} className="text-lg">{badge}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#FFD700]">{user.points}</div>
                        <div className="text-gray-400 text-sm">puntos</div>
                        <div className="flex space-x-4 mt-2 text-sm text-gray-300">
                          <span>{user.stories} stories</span>
                          <span>{user.votes} votos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rewards Section */}
            <div className="mt-8 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl p-6 border border-[#FFD700]/20">
              <h3 className="text-xl font-bold text-white mb-4">🎁 Recompensas por Contribución</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="text-white font-semibold mb-2">Por Story</h4>
                  <p className="text-gray-400 text-sm">+10 puntos por cada story publicada</p>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="text-2xl mb-2">👍</div>
                  <h4 className="text-white font-semibold mb-2">Por Voto</h4>
                  <p className="text-gray-400 text-sm">+1 punto por cada voto recibido</p>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333]">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="text-white font-semibold mb-2">Top 3</h4>
                  <p className="text-gray-400 text-sm">Descuentos especiales en el marketplace</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
