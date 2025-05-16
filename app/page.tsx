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
import { Dashboard } from "./components/Dashboard";
import { sdk } from "@farcaster/frame-sdk";
import { LoadingScreen } from './components/LoadingScreen';

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
@keyframes float-circle {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(100px, 50px) rotate(90deg);
  }
  50% {
    transform: translate(50px, 100px) rotate(180deg);
  }
  75% {
    transform: translate(-50px, 50px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

@keyframes float-zigzag {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(50px, -50px);
  }
  50% {
    transform: translate(100px, 0);
  }
  75% {
    transform: translate(50px, 50px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes float-wave {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(75px, -25px) scale(1.2); }
  50% { transform: translate(150px, 0) scale(1); }
  75% { transform: translate(75px, 25px) scale(0.8); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes float-spiral {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(50px, -50px) rotate(90deg) scale(1.2); }
  50% { transform: translate(0, -100px) rotate(180deg) scale(1); }
  75% { transform: translate(-50px, -50px) rotate(270deg) scale(0.8); }
  100% { transform: translate(0, 0) rotate(360deg) scale(1); }
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
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
  100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
}

@keyframes float-up {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

.animate-float-circle {
  animation: float-circle linear infinite;
}

.animate-float-zigzag {
  animation: float-zigzag ease-in-out infinite;
}

.animate-float-wave {
  animation: float-wave ease-in-out infinite;
}

.animate-float-spiral {
  animation: float-spiral ease-in-out infinite;
}

.animate-shine {
  animation: shine 2s linear infinite;
}

.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
  background-size: 200% 200%;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-float-up {
  animation: float-up 3s ease-in-out infinite;
}

.hero-gradient {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
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
  animation: shine 3s infinite;
}

@keyframes line-draw {
  0% {
    width: 0;
    opacity: 0;
  }
  20% {
    width: 100%;
    opacity: 1;
  }
  40% {
    width: 100%;
    opacity: 1;
  }
  60% {
    width: 0;
    opacity: 0;
  }
  80% {
    width: 100%;
    opacity: 1;
  }
  100% {
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
  width: 0;
  animation: line-draw 4s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
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

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    const initializeApp = async () => {
      // Establecer un timeout de seguridad
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      try {
        // Intentar inicializar el SDK de Farcaster
        await sdk.actions.ready({ disableNativeGestures: true });
      } catch (error) {
        console.warn('No se pudo inicializar el SDK de Farcaster:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    // Iniciar la carga inmediatamente
    initializeApp();
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] p-4 relative overflow-hidden">
              {/* Hero Section */}
              <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]">
                {/* Efectos de fondo animados */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[128px] opacity-20 animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFA500] rounded-full filter blur-[128px] opacity-20 animate-pulse delay-1000" />
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,215,0,0.15) 2px, transparent 0)',
                    backgroundSize: '24px 24px' 
                  }}></div>
                </div>

                {/* Elementos flotantes decorativos */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-[#FFD700]/20 rounded-full animate-float-circle" />
                  <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#FFA500]/20 rounded-full animate-float-zigzag" />
                  <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-[#FFD700]/20 rounded-full animate-float-wave" />
                  <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-[#FFA500]/20 rounded-full animate-float-spiral" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                  {/* Logo con efecto de brillo */}
                  <div className="relative w-48 h-48 mx-auto mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500 animate-pulse-glow" />
                    <div className="relative w-full h-full bg-[#1A1A1A] rounded-full flex items-center justify-center transform group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                      <img 
                        src="/Ensigna.png" 
                        alt="CampusCoin Logo" 
                        className="w-full h-full object-contain p-6"
                      />
                    </div>
                  </div>

                  {/* Título principal con efectos */}
                  <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white hero-text-shadow animate-float-up">
                    CampusCoin
                  </h1>

                  {/* Línea animada */}
                  <div className="animated-line w-48 mx-auto"></div>

                  {/* Subtítulo con animación */}
                  <p className="text-2xl md:text-3xl text-[#FFD700] mb-12 animate-float-up" style={{ animationDelay: '0.2s' }}>
                    Tu Ecosistema Universitario Inteligente
                  </p>

                  {/* Botón de llamada a la acción */}
                  <button
                    className="hero-button-glow px-12 py-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-2xl font-bold text-xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transform hover:scale-105"
                    onClick={() => {
                      setActiveTab('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Comenzar Ahora
                  </button>

                  {/* Texto descriptivo */}
                  <p className="mt-8 text-lg text-[#B8B8B8] max-w-2xl mx-auto animate-float-up" style={{ animationDelay: '0.4s' }}>
                    Únete a la revolución financiera universitaria. Conecta tu wallet y descubre todas las posibilidades que CampusCoin tiene para ti.
                  </p>
                </div>
              </div>

              <div className="max-w-4xl w-full space-y-8 relative z-10">
                {/* Características Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  {/* Marketplace de Libros */}
                  <div className="group relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#333333]/50 hover:border-[#50FA7B]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(80,250,123,0.15)] overflow-hidden">
                    {/* Efecto de brillo en el borde */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#50FA7B]/0 via-[#50FA7B]/10 to-[#50FA7B]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Contenido principal */}
                    <div className="relative z-10">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="w-16 h-16 bg-[#50FA7B]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 group-hover:bg-[#50FA7B]/20">
                          <svg className="w-8 h-8 text-[#50FA7B] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white group-hover:text-[#50FA7B] transition-colors duration-500">Marketplace de Libros</h2>
                          <p className="text-base text-[#B8B8B8] group-hover:text-white/80 transition-colors duration-500">Comparte conocimiento, genera ingresos</p>
                        </div>
                      </div>

                      <p className="text-lg text-[#B8B8B8] mb-8 group-hover:text-white/90 transition-colors duration-500">
                        Compra y vende libros de texto, guías de estudio y materiales académicos. 
                        Gana ingresos ayudando a otros estudiantes mientras contribuyes a la comunidad.
                      </p>

                      <ul className="space-y-4">
                        {[
                          { text: "Vende tus libros usados", icon: "M5 13l4 4L19 7" },
                          { text: "Compra a precios accesibles", icon: "M5 13l4 4L19 7" },
                          { text: "Comparte guías de estudio", icon: "M5 13l4 4L19 7" }
                        ].map((item, index) => (
                          <li key={index} className="flex items-center group-hover:text-white transition-colors duration-500">
                            <div className="w-10 h-10 bg-[#50FA7B]/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#50FA7B]/20 transition-colors duration-500">
                              <svg className="w-5 h-5 text-[#50FA7B] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                            </div>
                            <span className="text-lg">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Gestión de Gastos */}
                  <div className="group relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#333333]/50 hover:border-[#FF79C6]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,121,198,0.15)] overflow-hidden">
                    {/* Efecto de brillo en el borde */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF79C6]/0 via-[#FF79C6]/10 to-[#FF79C6]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Contenido principal */}
                    <div className="relative z-10">
                      <div className="flex items-center space-x-6 mb-6">
                        <div className="w-16 h-16 bg-[#FF79C6]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 group-hover:bg-[#FF79C6]/20">
                          <svg className="w-8 h-8 text-[#FF79C6] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white group-hover:text-[#FF79C6] transition-colors duration-500">Gestión de Gastos</h2>
                          <p className="text-base text-[#B8B8B8] group-hover:text-white/80 transition-colors duration-500">Controla tus finanzas universitarias</p>
                        </div>
                      </div>

                      <p className="text-lg text-[#B8B8B8] mb-8 group-hover:text-white/90 transition-colors duration-500">
                        Aprende a gestionar tus finanzas universitarias. Controla tus gastos, 
                        establece presupuestos y toma decisiones financieras inteligentes.
                      </p>

                      <ul className="space-y-4">
                        {[
                          { text: "Seguimiento de gastos", icon: "M5 13l4 4L19 7" },
                          { text: "Presupuestos personalizados", icon: "M5 13l4 4L19 7" },
                          { text: "Análisis por categoría", icon: "M5 13l4 4L19 7" }
                        ].map((item, index) => (
                          <li key={index} className="flex items-center group-hover:text-white transition-colors duration-500">
                            <div className="w-10 h-10 bg-[#FF79C6]/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#FF79C6]/20 transition-colors duration-500">
                              <svg className="w-5 h-5 text-[#FF79C6] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                            </div>
                            <span className="text-lg">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sección de Juegos */}
                <div className="group relative bg-[#1A1A1A]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#333333]/50 hover:border-[#FFD700]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,215,0,0.15)] overflow-hidden">
                  {/* Efecto de brillo en el borde */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/0 via-[#FFD700]/10 to-[#FFD700]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Contenido principal */}
                  <div className="relative z-10">
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 group-hover:bg-[#FFD700]/20">
                        <svg className="w-8 h-8 text-[#FFD700] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white group-hover:text-[#FFD700] transition-colors duration-500">Juegos Educativos</h2>
                        <p className="text-base text-[#B8B8B8] group-hover:text-white/80 transition-colors duration-500">Aprende sobre criptomonedas mientras te diviertes</p>
                      </div>
                    </div>

                    <p className="text-lg text-[#B8B8B8] mb-8 group-hover:text-white/90 transition-colors duration-500">
                      Explora nuestra colección de juegos diseñados para aprender sobre blockchain y criptomonedas 
                      de una manera divertida e interactiva. Gana puntos y mejora tus conocimientos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          title: "Catch the Coin",
                          description: "Atrapa las monedas que caen y gana puntos mientras aprendes sobre criptomonedas",
                          icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        },
                        {
                          title: "Memory Card",
                          description: "Encuentra pares de cartas relacionadas con conceptos blockchain",
                          icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        },
                        {
                          title: "Crypto Quiz",
                          description: "Pon a prueba tus conocimientos sobre criptomonedas y blockchain",
                          icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        }
                      ].map((game, index) => (
                        <div
                          key={index}
                          className="bg-[#2A2A2A] rounded-xl p-4 group-hover:bg-[#333333] transition-colors duration-500"
                        >
                          <div className="w-10 h-10 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#FFD700]/20 transition-colors duration-500">
                            <svg className="w-5 h-5 text-[#FFD700] group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={game.icon} />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{game.title}</h3>
                          <p className="text-sm text-[#B8B8B8]">{game.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comenzar en Grande */}
                <div className="mt-20 text-center">
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] mb-6 animate-gradient">
                    ¡Comienza en Grande!
                  </h2>
                  <p className="text-xl text-[#B8B8B8] mb-8 max-w-2xl mx-auto">
                    Únete a la revolución financiera universitaria. Conecta tu wallet y descubre todas las posibilidades que CampusCoin tiene para ti.
                  </p>
                  <button
                    className="relative px-12 py-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-2xl font-bold text-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] group mb-4"
                    onClick={() => {
                      setActiveTab('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Comenzar
                  </button>
                  <p className="mt-6 text-[#B8B8B8]">
                    {user ? '¡Bienvenido! Haz clic en Dashboard para comenzar.' : 'Conecta tu wallet para comenzar tu aventura'}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <style>{styles}</style>
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>{saveFrameButton}</div>
          <div className="flex items-center justify-end w-full">
            <Wallet className="z-[100] fixed top-4 right-4">
              {/* Ocultar el botón en móvil si el modal está abierto */}
              {!(isMobile && isWalletModalOpen) && (
                <ConnectWallet onConnect={(...args) => { handleConnectAndRedirect(...args); handleOpenWalletModal(); }} />
              )}
              <WalletDropdown className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                <WalletAdvancedWalletActions />
                <WalletAdvancedAddressDetails />
                <WalletAdvancedTransactionActions />
                <WalletAdvancedTokenHoldings />
              </WalletDropdown>
            </Wallet>
          </div>
        </header>

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderContent()}
          </div>
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <button
            className="text-[var(--ock-text-foreground-muted)] text-xs hover:text-[var(--app-accent)] transition-colors"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            CampusCoin - Pagos Rápidos para Estudiantes
          </button>
        </footer>
      </div>
      <FloatingChat />
    </div>
  );
}


