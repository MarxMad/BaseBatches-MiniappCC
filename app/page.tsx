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
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useApp } from "./context/AppContext";
import { FloatingChat } from "./components/FloatingChat";
import { Dashboard } from "./components/Dashboard";

// Tipos
type Transaction = {
  title: string;
  date: string;
  amount: string;
  status: string;
};

type SectionType = 'home' | 'transactions' | 'budget' | 'settings' | 'dashboard';

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { connectWallet, user } = useApp();
  const [activeTab, setActiveTab] = useState<SectionType>('home');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleConnectAndRedirect = async () => {
    try {
      await connectWallet();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error al conectar la wallet:', error);
    }
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return (
          <>
            {/* Logo Principal */}
            <div className="md:col-span-2 flex justify-center items-center mb-8">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#111111] to-[#1A1A1A]">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[128px]"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFC000] rounded-full filter blur-[128px]"></div>
                </div>
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,215,0,0.15) 2px, transparent 0)',
                  backgroundSize: '24px 24px' 
                }}></div>
              </div>

              {/* Content Container */}
              <div className="relative p-8 backdrop-blur-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 space-y-6 md:space-y-0">
                  {/* Logo and Brand Section */}
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Brand Image */}
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden backdrop-blur-sm bg-black bg-opacity-30 border border-[#2A2A2A] group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFC000] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Placeholder para la imagen */}
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto text-[#FFD700] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-[#B8B8B8] text-sm">Agregar imagen de marca</p>
                        </div>
                      </div>
                    </div>

                    {/* Logo and Text */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFC000] rounded-full animate-pulse blur-md"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFC000] rounded-full flex items-center justify-center shadow-lg">
                          <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-transparent bg-clip-text">
                          CampusCoin
                        </h1>
                        <p className="text-[#B8B8B8] text-lg">La wallet del futuro universitario</p>
                      </div>
                    </div>
                  </div>

                  {/* Connect Button */}
                  {!user && (
                    <button
                      onClick={handleConnectAndRedirect}
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD700] to-[#FFC000] rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                      <div className="relative px-6 py-3 bg-black rounded-lg leading-none flex items-center">
                        <span className="text-[#FFD700] group-hover:text-[#FFC000] transition duration-200">
                          Comenzar ahora
                        </span>
                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200 text-[#FFD700] group-hover:text-[#FFC000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>

                {/* Hero Message */}
                <div className="text-center mb-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-10 blur-xl"></div>
                  <h2 className="text-5xl font-bold mb-6 leading-tight">
                    <span className="text-white">El Futuro de las </span>
                    <span className="bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-transparent bg-clip-text">
                      Finanzas Universitarias
                    </span>
                  </h2>
                  <p className="text-[#B8B8B8] text-xl max-w-2xl mx-auto leading-relaxed">
                    Revoluciona tu experiencia universitaria con tecnología blockchain y gestión financiera inteligente
                  </p>
                </div>

                {/* Features Grid with Glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {[
                    {
                      title: "Mercado de Libros",
                      description: "Marketplace descentralizado para intercambio de libros académicos",
                      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                    },
                    {
                      title: "Smart Expenses",
                      description: "IA que aprende y optimiza tus patrones de gasto",
                      icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                    },
                    {
                      title: "Crypto Payments",
                      description: "Pagos instantáneos con tecnología blockchain",
                      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="group relative backdrop-blur-md bg-black bg-opacity-50 p-6 rounded-xl border border-[#2A2A2A] hover:border-[#FFD700] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFC000] opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="w-12 h-12 mb-4 relative">
                          <div className="absolute inset-0 bg-[#FFD700] opacity-20 rounded-lg blur"></div>
                          <div className="relative w-full h-full bg-black rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-[#B8B8B8] group-hover:text-white transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Section */}
                {!user && (
                  <div className="text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-10 blur-xl"></div>
                    <p className="text-[#B8B8B8] text-lg mb-6">
                      Únete a la revolución financiera en tu campus
                    </p>
                    <button
                      onClick={handleConnectAndRedirect}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-black rounded-lg relative group overflow-hidden font-bold text-lg shadow-2xl"
                    >
                      <div className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-[#FFC000] to-[#FFD700]"></div>
                      <span className="relative flex items-center">
                        Empieza tu experiencia CampusCoin
                        <svg className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>{saveFrameButton}</div>
          <div className="flex items-center justify-end w-full">
            <Wallet className="z-10">
              <ConnectWallet onConnect={handleConnectAndRedirect}>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Avatar />
                    <Name className="text-inherit" />
                  </div>
                ) : (
                  <button className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium">
                    Conectar Wallet
                  </button>
                )}
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
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


