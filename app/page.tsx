"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletAdvancedAddressDetails,
  WalletAdvancedTokenHoldings,
  WalletAdvancedTransactionActions,
  WalletAdvancedWalletActions,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useApp } from "./context/AppContext";
import { FloatingChat } from "./components/FloatingChat";
import SimpleDashboard from "./components/SimpleDashboard";
import SlotMachine from "./components/SlotMachine";
import { sdk } from "@farcaster/miniapp-sdk";
import { LoadingScreen } from './components/LoadingScreen';
import Image from 'next/image';

// Tipos
type Transaction = {
  title: string;
  date: string;
  amount: string;
  status: string;
};

type SectionType = 'home' | 'transactions' | 'budget' | 'settings' | 'dashboard';

// Actualizar los estilos de animación
const styles = `
html, body, #__next {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Optimizar animaciones para mejor rendimiento */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@keyframes float-circle {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(50px, -30px, 0);
  }
}

@keyframes float-zigzag {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(30px, -20px, 0);
  }
}

@keyframes float-wave {
  0%, 100% { 
    transform: translate3d(0, 0, 0) scale(1); 
  }
  50% { 
    transform: translate3d(40px, -15px, 0) scale(1.05); 
  }
}

@keyframes float-spiral {
  0%, 100% { 
    transform: translate3d(0, 0, 0) rotate(0deg); 
  }
  50% { 
    transform: translate3d(25px, -25px, 0) rotate(180deg); 
  }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse-glow {
  0%, 100% { 
    opacity: 0.5;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes float-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-float-circle {
  animation: float-circle 8s ease-in-out infinite;
  will-change: transform;
}

.animate-float-zigzag {
  animation: float-zigzag 6s ease-in-out infinite;
  will-change: transform;
}

.animate-float-wave {
  animation: float-wave 7s ease-in-out infinite;
  will-change: transform;
}

.animate-float-spiral {
  animation: float-spiral 9s ease-in-out infinite;
  will-change: transform;
}

.animate-shine {
  animation: shine 3s linear infinite;
}

.animate-gradient-x {
  animation: gradient-x 4s ease infinite;
  background-size: 200% 200%;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
  will-change: transform, opacity;
}

.animate-float-up {
  animation: float-up 4s ease-in-out infinite;
  will-change: transform;
}

.hero-gradient {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  background-size: 200% 200%;
  animation: gradient-x 4s ease infinite;
}

.hero-text-shadow {
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.hero-button-glow {
  position: relative;
  overflow: hidden;
}

.hero-button-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 215, 0, 0.4),
    transparent
  );
  animation: shine 4s infinite;
}

@keyframes line-draw {
  0%, 100% {
    width: 60%;
    opacity: 0.8;
  }
  50% {
    width: 100%;
    opacity: 1;
  }
}

.animated-line {
  position: relative;
  height: 4px;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  border-radius: 2px;
  margin: 1rem auto;
  width: 60%;
  animation: line-draw 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* --- Ajuste para el modal en móviles --- */
@media (max-width: 767px) {
  .ock-modal {
    margin-top: 100px !important;
  }
}

@keyframes openBook {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.02);
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  }
  50% {
    text-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.book-container {
  perspective: 1200px;
  width: 280px;
  height: 360px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: openBook 8s ease-in-out infinite;
  will-change: transform;
}

.book-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  animation: glow 4s ease-in-out infinite;
  box-shadow: 
    0 0 30px rgba(255, 215, 0, 0.4),
    0 15px 30px rgba(0, 0, 0, 0.2),
    inset 0 0 15px rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  will-change: box-shadow;
}

.book-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  animation: shimmer 4s infinite;
  border-radius: 15px;
}

.book-pages {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 15px;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.2),
    inset 0 0 15px rgba(255, 215, 0, 0.05);
  border: 2px solid rgba(255, 215, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.book-pages::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 215, 0, 0.05) 0%,
    rgba(255, 165, 0, 0.1) 50%,
    rgba(255, 215, 0, 0.05) 100%
  );
  background-size: 200% 200%;
  animation: gradientShift 5s ease-in-out infinite;
  border-radius: 15px;
}

.book-pages-content {
  position: relative;
  z-index: 2;
}

.book-pages h2 {
  color: #FFD700;
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  animation: textGlow 3s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.book-pages p {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-button {
  position: relative;
  padding: 1.2rem 2.5rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: #000;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  border: none;
  border-radius: 60px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: float 5s ease-in-out infinite;
  margin-top: 2rem;
  box-shadow: 
    0 10px 25px rgba(255, 215, 0, 0.3),
    0 5px 10px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  will-change: transform, box-shadow;
}

.cta-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 15px 35px rgba(255, 215, 0, 0.4),
    0 8px 15px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation-play-state: paused;
}

.cta-button:active {
  transform: translateY(-2px) scale(1.02);
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cta-button:hover::before {
  left: 100%;
}

.cta-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
  z-index: -1;
  border-radius: 60px;
  filter: blur(6px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-button:hover::after {
  opacity: 0.5;
}

/* Responsividad mejorada */
@media (max-width: 768px) {
  .book-container {
    width: 220px;
    height: 280px;
  }
  .cta-button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    margin-top: 1.5rem;
  }
  .book-pages h2 {
    font-size: 1.4rem;
  }
  .book-pages p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .book-container {
    width: 180px;
    height: 230px;
  }
  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    margin-top: 1rem;
  }
  .book-pages h2 {
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
  }
  .book-pages p {
    font-size: 0.8rem;
  }
}

@media (max-height: 700px) {
  .book-container {
    width: 200px;
    height: 250px;
  }
  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    margin-top: 1rem;
  }
}
`;

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { user, isConnected, address } = useApp();
  const [activeTab, setActiveTab] = useState<SectionType>('home');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userTokens, setUserTokens] = useState<number | null>(null);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Iniciando CampusCoin...');
      
      // Intentar llamar a ready() inmediatamente
      try {
        if (sdk && sdk.actions && sdk.actions.ready) {
          console.log('📱 SDK detectado, llamando a ready()...');
          await sdk.actions.ready();
          console.log('✅ sdk.actions.ready() ejecutado exitosamente');
        } else {
          console.log('⚠️ SDK no disponible, continuando sin ready()');
        }
      } catch (error) {
        console.error('❌ Error al llamar ready():', error);
      }
      
      // Ocultar loading
      setTimeout(() => {
        console.log('🎯 Mostrando aplicación...');
        setIsLoading(false);
      }, 2000);
    };

    // Ejecutar con un pequeño delay para asegurar que el SDK esté cargado
    setTimeout(initializeApp, 100);
    
    // Fallback: intentar ready() después de 3 segundos
    setTimeout(async () => {
      try {
        if (sdk && sdk.actions && sdk.actions.ready) {
          console.log('🔄 Fallback: intentando ready() nuevamente...');
          await sdk.actions.ready();
          console.log('✅ Fallback ready() exitoso');
        }
      } catch (error) {
        console.error('❌ Fallback ready() falló:', error);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Efecto para redirigir automáticamente al dashboard cuando se conecte la wallet
  useEffect(() => {
    if (isConnected && activeTab === 'home') {
      // Pequeño delay para que el usuario vea que se conectó
      setTimeout(() => {
        setActiveTab('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    }
  }, [isConnected, activeTab]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleConnectAndRedirect = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: SectionType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para abrir el modal
  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
    if (isMobile) {
      setTimeout(() => setIsWalletModalOpen(false), 1000);
    }
  };
  // Función para cerrar el modal
  const handleCloseWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  // Escuchar eventos de cierre del modal (cuando se conecta o cancela)
  useEffect(() => {
    if (!isWalletModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsWalletModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isWalletModalOpen]);

  // Función para ir al bonus diario desde el dashboard
  const handleGoToBonus = () => {
    setShowDashboard(false);
    setShowWelcome(true);
  };

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="flex items-center space-x-2 text-[var(--app-accent)] p-4 hover:bg-[var(--app-gray)] rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Guardar App</span>
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Guardada</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showWelcome) {
    console.log('🎰 Mostrando SlotMachine...');
    return <SlotMachine onComplete={(tokens) => {
      setUserTokens(tokens);
      setShowWelcome(false);
      setShowDashboard(true);
    }} />;
  }

  if (showDashboard) {
    console.log('📊 Mostrando SimpleDashboard con tokens:', userTokens);
    return <SimpleDashboard userTokens={userTokens} onGoToBonus={handleGoToBonus} />;
  }

  return (
    <div className="w-screen min-h-screen min-w-full flex flex-col bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] relative overflow-hidden">
      <style>{styles}</style>
      
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full filter blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-[#FFA500] to-[#FF8C00] rounded-full filter blur-[120px] opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <header className="relative w-full flex justify-end p-4 z-10 shrink-0">
        <div>{saveFrameButton}</div>
        <Wallet className="z-[100] ml-4">
          <ConnectWallet onConnect={(...args) => { handleConnectAndRedirect(...args); handleOpenWalletModal(); }} />
          <WalletDropdown className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
            <WalletAdvancedWalletActions />
            <WalletAdvancedAddressDetails />
            <WalletAdvancedTransactionActions />
            <WalletAdvancedTokenHoldings />
          </WalletDropdown>
        </Wallet>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 min-h-0">
        <div className="book-container mb-4 md:mb-8">
          <div className="book">
            <div className="book-cover">
              <Image
                src="/CampusCoin.png"
                alt="CAMPUS Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            <div className="book-pages">
              <div className="book-pages-content">
                <h2>CAMPUS</h2>
                <p>Marketplace Global</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 md:space-y-6 max-w-4xl w-full">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] animate-pulse-scale">
            CAMPUS
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-bold tracking-wide">
            Tu Marketplace Global
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] font-semibold">
            Inteligente
          </p>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Únete a la <span className="text-[#3B82F6] font-bold">experiencia de compra y venta universitaria</span>. 
            Conecta tu wallet y descubre todas las posibilidades que CAMPUS tiene para ti.
          </p>
          <button
            className="cta-button"
            onClick={handleStartClick}
          >
            Comenzar
          </button>
        </div>
      </main>
      
      <footer className="relative w-full text-center py-4 md:py-6 z-10 shrink-0">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full animate-pulse"></div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-xs md:text-sm font-semibold tracking-wider">
            CAMPUS - Tu Marketplace Universitario Global
          </p>
          <div className="w-2 h-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
}


