"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TransferScreen } from './TransferScreen';
import { QRScanner } from './QRScanner';
import { SwapScreen } from './SwapScreen';
import { BookMarketplace } from './BookMarketplace';
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi';
import { formatUnits, parseUnits, type Log, decodeEventLog } from 'viem';
import type { ContractEventArgs } from 'viem';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

import { useWalletStats } from '../hooks/useWalletStats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { type Address } from 'viem';
import { GameStats } from './GameStats';
import { type GameStats as GameStatsType } from '../types';
import { sendNotification } from '../api/webhook/route';

type Challenge = {
  id: number;
  title: string;
  description: string;
  reward: string;
  progress: number;
  icon: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: {
    current: number;
    target: number;
    unit: string;
  };
  status: 'active' | 'completed' | 'expired';
};

type Expense = {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type ExpenseWithCategory = Expense & {
  categoryDetails: Category;
};

type IconOption = {
  id: string;
  path: string;
  name: string;
};

type MenuSection = 'home' | 'games' | 'expenses' | 'marketplace';

// Agregar estilos base para el dashboard
const techGradient = "bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]";
const glowEffect = "hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300";
const cardStyle = `${techGradient} rounded-2xl border border-[#333333] backdrop-blur-xl ${glowEffect}`;
const iconContainerStyle = "bg-[#111111] bg-opacity-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-70";

// Componente del menú modal
const MenuModal = ({ 
  isOpen, 
  onClose, 
  onSelectSection 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectSection: (section: MenuSection) => void; 
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'games' as MenuSection,
      title: 'Minijuegos',
      description: 'Juegos educativos y entretenimiento',
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#50FA7B'
    },
    {
      id: 'expenses' as MenuSection,
      title: 'Gestor de Gastos',
      description: 'Controla tus finanzas universitarias',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      color: '#FF79C6'
    },
    {
      id: 'marketplace' as MenuSection,
      title: 'Marketplace',
      description: 'Compra y vende libros universitarios',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: '#FFD700'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Menú Principal</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#B8B8B8] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                onClose();
              }}
              className="w-full p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-opacity-50 transition-all duration-300 group"
              style={{ borderColor: item.color + '40' }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ backgroundColor: item.color + '20' }}
                >
                  <svg 
                    className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" 
                    style={{ color: item.color }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium group-hover:text-opacity-90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#B8B8B8] group-hover:text-opacity-80 transition-colors">
                    {item.description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-[#B8B8B8] group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
          <button
            onClick={() => {
              onSelectSection('home');
              onClose();
            }}
            className="w-full p-3 bg-[#2A2A2A] text-white rounded-xl hover:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Agregar el botón de regreso en cada juego
const BackButton = ({ onBack }: { onBack: () => void }) => (
  <button
    onClick={onBack}
    className="absolute top-4 left-4 p-2 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-colors"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  </button>
);

const CatchTheCoin = ({ onBack, onGameEnd }: { onBack: () => void; onGameEnd: (score: number, duration: number) => void }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const coinSpawnerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (coinSpawnerRef.current) clearInterval(coinSpawnerRef.current);
    
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    setCoins([]);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (coinSpawnerRef.current) clearInterval(coinSpawnerRef.current);
          
          setIsPlaying(false);
          setGameOver(true);
          const duration = (Date.now() - startTimeRef.current) / 1000;
          onGameEnd(score, duration);
          if (score > highScore) {
            setHighScore(score);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    coinSpawnerRef.current = setInterval(() => {
      if (gameAreaRef.current) {
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        const newCoin = {
          id: Date.now() + Math.random(),
          x: Math.random() * (width - 40),
          y: Math.random() * (height - 40),
        };
        setCoins((prev) => [...prev, newCoin]);
      }
    }, 333);
  };

  // Limpiar temporizadores cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (coinSpawnerRef.current) clearInterval(coinSpawnerRef.current);
    };
  }, []);

  const catchCoin = (coinId: number) => {
    setCoins((prev) => prev.filter((coin) => coin.id !== coinId));
    setScore((prev) => prev + 1);
  };

  return (
    <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
      <BackButton onBack={onBack} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Catch the Coin</h2>
        <div className="flex items-center space-x-4">
          <div className="text-[#FFD700] font-bold">Puntos: {score}</div>
          <div className="text-[#FF79C6] font-bold">Tiempo: {timeLeft}s</div>
        </div>
      </div>

      {!isPlaying && !gameOver && (
        <div className="text-center py-8">
          <p className="text-[#B8B8B8] mb-4">¡Atrapa las monedas para ganar puntos!</p>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Comenzar Juego
          </button>
        </div>
      )}

      {gameOver && (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-[#FFD700] mb-2">¡Juego Terminado!</p>
          <p className="text-[#B8B8B8] mb-4">Puntuación: {score}</p>
          <p className="text-[#FF79C6] mb-4">Mejor Puntuación: {highScore}</p>
          <button
            onClick={startGame}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Jugar de Nuevo
          </button>
        </div>
      )}

      {isPlaying && (
        <div
          ref={gameAreaRef}
          className="relative w-full h-[300px] bg-[#2A2A2A] rounded-xl overflow-hidden"
        >
          {coins.map((coin) => (
            <div
              key={coin.id}
              onClick={() => catchCoin(coin.id)}
              className="absolute w-10 h-10 cursor-pointer transition-transform hover:scale-110"
              style={{
                left: `${coin.x}px`,
                top: `${coin.y}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componentes de Juegos
const GameSelector = ({ onSelectGame }: { onSelectGame: (game: string) => void }) => {
  const games = [
    {
      id: 'catch-coin',
      name: 'Catch the Coin',
      description: 'Atrapa las monedas que caen',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#FFD700'
    },
    {
      id: 'memory',
      name: 'Memory Card',
      description: 'Encuentra los pares de cartas',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: '#50FA7B'
    },
    {
      id: 'quiz',
      name: 'Crypto Quiz',
      description: 'Pon a prueba tus conocimientos',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: '#FF79C6'
    },
    {
      id: 'trading',
      name: 'Trading Simulator',
      description: 'Simula operaciones de trading',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
      color: '#8BE9FD'
    },
    {
      id: 'puzzle',
      name: 'Blockchain Puzzle',
      description: 'Ordena los bloques correctamente',
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
      color: '#BD93F9'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className="group bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#333333]/50 hover:border-[#FFD700]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[${game.color}]/20 group-hover:scale-110 transition-transform duration-500`}>
              <svg className={`w-6 h-6 text-[${game.color}]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={game.icon} />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white group-hover:text-[#FFD700] transition-colors duration-500">
                {game.name}
              </h3>
              <p className="text-sm text-[#B8B8B8] group-hover:text-white/90 transition-colors duration-500">
                {game.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

const MemoryCard = ({ onBack, onGameEnd }: { onBack: () => void; onGameEnd: (score: number, duration: number, result: 'win' | 'lose') => void }) => {
  const [cards, setCards] = useState<Array<{ id: number; value: string; flipped: boolean; matched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const startTimeRef = useRef<number>(0);

  const cryptoIcons = [
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
    'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  ];

  const initializeGame = () => {
    const pairs = cryptoIcons.flatMap((icon, index) => [
      { id: index * 2, value: icon, flipped: false, matched: false },
      { id: index * 2 + 1, value: icon, flipped: false, matched: false }
    ]);
    
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setIsChecking(false);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (clickedId: number) => {
    if (isChecking || flippedCards.length === 2) return;

    const clickedCard = cards.find(card => card.id === clickedId);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    const newCards = cards.map(card => 
      card.id === clickedId ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, clickedId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(card => card.id === firstId);
      const secondCard = newCards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true }
                : card
            )
          );
          setScore(prev => prev + 10);
          setFlippedCards([]);
          setIsChecking(false);

          const allMatched = newCards.every(card => 
            card.id === firstId || card.id === secondId ? true : card.matched
          );
          if (allMatched) {
            setGameOver(true);
            const duration = (Date.now() - startTimeRef.current) / 1000;
            onGameEnd(score + 10, duration, 'win');
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
      <BackButton onBack={onBack} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Memory Card</h2>
        <div className="flex items-center space-x-4">
          <div className="text-[#FFD700] font-bold">Puntos: {score}</div>
          <div className="text-[#FF79C6] font-bold">Movimientos: {moves}</div>
        </div>
      </div>

      {gameOver ? (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-[#FFD700] mb-2">¡Felicidades!</p>
          <p className="text-[#B8B8B8] mb-4">Completaste el juego en {moves} movimientos</p>
          <button
            onClick={initializeGame}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Jugar de Nuevo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl transition-all duration-300 transform hover:scale-105 ${
                card.flipped || card.matched
                  ? 'bg-[#2A2A2A]'
                  : 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]'
              }`}
            >
              {(card.flipped || card.matched) && (
                <svg className="w-8 h-8 text-[#FFD700] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.value} />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const allQuestions: Question[] = [
  {
    id: 1,
    question: "¿Qué es un Smart Contract?",
    options: [
      "Un contrato legal en papel",
      "Un código que se ejecuta en la blockchain",
      "Un tipo de criptomoneda",
      "Un protocolo de seguridad"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "¿Qué es Bitcoin?",
    options: [
      "Una red social",
      "Una criptomoneda descentralizada",
      "Un banco digital",
      "Un tipo de contrato"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "¿Qué es la blockchain?",
    options: [
      "Una base de datos centralizada",
      "Un libro contable distribuido",
      "Un tipo de servidor",
      "Una red social"
    ],
    correctAnswer: 1
    },
    {
      id: 4,
    question: "¿Qué significa HODL?",
    options: [
      "Hold On for Dear Life",
      "High Order Digital Ledger",
      "Hold On Digital Life",
      "High Order Data Link"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "¿Qué es un token ERC-20?",
    options: [
      "Un tipo de criptomoneda en la red Bitcoin",
      "Un estándar para tokens en Ethereum",
      "Un protocolo de seguridad",
      "Un tipo de contrato inteligente"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "¿Qué es la minería en criptomonedas?",
    options: [
      "Extraer criptomonedas del suelo",
      "Procesar transacciones y crear nuevos bloques",
      "Comprar criptomonedas",
      "Vender criptomonedas"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "¿Qué es un wallet frío?",
    options: [
      "Una billetera que no está conectada a internet",
      "Una billetera que está siempre en línea",
      "Una billetera para criptomonedas heladas",
      "Un tipo de exchange"
    ],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "¿Qué es DeFi?",
    options: [
      "Decentralized Finance",
      "Digital Finance",
      "Direct Finance",
      "Distributed Finance"
    ],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "¿Qué es un NFT?",
    options: [
      "Non-Fungible Token",
      "New Financial Technology",
      "Network File Transfer",
      "Next Future Technology"
    ],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "¿Qué es la prueba de trabajo (PoW)?",
    options: [
      "Un método para verificar transacciones usando poder computacional",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de almacenamiento"
    ],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "¿Qué es la prueba de participación (PoS)?",
    options: [
      "Un método que requiere bloquear tokens para validar transacciones",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 12,
    question: "¿Qué es un fork en blockchain?",
    options: [
      "Una bifurcación en la cadena de bloques",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 13,
    question: "¿Qué es un gas fee?",
    options: [
      "La tarifa por procesar transacciones en Ethereum",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "¿Qué es un oracle en blockchain?",
    options: [
      "Un puente entre la blockchain y el mundo exterior",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 15,
    question: "¿Qué es un token de gobernanza?",
    options: [
      "Un token que permite votar en decisiones de protocolo",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 16,
    question: "¿Qué es un AMM?",
    options: [
      "Automated Market Maker",
      "Automated Mining Machine",
      "Automated Money Maker",
      "Automated Market Manager"
    ],
    correctAnswer: 0
  },
  {
    id: 17,
    question: "¿Qué es yield farming?",
    options: [
      "Obtener recompensas por proporcionar liquidez",
      "Un tipo de minería",
      "Un protocolo de seguridad",
      "Un método de trading"
    ],
    correctAnswer: 0
  },
  {
    id: 18,
    question: "¿Qué es un token de utilidad?",
    options: [
      "Un token que da acceso a un servicio o producto",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 19,
    question: "¿Qué es un token de seguridad?",
    options: [
      "Un token que representa un activo financiero",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 20,
    question: "¿Qué es un token de equidad?",
    options: [
      "Un token que representa propiedad en una empresa",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 21,
    question: "¿Qué es un token de recompensa?",
    options: [
      "Un token que se otorga por realizar acciones",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 22,
    question: "¿Qué es un token de pago?",
    options: [
      "Un token diseñado para realizar pagos",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 23,
    question: "¿Qué es un token de acceso?",
    options: [
      "Un token que da acceso a un servicio",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 24,
    question: "¿Qué es un token de reputación?",
    options: [
      "Un token que representa la reputación de un usuario",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 25,
    question: "¿Qué es un token de identidad?",
    options: [
      "Un token que representa la identidad de un usuario",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 26,
    question: "¿Qué es un token de activo?",
    options: [
      "Un token que representa un activo real",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 27,
    question: "¿Qué es un token de votación?",
    options: [
      "Un token que permite votar en decisiones",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 28,
    question: "¿Qué es un token de membresía?",
    options: [
      "Un token que da acceso a una membresía",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 29,
    question: "¿Qué es un token de recompensa de fidelidad?",
    options: [
      "Un token que recompensa la fidelidad de los usuarios",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 30,
    question: "¿Qué es un token de recompensa de referido?",
    options: [
      "Un token que recompensa por referir nuevos usuarios",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 31,
    question: "¿Qué es un token de recompensa de contenido?",
    options: [
      "Un token que recompensa la creación de contenido",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 32,
    question: "¿Qué es un token de recompensa de participación?",
    options: [
      "Un token que recompensa la participación activa",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 33,
    question: "¿Qué es un token de recompensa de staking?",
    options: [
      "Un token que recompensa por mantener tokens bloqueados",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 34,
    question: "¿Qué es un token de recompensa de liquidez?",
    options: [
      "Un token que recompensa por proporcionar liquidez",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 35,
    question: "¿Qué es un token de recompensa de gobernanza?",
    options: [
      "Un token que recompensa la participación en gobernanza",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 36,
    question: "¿Qué es un token de recompensa de desarrollo?",
    options: [
      "Un token que recompensa el desarrollo de la plataforma",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 37,
    question: "¿Qué es un token de recompensa de comunidad?",
    options: [
      "Un token que recompensa la participación en la comunidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 38,
    question: "¿Qué es un token de recompensa de marketing?",
    options: [
      "Un token que recompensa actividades de marketing",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 39,
    question: "¿Qué es un token de recompensa de adopción?",
    options: [
      "Un token que recompensa la adopción temprana",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 40,
    question: "¿Qué es un token de recompensa de innovación?",
    options: [
      "Un token que recompensa la innovación",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 41,
    question: "¿Qué es un token de recompensa de sostenibilidad?",
    options: [
      "Un token que recompensa prácticas sostenibles",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 42,
    question: "¿Qué es un token de recompensa de educación?",
    options: [
      "Un token que recompensa el aprendizaje",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 43,
    question: "¿Qué es un token de recompensa de investigación?",
    options: [
      "Un token que recompensa la investigación",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 44,
    question: "¿Qué es un token de recompensa de seguridad?",
    options: [
      "Un token que recompensa la mejora de la seguridad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 45,
    question: "¿Qué es un token de recompensa de privacidad?",
    options: [
      "Un token que recompensa la mejora de la privacidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 46,
    question: "¿Qué es un token de recompensa de escalabilidad?",
    options: [
      "Un token que recompensa la mejora de la escalabilidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 47,
    question: "¿Qué es un token de recompensa de interoperabilidad?",
    options: [
      "Un token que recompensa la mejora de la interoperabilidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 48,
    question: "¿Qué es un token de recompensa de usabilidad?",
    options: [
      "Un token que recompensa la mejora de la usabilidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 49,
    question: "¿Qué es un token de recompensa de accesibilidad?",
    options: [
      "Un token que recompensa la mejora de la accesibilidad",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  },
  {
    id: 50,
    question: "¿Qué es un token de recompensa de adopción masiva?",
    options: [
      "Un token que recompensa la adopción masiva",
      "Un tipo de contrato inteligente",
      "Un protocolo de seguridad",
      "Un método de minería"
    ],
    correctAnswer: 0
  }
];

const CryptoQuiz = ({ onBack, onGameEnd }: { onBack: () => void; onGameEnd: (score: number, duration: number, result: 'completed') => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const shuffleQuestions = useCallback(() => {
    return [...allQuestions].sort(() => Math.random() - 0.5);
  }, []);

  const startQuiz = useCallback(() => {
    const newQuestions = shuffleQuestions();
    console.log('Nuevas preguntas:', newQuestions);
    setGameQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(60);
    setAnsweredQuestions(0);
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setShowScore(true);
          setIsPlaying(false);
          const finalScore = Math.round((score / answeredQuestions) * 100) || 0;
          onGameEnd(finalScore, 60, 'completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [shuffleQuestions, score, answeredQuestions, onGameEnd]);

  // Inicializar preguntas al montar el componente
  useEffect(() => {
    const initialQuestions = shuffleQuestions();
    console.log('Preguntas iniciales:', initialQuestions);
    setGameQuestions(initialQuestions);
  }, [shuffleQuestions]);

  const handleAnswer = useCallback((selectedAnswer: number) => {
    if (!isPlaying || timeLeft <= 0 || gameQuestions.length === 0) return;

    const currentQuestion = gameQuestions[currentQuestionIndex];
    console.log('Pregunta actual:', currentQuestion);

    // Verificar respuesta
    if (currentQuestion.correctAnswer === selectedAnswer) {
      setScore(prev => prev + 1);
    }

    // Actualizar contador de preguntas respondidas
    setAnsweredQuestions(prev => prev + 1);

    // Pasar a la siguiente pregunta
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Si llegamos al final, terminar el juego
      setShowScore(true);
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const finalScore = Math.round((score / answeredQuestions) * 100) || 0;
      onGameEnd(finalScore, 60, 'completed');
    }
  }, [isPlaying, timeLeft, gameQuestions, currentQuestionIndex, score, answeredQuestions, onGameEnd]);

  if (gameQuestions.length === 0) {
    return (
      <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
        <BackButton onBack={onBack} />
        <div className="text-center py-8">
          <p className="text-[#B8B8B8]">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = gameQuestions[currentQuestionIndex];

  return (
    <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
      <BackButton onBack={onBack} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Crypto Quiz</h2>
        <div className="flex items-center space-x-4">
          <div className="text-[#FFD700] font-bold">Puntos: {score}</div>
          <div className={`text-[#FF79C6] font-bold ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            Tiempo: {timeLeft}s
          </div>
        </div>
      </div>

      {!isPlaying && !showScore && (
        <div className="text-center py-8">
          <p className="text-[#B8B8B8] mb-4">¡Responde tantas preguntas como puedas en 60 segundos!</p>
          <button
            onClick={startQuiz}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Comenzar Quiz
          </button>
        </div>
      )}

      {showScore && (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-[#FFD700] mb-2">¡Quiz Completado!</p>
          <p className="text-[#B8B8B8] mb-2">Respondiste {answeredQuestions} preguntas</p>
          <p className="text-[#B8B8B8] mb-4">Puntuación: {score} respuestas correctas</p>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="text-[#50FA7B]">
              Precisión: {answeredQuestions > 0 ? ((score / answeredQuestions) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[#FFD700]">
              Velocidad: {(answeredQuestions / 60).toFixed(1)} preguntas/segundo
            </div>
          </div>
          <button
            onClick={startQuiz}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Intentar de Nuevo
          </button>
        </div>
      )}

      {isPlaying && currentQuestion && (
        <div className="space-y-6">
          <div className="bg-[#2A2A2A] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-[#B8B8B8]">
                Pregunta {currentQuestionIndex + 1} de {gameQuestions.length}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-[#B8B8B8]">
                  Respondidas: {answeredQuestions}
                </div>
                <div className="text-sm text-[#50FA7B]">
                  Correctas: {score}
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              {currentQuestion.question}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={`${currentQuestionIndex}-${index}`}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-4 text-left bg-[#1A1A1A] rounded-lg text-white hover:bg-[#333333] transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de progreso del tiempo */}
          <div className="bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#FFD700] transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Barra de progreso de preguntas respondidas */}
          <div className="bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#50FA7B] transition-all"
              style={{ width: `${(answeredQuestions / gameQuestions.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-[#B8B8B8]">
            <span>Progreso: {((answeredQuestions / gameQuestions.length) * 100).toFixed(0)}%</span>
            <span>Precisión: {answeredQuestions > 0 ? ((score / answeredQuestions) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TradingSimulator = ({ onBack, onGameEnd }: { onBack: () => void; onGameEnd: (score: number, duration: number, result: 'completed') => void }) => {
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(100);
  const [position, setPosition] = useState<'long' | 'short' | null>(null);
  const [positionSize, setPositionSize] = useState(0);
  const [entryPrice, setEntryPrice] = useState(0);
  const [profit, setProfit] = useState(0);
  const [history, setHistory] = useState<Array<{ type: string; price: number; profit: number }>>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: number; price: number }>>(() => {
    const initialData = [];
    let currentPrice = 100;
    const now = Date.now();
    
    for (let i = 0; i < 300; i++) {
      const change = (Math.random() - 0.5) * 2;
      currentPrice = Math.max(50, Math.min(150, currentPrice + change));
      initialData.push({
        time: now - (300 - i) * 1000,
        price: currentPrice
      });
    }
    return initialData;
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [leverage, setLeverage] = useState(1);
  const [inputAmount, setInputAmount] = useState('');
  const [marginUsed, setMarginUsed] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Calcular el precio de liquidación
  const calculateLiquidationPrice = (positionType: 'long' | 'short', entryPrice: number, leverage: number, marginUsed: number) => {
    const maintenanceMargin = 0.005; // 0.5% de margen de mantenimiento
    if (positionType === 'long') {
      return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
    } else {
      return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
    }
  };

  // Calcular el margen requerido
  const calculateRequiredMargin = (positionSize: number, leverage: number) => {
    return positionSize; // Ahora el margen es igual al tamaño de la posición
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      const newPrice = Math.max(50, Math.min(150, price + change));
      setPrice(newPrice);
      
      const currentTime = Date.now();
      setPriceHistory(prev => {
        const newHistory = [...prev, { time: currentTime, price: newPrice }];
        return newHistory.slice(-300);
      });
      setLastUpdate(currentTime);
      
      if (position) {
        const priceDiff = newPrice - entryPrice;
        const newProfit = position === 'long' 
          ? (priceDiff / entryPrice) * positionSize * leverage
          : (-priceDiff / entryPrice) * positionSize * leverage;
        setProfit(newProfit);

        // Verificar liquidación
        if (liquidationPrice && (
          (position === 'long' && newPrice <= liquidationPrice) ||
          (position === 'short' && newPrice >= liquidationPrice)
        )) {
          // Liquidación
          setBalance(prev => Math.max(0, prev - marginUsed));
          setHistory(prev => [...prev, { 
            type: `${position}-liquidated`, 
            price: newPrice, 
            profit: -marginUsed 
          }]);
          setPosition(null);
          setPositionSize(0);
          setEntryPrice(0);
          setProfit(0);
          setMarginUsed(0);
          setLiquidationPrice(null);
          setInputAmount('');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [position, price, entryPrice, positionSize, leverage, liquidationPrice, marginUsed]);

  const handleTrade = (type: 'long' | 'short') => {
    const amount = parseFloat(inputAmount);
    if (position) {
      setBalance(prev => prev + profit);
      setHistory(prev => [...prev, { type: position, price, profit }]);
      setPosition(null);
      setPositionSize(0);
      setEntryPrice(0);
      setProfit(0);
      setMarginUsed(0);
      setLiquidationPrice(null);
      setInputAmount('');

      const duration = (Date.now() - startTimeRef.current) / 1000;
      onGameEnd(balance + profit, duration, 'completed');
      startTimeRef.current = Date.now();
    } else if (!isNaN(amount) && amount > 0) {
      const requiredMargin = calculateRequiredMargin(amount, leverage);
      if (requiredMargin <= balance) {
        setPosition(type);
        setPositionSize(amount);
        setEntryPrice(price);
        setMarginUsed(requiredMargin);
        setLiquidationPrice(calculateLiquidationPrice(type, price, leverage, requiredMargin));
        setInputAmount('');
      } else {
        alert('Margen insuficiente para esta operación');
      }
    }
  };

  // Formatear datos para la gráfica
  const chartData = priceHistory.map((point, index) => ({
    time: index,
    price: point.price
  }));

  // Calcular estadísticas
  const currentPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const priceChange = currentPrice - priceHistory[0]?.price || 0;
  const priceChangePercentage = ((priceChange / priceHistory[0]?.price) * 100) || 0;

  // Calcular ROE (Return on Equity)
  const roe = position ? (profit / positionSize) * 100 : 0;

  return (
    <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
      <BackButton onBack={onBack} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Trading Simulator</h2>
        <div className="flex items-center space-x-4">
          <div className="text-[#FFD700] font-bold">Balance: ${balance.toFixed(2)}</div>
          {position && (
            <div className={`font-bold ${profit >= 0 ? 'text-[#50FA7B]' : 'text-[#FF5555]'}`}>
              P/L: ${profit.toFixed(2)} ({roe.toFixed(2)}%)
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#2A2A2A] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Precio Actual</h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#FFD700]">${currentPrice.toFixed(2)}</span>
                <span className={`text-sm ${priceChange >= 0 ? 'text-[#50FA7B]' : 'text-[#FF5555]'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChangePercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            {position && (
              <div className="text-right">
                <div className={`text-lg font-bold ${position === 'long' ? 'text-[#50FA7B]' : 'text-[#FF5555]'}`}>
                  {position.toUpperCase()} ${positionSize.toFixed(2)}
                </div>
                <div className="text-sm text-[#B8B8B8]">
                  Entry: ${entryPrice.toFixed(2)}
                </div>
                {liquidationPrice && (
                  <div className="text-sm text-[#FF5555]">
                    Liquidation: ${liquidationPrice.toFixed(2)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-64 bg-[#1A1A1A] rounded-lg mb-4 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis 
                  dataKey="time" 
                  stroke="#666666"
                  tick={false}
                />
                <YAxis 
                  stroke="#666666"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    color: '#FFFFFF'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Precio']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                {position && entryPrice && (
                  <Line
                    type="monotone"
                    dataKey={() => entryPrice}
                    stroke="#FFD700"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Precio de Entrada"
                  />
                )}
                {liquidationPrice && (
                  <Line
                    type="monotone"
                    dataKey={() => liquidationPrice}
                    stroke="#FF5555"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Precio de Liquidación"
                  />
                )}
                <Legend 
                  content={({ payload }) => (
                    <div className="flex justify-center space-x-4 mt-2">
                      {payload?.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color as string }}
                          />
                          <span className="text-xs text-[#B8B8B8]">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-[#1A1A1A] p-4 rounded-lg">
              <label className="block text-sm text-[#B8B8B8] mb-2">Cantidad (USDC)</label>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                placeholder="Ingresa la cantidad..."
                min="0"
                max={balance * leverage}
              />
              {position && (
                <div className="mt-2 text-sm text-[#B8B8B8]">
                  Margen usado: ${marginUsed.toFixed(2)}
                </div>
              )}
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-lg">
              <label className="block text-sm text-[#B8B8B8] mb-2">Apalancamiento</label>
              <div className="flex space-x-2">
                {[1, 2, 5, 10, 25, 50].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      leverage === lev
                        ? 'bg-[#FFD700] text-black font-bold'
                        : 'bg-[#2A2A2A] text-white hover:bg-[#333333]'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTrade('long')}
              className={`p-4 rounded-lg font-medium transition-all ${
                position === 'long'
                  ? 'bg-[#50FA7B] text-black'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
              }`}
              disabled={position ? false : !inputAmount || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > balance * leverage}
            >
              {position === 'long' ? 'Cerrar Long' : 'Abrir Long'}
            </button>
            <button
              onClick={() => handleTrade('short')}
              className={`p-4 rounded-lg font-medium transition-all ${
                position === 'short'
                  ? 'bg-[#FF5555] text-black'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
              }`}
              disabled={position ? false : !inputAmount || parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > balance * leverage}
            >
              {position === 'short' ? 'Cerrar Short' : 'Abrir Short'}
            </button>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">Historial de Operaciones</h3>
          <div className="space-y-2">
            {history.map((trade, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <span className={trade.type === 'long' ? 'text-[#50FA7B]' : 'text-[#FF5555]'}>
                    {trade.type.toUpperCase()}
                  </span>
                  <span className="text-[#B8B8B8]">
                    @ ${trade.price.toFixed(2)}
                  </span>
                </div>
                <span className={trade.profit >= 0 ? 'text-[#50FA7B]' : 'text-[#FF5555]'}>
                  {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BlockchainPuzzle = ({ onBack, onGameEnd }: { onBack: () => void; onGameEnd: (score: number, duration: number, result: 'completed') => void }) => {
  const [blocks, setBlocks] = useState<Array<{ id: number; value: number }>>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newBlocks = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      value: i + 1
    })).sort(() => Math.random() - 0.5);
    
    setBlocks(newBlocks);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    startTimeRef.current = Date.now();
  };

  const handleBlockClick = (index: number) => {
    if (gameOver) return;

    const newBlocks = [...blocks];
    const emptyIndex = newBlocks.findIndex(block => block.value === 9);
    const clickedIndex = newBlocks.findIndex(block => block.id === index);

    if (isAdjacent(emptyIndex, clickedIndex)) {
      [newBlocks[emptyIndex].value, newBlocks[clickedIndex].value] = 
      [newBlocks[clickedIndex].value, newBlocks[emptyIndex].value];
      
      setBlocks(newBlocks);
      setScore(score + 1);

      if (isPuzzleComplete(newBlocks)) {
        setGameOver(true);
        const duration = (Date.now() - startTimeRef.current) / 1000;
        onGameEnd(score + 1, duration, 'completed');
      }
    }
  };

  const isAdjacent = (index1: number, index2: number) => {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;
    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;

    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };

  const isPuzzleComplete = (currentBlocks: Array<{ id: number; value: number }>) => {
    return currentBlocks.every((block, index) => block.value === index + 1);
  };

  return (
    <div className={`bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-6 pt-16 border border-[#333333]/50 relative`}>
      <BackButton onBack={onBack} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Blockchain Puzzle</h2>
        <div className="flex items-center space-x-4">
          <div className="text-[#FFD700] font-bold">Movimientos: {score}</div>
          <div className="text-[#FF79C6] font-bold">Tiempo: {timeLeft}s</div>
        </div>
      </div>

      {gameOver ? (
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-[#FFD700] mb-2">
            {isPuzzleComplete(blocks) ? '¡Puzzle Completado!' : '¡Tiempo Agotado!'}
          </p>
          <p className="text-[#B8B8B8] mb-4">Movimientos: {score}</p>
          <button
            onClick={startNewGame}
            className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl font-medium hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
          >
            Jugar de Nuevo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => handleBlockClick(block.id)}
              className={`aspect-square rounded-lg transition-all duration-300 transform hover:scale-105 ${
                block.value === 9
                  ? 'bg-[#2A2A2A]'
                  : 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]'
              }`}
            >
              {block.value !== 9 && (
                <span className="text-2xl font-bold text-black">
                  {block.value}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  // Definir las categorías predefinidas
  const defaultCategories: Category[] = [
    {
      id: 'food',
      name: 'Comida',
      icon: 'M3 3h18v18H3V3zm15 3h-3v3h3V6zm0 5h-3v3h3v-3zm0 5h-3v3h3v-3zM9 6H6v3h3V6zm0 5H6v3h3v-3zm0 5H6v3h3v-3z',
      color: '#FFB86C',
    },
    {
      id: 'transport',
      name: 'Transporte',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      color: '#8BE9FD',
    },
    {
      id: 'entertainment',
      name: 'Entretenimiento',
      icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
      color: '#FF79C6',
    },
    {
      id: 'books',
      name: 'Libros',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: '#50FA7B',
    },
    {
      id: 'utilities',
      name: 'Servicios',
      icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
      color: '#BD93F9',
    },
    {
      id: 'other',
      name: 'Otros',
      icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
      color: '#FF5555',
    },
  ];

  // Lista de íconos disponibles para nuevas categorías
  const availableIcons: IconOption[] = [
    {
      id: 'shopping',
      path: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      name: 'Compras'
    },
    {
      id: 'food',
      path: 'M3 3h18v18H3V3zm15 3h-3v3h3V6zm0 5h-3v3h3v-3zm0 5h-3v3h3v-3zM9 6H6v3h3V6zm0 5H6v3h3v-3zm0 5H6v3h3v-3z',
      name: 'Comida'
    },
    {
      id: 'transport',
      path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      name: 'Transporte'
    },
    {
      id: 'education',
      path: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      name: 'Educación'
    },
    {
      id: 'health',
      path: 'M4.5 12.5l8-8a4.94 4.94 0 017 7l-8 8a4.94 4.94 0 01-7-7z',
      name: 'Salud'
    },
    {
      id: 'entertainment',
      path: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
      name: 'Entretenimiento'
    },
    {
      id: 'bills',
      path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      name: 'Facturas'
    },
    {
      id: 'savings',
      path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      name: 'Ahorros'
    },
    {
      id: 'gift',
      path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
      name: 'Regalos'
    },
    {
      id: 'other',
      path: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
      name: 'Otros'
    }
  ];

export function Dashboard({ onBackToHome }: { onBackToHome?: () => void }) {
  const { user } = useApp();
  const { address, isConnected } = useAccount();
  const { data: walletBalance } = useBalance({ address });
  const { balanceChange24h, transactionCount, gasSaved } = useWalletStats();
  

  
  const [balance, setBalance] = useState("0.00");
  const [activeSlide, setActiveSlide] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<{[key: string]: number}>({});
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<number>(() => {
    const savedBudget = localStorage.getItem('monthlyBudget');
    return savedBudget ? parseFloat(savedBudget) : 600;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#FFD700',
    icon: '',
  });
  const [isTransferScreenOpen, setIsTransferScreenOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSwapScreenOpen, setIsSwapScreenOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showGameStats, setShowGameStats] = useState(false);
  
  // Estados para el menú modal
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<MenuSection>('home');
  const [gameStats, setGameStats] = useState<GameStatsType[]>(() => {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
      return JSON.parse(savedStats);
    }
    return [
      {
        id: 'catch-coin',
        name: 'Catch the Coin',
        totalGames: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString(),
        achievements: [
          {
            id: 'first-game',
            name: 'Primera Partida',
            description: 'Juega tu primera partida de Catch the Coin',
            unlocked: false,
            icon: 'M13 10V3L4 14h7v7l9-11h-7z'
          },
          {
            id: 'score-50',
            name: 'Coleccionista',
            description: 'Alcanza una puntuación de 50 puntos',
            unlocked: false,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          {
            id: 'score-100',
            name: 'Experto',
            description: 'Alcanza una puntuación de 100 puntos',
            unlocked: false,
            icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
          }
        ],
        history: []
      },
      {
        id: 'memory',
        name: 'Memory Card',
        totalGames: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString(),
        achievements: [
          {
            id: 'first-match',
            name: 'Primera Coincidencia',
            description: 'Encuentra tu primer par de cartas',
            unlocked: false,
            icon: 'M4.5 12.5l8-8a4.94 4.94 0 017 7l-8 8a4.94 4.94 0 01-7-7z'
          },
          {
            id: 'perfect-game',
            name: 'Memoria Perfecta',
            description: 'Completa el juego sin errores',
            unlocked: false,
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          },
          {
            id: 'speed-master',
            name: 'Maestro de la Velocidad',
            description: 'Completa el juego en menos de 30 segundos',
            unlocked: false,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          }
        ],
        history: []
      },
      {
        id: 'quiz',
        name: 'Crypto Quiz',
        totalGames: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString(),
        achievements: [
          {
            id: 'first-perfect',
            name: 'Conocimiento Perfecto',
            description: 'Obtén una puntuación perfecta en el quiz',
            unlocked: false,
            icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
          },
          {
            id: 'quick-thinker',
            name: 'Pensador Rápido',
            description: 'Completa el quiz en menos de 2 minutos',
            unlocked: false,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          {
            id: 'quiz-master',
            name: 'Maestro del Quiz',
            description: 'Obtén 3 puntuaciones perfectas seguidas',
            unlocked: false,
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          }
        ],
        history: []
      },
      {
        id: 'trading',
        name: 'Trading Simulator',
        totalGames: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString(),
        achievements: [
          {
            id: 'first-profit',
            name: 'Primera Ganancia',
            description: 'Obtén tu primera ganancia en trading',
            unlocked: false,
            icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
          },
          {
            id: 'profitable-streak',
            name: 'Racha Ganadora',
            description: 'Obtén 5 operaciones rentables seguidas',
            unlocked: false,
            icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
          },
          {
            id: 'master-trader',
            name: 'Maestro del Trading',
            description: 'Alcanza un balance de 2000 USDC',
            unlocked: false,
            icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          }
        ],
        history: []
      },
      {
        id: 'puzzle',
        name: 'Blockchain Puzzle',
        totalGames: 0,
        bestScore: 0,
        lastPlayed: new Date().toISOString(),
        achievements: [
          {
            id: 'first-solve',
            name: 'Primer Puzzle',
            description: 'Completa tu primer puzzle',
            unlocked: false,
            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z'
          },
          {
            id: 'speed-solver',
            name: 'Velocista',
            description: 'Completa el puzzle en menos de 30 segundos',
            unlocked: false,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
          },
          {
            id: 'puzzle-master',
            name: 'Maestro del Puzzle',
            description: 'Completa 10 puzzles',
            unlocked: false,
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          }
        ],
        history: []
      }
    ];
  });

  // Función para actualizar las estadísticas de un juego
  const updateGameStats = async (
    gameId: string,
    score: number,
    duration: number,
    result: 'win' | 'lose' | 'completed'
  ) => {
    setGameStats(prevStats => {
      const newStats = prevStats.map(game => {
        if (game.id === gameId) {
          // Actualizar estadísticas básicas
          const newGame = {
            ...game,
            totalGames: game.totalGames + 1,
            bestScore: Math.max(game.bestScore, score),
            lastPlayed: new Date().toISOString(),
            history: [
              ...game.history,
              {
                date: new Date().toISOString(),
                score,
                duration,
                result
              }
            ]
          };

          // Verificar logros
          const updatedAchievements = game.achievements.map(achievement => {
            if (achievement.unlocked) return achievement;

            let shouldUnlock = false;
            switch (achievement.id) {
              // Catch the Coin achievements
              case 'first-game':
                shouldUnlock = game.id === 'catch-coin' && game.totalGames === 0;
                break;
              case 'score-50':
                shouldUnlock = game.id === 'catch-coin' && score >= 50;
                break;
              case 'score-100':
                shouldUnlock = game.id === 'catch-coin' && score >= 100;
                break;

              // Memory Card achievements
              case 'first-match':
                shouldUnlock = game.id === 'memory' && game.totalGames === 0;
                break;
              case 'perfect-game':
                shouldUnlock = game.id === 'memory' && result === 'win' && score === 100;
                break;
              case 'speed-master':
                shouldUnlock = game.id === 'memory' && duration <= 30 && result === 'win';
                break;

              // Crypto Quiz achievements
              case 'first-perfect':
                shouldUnlock = game.id === 'quiz' && score === 100;
                break;
              case 'quick-thinker':
                shouldUnlock = game.id === 'quiz' && duration <= 120 && score >= 80;
                break;
              case 'quiz-master':
                shouldUnlock = game.id === 'quiz' && 
                  game.history.slice(-2).every(h => h.score === 100) && 
                  score === 100;
                break;

              // Trading Simulator achievements
              case 'first-profit':
                shouldUnlock = game.id === 'trading' && score > 0;
                break;
              case 'profitable-streak':
                shouldUnlock = game.id === 'trading' && 
                  game.history.slice(-4).every(h => h.score > 0) && 
                  score > 0;
                break;
              case 'master-trader':
                shouldUnlock = game.id === 'trading' && score >= 2000;
                break;

              // Blockchain Puzzle achievements
              case 'first-solve':
                shouldUnlock = game.id === 'puzzle' && game.totalGames === 0;
                break;
              case 'speed-solver':
                shouldUnlock = game.id === 'puzzle' && duration <= 30 && result === 'completed';
                break;
              case 'puzzle-master':
                shouldUnlock = game.id === 'puzzle' && game.totalGames >= 9 && result === 'completed';
                break;
            }

            if (shouldUnlock) {
              toast.success(`¡Logro desbloqueado: ${achievement.name}!`);
              return {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date().toISOString()
              };
            }

            return achievement;
          });

          return {
            ...newGame,
            achievements: updatedAchievements
          };
        }
        return game;
      });

      // Guardar en localStorage
      localStorage.setItem('gameStats', JSON.stringify(newStats));
      return newStats;
    });

    // Enviar notificación solo si el usuario está conectado con Farcaster
    if (user?.fid) {
      const gameNames: { [key: string]: string } = {
        'catch-coin': 'Catch the Coin',
        'memory': 'Memory Card',
        'quiz': 'Crypto Quiz',
        'trading': 'Trading Simulator',
        'puzzle': 'Blockchain Puzzle'
      };

      const gameName = gameNames[gameId] || 'Juego';
      const notificationTitle = result === 'win' ? '¡Victoria!' : result === 'lose' ? '¡Sigue intentando!' : '¡Juego completado!';
      const notificationBody = `${gameName}: ${score} puntos en ${Math.floor(duration / 60)} minutos`;

      try {
        await sendNotification(user.fid.toString(), {
          notificationId: `${gameId}-${Date.now()}`,
          title: notificationTitle,
          body: notificationBody,
          targetUrl: `${window.location.origin}/dashboard?game=${gameId}`
        });
      } catch (error) {
        console.error('Error al enviar notificación:', error);
      }
    }
  };

  useEffect(() => {
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        console.log('Categorías cargadas del localStorage:', parsed);
        setCustomCategories(parsed);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customCategories.length > 0) {
      console.log('Guardando categorías en localStorage:', customCategories);
      localStorage.setItem('customCategories', JSON.stringify(customCategories));
    }
  }, [customCategories]);

  useEffect(() => {
    // Calcular totales cuando cambien los gastos
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);

    // Calcular gastos por categoría
    const byCategory = expenses.reduce((acc, expense) => {
      const categoryId = expense.category;
      acc[categoryId] = (acc[categoryId] || 0) + expense.amount;
      return acc;
    }, {} as {[key: string]: number});
    setExpensesByCategory(byCategory);
  }, [expenses]);

  useEffect(() => {
    // Guardar presupuesto en localStorage cuando cambie
    localStorage.setItem('monthlyBudget', budget.toString());
  }, [budget]);

  // Calcular ahorro
  const savings = budget - totalExpenses;
  const savingsPercentage = (savings / budget) * 100;

  // Función para manejar el cambio de presupuesto
  const handleBudgetChange = () => {
    const newBudgetValue = parseFloat(newBudget);
    if (!isNaN(newBudgetValue) && newBudgetValue > 0) {
      setBudget(newBudgetValue);
      setIsEditingBudget(false);
    }
  };

  const handleNewCategory = () => {
    setIsNewCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (newCategory.name && newCategory.icon) {
      const newCategoryItem: Category = {
        id: `custom-${Date.now()}`,
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
      };
      
      const updatedCategories = [...customCategories, newCategoryItem];
      setCustomCategories(updatedCategories);
      console.log('Nueva categoría agregada:', newCategoryItem);
      setIsNewCategoryModalOpen(false);
      setNewCategory({ name: '', color: '#FFD700', icon: '' });
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : defaultCategories[defaultCategories.length - 1].icon;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category ? category.color : defaultCategories[defaultCategories.length - 1].color;
  };

  const getCategoryName = (categoryId: string) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Otros';
  };

  const handleQRScan = (result: string) => {
    // Aquí procesamos el resultado del escaneo
    // El formato esperado del QR debería ser algo como:
    // campuscoin://transfer?address=0x...&amount=100&category=food
    try {
      const url = new URL(result);
      if (url.protocol === 'campuscoin:') {
        const params = new URLSearchParams(url.search);
        const address = params.get('address');
        const amount = params.get('amount');
        const category = params.get('category');

        if (address) {
          // Abrir la pantalla de transferencia con los datos escaneados
          setIsQRScannerOpen(false);
          setIsTransferScreenOpen(true);
          // Aquí podrías pasar los datos escaneados al TransferScreen
          console.log('Datos escaneados:', { address, amount, category });
        }
      }
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      alert('El código QR no es válido');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Eliminando categoría:', categoryId);
    try {
      // 1. Actualizar las categorías personalizadas
      const updatedCategories = customCategories.filter(cat => cat.id !== categoryId);
      console.log('Categorías actualizadas:', updatedCategories);
      
      // Actualizar el estado y localStorage de manera síncrona
      setCustomCategories(updatedCategories);
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));

      // 2. Actualizar gastos asociados
      const updatedExpenses = expenses.map(expense => {
        if (expense.category === categoryId) {
          const otherCategory = defaultCategories.find(cat => cat.id === 'other') || defaultCategories[defaultCategories.length - 1];
          return {
            ...expense,
            category: 'other',
            categoryDetails: otherCategory
          };
        }
        return expense;
      });
      
      // Actualizar el estado de gastos
      setExpenses(updatedExpenses);

      console.log('Eliminación completada');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Hubo un error al eliminar la categoría');
    }
  };

  // Función para manejar el depósito
  const handleDeposit = () => {
    const appId = process.env.NEXT_PUBLIC_COINBASE_APP_ID;
    const destinationWallet = address; // La dirección del usuario
    const destinationChain = 'base'; // Especificamos Base Network
    
    const coinbasePayUrl = new URL('https://pay.coinbase.com/buy/select-asset');
    
    // Agregamos los parámetros necesarios
    coinbasePayUrl.searchParams.append('appId', appId || '');
    coinbasePayUrl.searchParams.append('destinationWallet', destinationWallet || '');
    coinbasePayUrl.searchParams.append('chainName', destinationChain);
    coinbasePayUrl.searchParams.append('asset', 'USDC');
    coinbasePayUrl.searchParams.append('supportedNetworks', 'base');
    
    // Abrimos Coinbase Pay en una nueva pestaña
    window.open(coinbasePayUrl.toString(), '_blank');
  };

  const handleSaveExpense = (expense: { amount: number, category: string, note: string }) => {
    const categoryDetails = allCategories.find(cat => cat.id === expense.category);
    if (!categoryDetails) return;

    const newExpense: ExpenseWithCategory = {
      id: Date.now(),
      amount: expense.amount,
      category: expense.category,
      date: new Date().toISOString(),
      description: expense.note,
      categoryDetails
    };

    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
  };

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const handleGameEnd = (gameId: string, score: number, duration: number, result: 'win' | 'lose' | 'completed') => {
    updateGameStats(gameId, score, duration, result);
  };

  const handleSectionSelect = (section: MenuSection) => {
    setCurrentSection(section);
  };

  // Combinar categorías predefinidas con personalizadas
  const allCategories = [...defaultCategories, ...customCategories];

  // Función para renderizar el contenido según la sección
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'games':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Minijuegos</h2>
                <p className="text-[#B8B8B8] text-sm">¡Gana recompensas mientras te diviertes!</p>
              </div>
              <button 
                onClick={() => setShowGameStats(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#2A2A2A] transition-all border border-[#333333] hover:border-[#FFD700] group"
              >
                <svg 
                  className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Estadísticas</span>
                  <span className="text-xs text-[#B8B8B8]">Ver progreso</span>
                </div>
              </button>
            </div>
            {activeGame === 'catch-coin' && (
              <CatchTheCoin 
                onBack={() => setActiveGame(null)} 
                onGameEnd={(score, duration) => handleGameEnd('catch-coin', score, duration, 'completed')}
              />
            )}
            {activeGame === 'memory' && (
              <MemoryCard 
                onBack={() => setActiveGame(null)}
                onGameEnd={(score, duration, result) => handleGameEnd('memory', score, duration, result)}
              />
            )}
            {activeGame === 'quiz' && (
              <CryptoQuiz 
                onBack={() => setActiveGame(null)}
                onGameEnd={(score, duration, result) => handleGameEnd('quiz', score, duration, result)}
              />
            )}
            {activeGame === 'trading' && (
              <TradingSimulator 
                onBack={() => setActiveGame(null)}
                onGameEnd={(score, duration, result) => handleGameEnd('trading', score, duration, result)}
              />
            )}
            {activeGame === 'puzzle' && (
              <BlockchainPuzzle 
                onBack={() => setActiveGame(null)}
                onGameEnd={(score, duration, result) => handleGameEnd('puzzle', score, duration, result)}
              />
            )}
            {!activeGame && <GameSelector onSelectGame={setActiveGame} />}
          </div>
        );
      case 'marketplace':
        return <BookMarketplace />;
      case 'expenses':
        return (
          <div className={`${cardStyle} p-8`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Gestor de Gastos</h2>
                <p className="text-[#B8B8B8] text-sm">Controla tus gastos y categorías</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => setIsTransferScreenOpen(true)}
                  className="flex-1 px-6 py-3 bg-[#222222] text-white rounded-xl hover:bg-[#333333] transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nuevo Gasto</span>
                </button>
                <button
                  onClick={handleNewCategory}
                  className="flex-1 px-6 py-3 bg-[#222222] text-white rounded-xl hover:bg-[#333333] transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nueva Categoría</span>
                </button>
              </div>
            </div>

            {/* Expense Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Gastos del Mes",
                  amount: totalExpenses.toFixed(2),
                  color: "#FFD700",
                  progress: (totalExpenses / budget) * 100,
                  icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                },
                {
                  title: "Presupuesto",
                  amount: budget.toFixed(2),
                  color: "#00FF00",
                  progress: 100,
                  isEditable: true,
                  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                },
                {
                  title: "Ahorro",
                  amount: (budget - totalExpenses).toFixed(2),
                  color: (budget - totalExpenses) >= 0 ? "#00FFFF" : "#FF5555",
                  progress: Math.abs(((budget - totalExpenses) / budget) * 100),
                  icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] relative overflow-hidden group hover:border-[#444444] transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full" 
                       style={{ background: `${item.color}20`, filter: 'blur(40px)' }} />
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      {item.isEditable && (
                        <button
                          onClick={() => setIsEditingBudget(true)}
                          className="text-[#B8B8B8] hover:text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {item.isEditable && isEditingBudget ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-full bg-[#222222] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="Nuevo presupuesto"
                        />
                        <button
                          onClick={handleBudgetChange}
                          className="px-3 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold" style={{ color: item.color }}>${item.amount}</span>
                        <span className="ml-2 text-[#B8B8B8] text-sm">USDC</span>
                      </div>
                    )}
                    <div className="mt-4 h-1.5 bg-[#333333] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(item.progress, 100)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expenses List by Category */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Gastos por Categoría</h3>
              <div className="space-y-4">
                {Object.entries(expensesByCategory).map(([categoryId, amount]) => {
                  const isCustomCategory = customCategories.some(cat => cat.id === categoryId);
                  const category = allCategories.find(cat => cat.id === categoryId);
                  if (!category) return null;
                  
                  return (
                    <div key={categoryId} className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A] hover:border-[#333333] transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <svg 
                              className="w-6 h-6" 
                              style={{ color: category.color }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{category.name}</h4>
                            <p className="text-sm text-[#B8B8B8]">
                              {expenses.filter(e => e.category === categoryId).length} transacciones
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-[#FFD700] font-bold">${amount.toFixed(2)}</p>
                            <p className="text-sm text-[#B8B8B8]">
                              {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}% del total
                            </p>
                          </div>
                          {isCustomCategory && (
                            <button
                              onClick={() => handleDeleteCategory(categoryId)}
                              className="p-2 text-red-500 hover:text-red-400 transition-colors"
                              title="Eliminar categoría"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-[#2A2A2A] rounded-full">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Gastos Recientes</h3>
              <div className="space-y-2">
                {expenses.slice(-5).reverse().map((expense) => (
                  <div key={expense.id} className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A] flex items-center justify-between hover:border-[#333333] transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: expense.categoryDetails.color + '20' }}
                      >
                        <svg 
                          className="w-6 h-6" 
                          style={{ color: expense.categoryDetails.color }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expense.categoryDetails.icon} />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{expense.description || expense.categoryDetails.name}</h4>
                        <p className="text-sm text-[#B8B8B8]">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[#FFD700] font-bold">${expense.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full blur-xl opacity-50" />
                <div className="relative w-full h-full bg-[#1A1A1A] rounded-full flex items-center justify-center border border-[#333333] p-6">
                  <Image
                    src="/Ensigna.svg"
                    alt="CampusCoin Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">¡Bienvenido a CampusCoin!</h2>
              <p className="text-xl text-[#B8B8B8] mb-8 max-w-2xl mx-auto">
                Tu ecosistema universitario inteligente. Explora nuestras funciones para gestionar tus finanzas, 
                jugar y comprar libros.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: 'Minijuegos',
                  description: 'Aprende mientras te diviertes',
                  icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  color: '#50FA7B',
                  action: () => setCurrentSection('games')
                },
                {
                  title: 'Gestor de Gastos',
                  description: 'Controla tus finanzas',
                  icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                  color: '#FF79C6',
                  action: () => setCurrentSection('expenses')
                },
                {
                  title: 'Marketplace',
                  description: 'Compra y vende libros',
                  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                  color: '#FFD700',
                  action: () => setCurrentSection('marketplace')
                }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-opacity-50 transition-all duration-300 group"
                  style={{ borderColor: item.color + '40' }}
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <svg 
                      className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" 
                      style={{ color: item.color }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#B8B8B8]">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${techGradient} min-h-screen`}>
      {/* Header con Logo y Menú */}
      <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto">
        <button 
          className="flex items-center space-x-2 min-w-0 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer group"
          onClick={onBackToHome}
          title="Volver a la pantalla de bienvenida"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-0.5 group-hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] opacity-50 blur-xl" />
            <div className="relative w-full h-full bg-black rounded-lg flex items-center justify-center p-1 sm:p-2">
              <Image
                src="/Ensigna.svg"
                alt="CampusCoin Logo"
                width={24}
                height={24}
                className="object-contain sm:w-8 sm:h-8"
                priority
              />
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#FFD700] transition-colors">CampusCoin</h1>
            <p className="text-xs sm:text-sm text-[#B8B8B8] group-hover:text-white transition-colors">Tu Wallet Universitaria</p>
          </div>
        </button>
        
        <div className="flex items-center gap-2 min-w-0">
          {/* Wallet conectada */}
          {isConnected && address ? (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Información de la wallet con ENS */}
              <div className="px-2 sm:px-3 py-2 bg-[#1A1A1A] rounded-xl border border-[#333333] hover:border-[#FFD700] transition-all cursor-pointer min-w-0"
                   onClick={() => {
                     navigator.clipboard.writeText(address);
                     toast.success('¡Dirección copiada!');
                   }}>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-shrink-0 border border-[#FFD700]">
                    <Avatar
                      address={address as `0x${string}`}
                      className="w-full h-full"
                      defaultComponent={
                        <div className="w-full h-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-black">
                            {address.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                      }
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    {/* Componente Name de OnchainKit para resolver ENS */}
                    <div className="text-white text-xs sm:text-sm font-medium truncate">
                      <Name 
                        address={address as `0x${string}`}
                        className="text-white text-xs sm:text-sm font-medium"
                      />
                    </div>
                    {walletBalance && (
                      <span className="text-[#B8B8B8] text-xs truncate">
                        {parseFloat(walletBalance.formatted).toFixed(3)} {walletBalance.symbol}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botón de desconectar - solo icono en móvil */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-[#2A2A2A] text-red-400 rounded-xl hover:bg-[#3A3A3A] transition-colors flex-shrink-0"
                title="Desconectar wallet"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <ConnectWallet
              text="Conectar"
              className="px-2 sm:px-3 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all text-xs sm:text-sm font-medium"
            />
          )}

          {/* Controles de navegación */}
          <div className="flex items-center gap-1 sm:gap-2">
            {currentSection !== 'home' && (
              <button
                onClick={() => setCurrentSection('home')}
                className="p-2 sm:px-3 sm:py-2 bg-[#2A2A2A] text-white rounded-xl hover:bg-[#3A3A3A] transition-colors flex-shrink-0"
                title="Inicio"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline ml-2">Inicio</span>
              </button>
            )}
            <button
              onClick={() => setIsMenuModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#2A2A2A] transition-all border border-[#333333] hover:border-[#FFD700] flex-shrink-0"
              title="Menú"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline ml-2">Menú</span>
            </button>
            <div className="hidden sm:flex items-center space-x-2 bg-[#1A1A1A] rounded-xl px-3 py-2 border border-[#333333]">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-[#B8B8B8]">Base Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal según la sección */}
      <div className="mb-8">
        {renderSectionContent()}
      </div>

      {/* New Category Modal */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <div className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-[#2A2A2A]">
            <h3 className="text-xl font-bold text-white mb-6">Crear Nueva Categoría</h3>
            
            {/* Category Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                Nombre de la Categoría
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                placeholder="Ej: Gimnasio"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                Color de la Categoría
              </label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-full h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1 cursor-pointer"
              />
            </div>

            {/* Icon Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                Ícono
              </label>
              <div className="grid grid-cols-4 gap-3">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setNewCategory({ ...newCategory, icon: icon.path })}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      newCategory.icon === icon.path
                        ? 'bg-[#2A2A2A] border-2 border-[#FFD700]'
                        : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                        style={{ backgroundColor: newCategory.color + '20' }}
                      >
                        <svg 
                          className="w-6 h-6" 
                          style={{ color: newCategory.color }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                        </svg>
                      </div>
                      <span className="text-xs text-white">{icon.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                Vista Previa
              </label>
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: newCategory.color + '20' }}
                  >
                    {newCategory.icon && (
                      <svg 
                        className="w-6 h-6" 
                        style={{ color: newCategory.color }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={newCategory.icon} />
                      </svg>
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {newCategory.name || 'Nombre de la Categoría'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium"
                disabled={!newCategory.name || !newCategory.icon}
              >
                Guardar Categoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menú Modal */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onSelectSection={handleSectionSelect}
      />

      {/* Transfer Screen */}
      {isTransferScreenOpen && (
        <TransferScreen 
          onBack={() => {
            setIsTransferScreenOpen(false);
            setTransferAmount(0);
          }}
          categories={allCategories}
          onDeleteCategory={handleDeleteCategory}
          onSaveExpense={handleSaveExpense}
          initialAmount={transferAmount}
        />
      )}

      {/* QR Scanner */}
      {isQRScannerOpen && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setIsQRScannerOpen(false)}
        />
      )}

      {/* Swap Screen */}
      {isSwapScreenOpen && (
        <SwapScreen
          onBack={() => setIsSwapScreenOpen(false)}
        />
      )}

      {/* Modal de Depósito */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] backdrop-blur-sm">
          <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Recargar USDC</h2>
            
            <div className="space-y-6">
              {/* Opción de Coinbase */}
              <button
                onClick={() => {
                  handleDeposit();
                  setIsDepositModalOpen(false);
                }}
                className="w-full p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] hover:border-[#FFD700] transition-all flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-[#0052FF] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium">Coinbase Pay</h3>
                  <p className="text-sm text-[#B8B8B8]">Compra USDC con tarjeta o banco</p>
                </div>
                <svg className="w-6 h-6 text-[#B8B8B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Opción de Transferencia */}
              <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                <h3 className="text-white font-medium mb-2">Transferir desde otra wallet</h3>
                <p className="text-sm text-[#B8B8B8] mb-4">Envía USDC a tu dirección:</p>
                <div className="flex items-center space-x-2 bg-[#2A2A2A] p-2 rounded-lg">
                  <code className="text-[#FFD700] flex-1 overflow-hidden text-ellipsis">{address}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(address || '');
                      toast.success('¡Dirección copiada!');
                    }}
                    className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#B8B8B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="mt-6 w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-xl hover:bg-[#3A3A3A] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Game Stats Modal */}
      {showGameStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]">
          <GameStats
            stats={gameStats}
            onClose={() => setShowGameStats(false)}
          />
        </div>
      )}
    </div>
  );
} 