"use client";

import { useState } from 'react';
import { GameStats, Achievement } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GameStatsProps {
  onClose: () => void;
  stats: GameStats[];
}

export function GameStats({ onClose, stats }: GameStatsProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const getGameStats = (gameId: string) => {
    return stats.find(stat => stat.id === gameId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#50FA7B';
    if (progress >= 50) return '#FFD700';
    if (progress >= 25) return '#FF79C6';
    return '#FF5555';
  };

  const calculateProgress = (game: GameStats) => {
    const unlockedAchievements = game.achievements.filter(a => a.unlocked).length;
    return (unlockedAchievements / game.achievements.length) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Estadísticas de Juegos</h2>
          <button
            onClick={onClose}
            className="text-[#B8B8B8] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`bg-[#1A1A1A] p-4 rounded-xl border transition-all ${
                selectedGame === game.id
                  ? 'border-[#FFD700]'
                  : 'border-[#2A2A2A] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{game.name}</h3>
                <span className="text-[#B8B8B8] text-sm">{game.totalGames} partidas</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#B8B8B8]">Mejor Puntuación</span>
                    <span className="text-[#FFD700]">{game.bestScore}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B8B8B8]">Última Partida</span>
                    <span className="text-[#B8B8B8]">{formatDate(game.lastPlayed)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#B8B8B8]">Progreso</span>
                    <span className="text-[#B8B8B8]">
                      {calculateProgress(game).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${calculateProgress(game)}%`,
                        backgroundColor: getProgressColor(calculateProgress(game))
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedGame && (
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Progreso */}
              <div className="bg-[#2A2A2A] rounded-xl p-4">
                <h4 className="text-lg font-bold text-white mb-4">Historial de Puntuaciones</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getGameStats(selectedGame)?.history.map(h => ({
                        date: new Date(h.date).getTime(),
                        score: h.score
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis
                        dataKey="date"
                        type="number"
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        stroke="#666666"
                      />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #333333',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Puntuación']}
                        labelFormatter={(label: number) => new Date(label).toLocaleDateString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#FFD700"
                        strokeWidth={2}
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Logros */}
              <div className="bg-[#2A2A2A] rounded-xl p-4">
                <h4 className="text-lg font-bold text-white mb-4">Logros</h4>
                <div className="space-y-4">
                  {getGameStats(selectedGame)?.achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`bg-[#1A1A1A] p-4 rounded-lg border ${
                        achievement.unlocked
                          ? 'border-[#50FA7B]'
                          : 'border-[#333333] opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#2A2A2A]">
                          <svg
                            className={`w-6 h-6 ${
                              achievement.unlocked ? 'text-[#50FA7B]' : 'text-[#666666]'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={achievement.icon}
                            />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">{achievement.name}</h5>
                          <p className="text-sm text-[#B8B8B8]">{achievement.description}</p>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-[#50FA7B] mt-1">
                              Desbloqueado el {formatDate(achievement.unlockedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 