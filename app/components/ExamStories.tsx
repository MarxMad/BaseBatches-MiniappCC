"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamStory {
  id: number;
  title: string;
  professor: string;
  subject: string;
  examType: string;
  content: string;
  author: string;
  votes: number;
  createdAt: string;
  image?: string;
}

interface ExamStoriesProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockStories: ExamStory[] = [
  {
    id: 1,
    title: "Examen Final - Cálculo Diferencial",
    professor: "Dr. García",
    subject: "Matemáticas",
    examType: "Final",
    content: "Aquí están las respuestas del examen final de cálculo diferencial. Incluye derivadas, límites y aplicaciones...",
    author: "0x1234...5678",
    votes: 15,
    createdAt: "2024-01-15",
    image: "https://via.placeholder.com/300x200/FFD700/000000?text=Calculo+Final"
  },
  {
    id: 2,
    title: "Parcial 2 - Física I",
    professor: "Dra. López",
    subject: "Física",
    examType: "Parcial",
    content: "Respuestas del segundo parcial de física. Mecánica clásica, cinemática y dinámica...",
    author: "0x9876...5432",
    votes: 23,
    createdAt: "2024-01-14",
    image: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Fisica+Parcial"
  },
  {
    id: 3,
    title: "Quiz - Química Orgánica",
    professor: "Dr. Martínez",
    subject: "Química",
    examType: "Quiz",
    content: "Quiz de química orgánica con nomenclatura, reacciones y síntesis...",
    author: "0x4567...8901",
    votes: 8,
    createdAt: "2024-01-13",
    image: "https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Quimica+Quiz"
  }
];

export const ExamStories: React.FC<ExamStoriesProps> = ({ isOpen, onClose }) => {
  const [stories, setStories] = useState<ExamStory[]>(mockStories);
  const [selectedStory, setSelectedStory] = useState<ExamStory | null>(null);
  const [newStory, setNewStory] = useState({
    title: '',
    professor: '',
    subject: '',
    examType: '',
    content: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleVote = (storyId: number, voteType: 'up' | 'down') => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, votes: voteType === 'up' ? story.votes + 1 : Math.max(0, story.votes - 1) }
        : story
    ));
  };

  const handleCreateStory = () => {
    if (!newStory.title || !newStory.professor || !newStory.content) return;
    
    const story: ExamStory = {
      id: Date.now(),
      ...newStory,
      author: "0x" + Math.random().toString(16).substr(2, 8) + "...",
      votes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      image: `https://via.placeholder.com/300x200/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${encodeURIComponent(newStory.subject)}`
    };
    
    setStories(prev => [story, ...prev]);
    setNewStory({ title: '', professor: '', subject: '', examType: '', content: '' });
    setShowCreateForm(false);
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
          className="bg-[#1A1A1A] rounded-2xl w-full max-w-6xl max-h-[90vh] border border-[#333333] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#333333] bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">📚 Stories de Exámenes</h2>
                <p className="text-gray-400">Comparte y descubre respuestas de exámenes universitarios</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                >
                  + Nueva Story
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {showCreateForm ? (
              <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#333333] mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Crear Nueva Story</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título del examen"
                    value={newStory.title}
                    onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                    className="px-4 py-3 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  />
                  <input
                    type="text"
                    placeholder="Profesor"
                    value={newStory.professor}
                    onChange={(e) => setNewStory(prev => ({ ...prev, professor: e.target.value }))}
                    className="px-4 py-3 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  />
                  <select
                    value={newStory.subject}
                    onChange={(e) => setNewStory(prev => ({ ...prev, subject: e.target.value }))}
                    className="px-4 py-3 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="">Seleccionar materia</option>
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biología">Biología</option>
                    <option value="Programación">Programación</option>
                    <option value="Economía">Economía</option>
                    <option value="Derecho">Derecho</option>
                  </select>
                  <select
                    value={newStory.examType}
                    onChange={(e) => setNewStory(prev => ({ ...prev, examType: e.target.value }))}
                    className="px-4 py-3 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="">Tipo de examen</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Final">Final</option>
                    <option value="Extraordinario">Extraordinario</option>
                  </select>
                </div>
                <textarea
                  placeholder="Contenido de la story (respuestas, explicaciones, etc.)"
                  value={newStory.content}
                  onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full mt-4 px-4 py-3 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700]"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateStory}
                    className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg font-medium hover:from-[#FFA500] hover:to-[#FF8C00] transition-all"
                  >
                    Publicar Story
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] rounded-xl border border-[#333333] overflow-hidden hover:border-[#FFD700] transition-all cursor-pointer"
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="h-48 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 flex items-center justify-center">
                      <div className="text-6xl">📚</div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-[#FFD700] text-black text-xs font-bold rounded-full">
                          {story.examType}
                        </span>
                        <span className="text-[#FFD700] text-sm font-medium">
                          {story.votes} votos
                        </span>
                      </div>
                      <h3 className="text-white font-bold mb-1 line-clamp-2">{story.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">Prof. {story.professor}</p>
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{story.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">{story.author}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(story.id, 'up');
                            }}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            👍
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(story.id, 'down');
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            👎
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
