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
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD700] via-[#FFC000] to-[#FFD700] rounded-full blur opacity-75 animate-pulse"></div>
                <div className="relative flex items-center space-x-4 bg-[#111111] p-6 rounded-full border-2 border-[#FFD700]">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700] to-[#FFC000] rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-1 bg-[#111111] rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#FFD700]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.26273M12 7.26273C10.4919 7.16644 9 7.87558 9 9.50001C9 12.5 15 11 15 14C15 15.6569 13.2091 16.4678 12 16.4678M12 7.26273V5M12 16.4678C10.4724 16.4678 9.06662 15.8154 8.5 15M12 16.4678V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-transparent bg-clip-text">
                      CampusCoin
                    </h1>
                    <p className="text-[#B8B8B8] font-medium">WALLET</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Bienvenida */}
            <div className="md:col-span-2 bg-gradient-to-r from-[#111111] to-[#1A1A1A] p-6 rounded-lg shadow-lg border border-[#2A2A2A] mb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">CampusCoin</h1>
                    <p className="text-[#B8B8B8]">Tu billetera digital universitaria</p>
                  </div>
                </div>
                {!user && (
                  <button
                    onClick={handleConnectAndRedirect}
                    className="px-6 py-3 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <span>Comenzar ahora</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Pagos Instantáneos</h3>
                  <p className="text-[#B8B8B8] text-sm">Realiza pagos en segundos dentro del campus universitario</p>
                </div>

                <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">100% Seguro</h3>
                  <p className="text-[#B8B8B8] text-sm">Transacciones protegidas por tecnología blockchain</p>
                </div>

                <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Sin Comisiones</h3>
                  <p className="text-[#B8B8B8] text-sm">Transfiere dinero sin costos adicionales</p>
                </div>
              </div>

              <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
                <h3 className="text-white font-medium mb-3">¿Cómo funciona?</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FFD700] font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Conecta tu wallet</h4>
                      <p className="text-[#B8B8B8] text-xs">Vincula tu billetera digital de forma segura</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FFD700] font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Recarga saldo</h4>
                      <p className="text-[#B8B8B8] text-xs">Añade fondos desde cualquier fuente</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FFD700] font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Realiza pagos</h4>
                      <p className="text-[#B8B8B8] text-xs">Paga en cualquier comercio del campus</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#FFD700] font-medium">4</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Gestiona gastos</h4>
                      <p className="text-[#B8B8B8] text-xs">Controla tus finanzas fácilmente</p>
                    </div>
                  </div>
                </div>
              </div>

              {user && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="group relative px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-black rounded-lg hover:from-[#FFC000] hover:to-[#FFB300] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-medium">Ir al Dashboard</span>
                      <svg 
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </button>
                </div>
              )}
            </div>

            {/* Sección de Transacciones Recientes */}
            <div className="md:col-span-2 bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-[#2A2A2A]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-white">Transacciones Recientes</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as "day" | "week" | "month" | "year")}
                  className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                >
                  <option value="day">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="year">Este año</option>
                </select>
              </div>
              <div className="space-y-2">
                {transactions.length > 0 ? (
                  <>
                    {transactions.slice(0, 3).map((tx, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
                        <div>
                          <p className="font-medium text-white">{tx.title}</p>
                          <p className="text-sm text-[#8A8A8A]">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${tx.amount?.startsWith('-') ? 'text-red-500' : 'text-[#0052FF]'}`}>
                            {tx.amount}
                          </p>
                          <p className="text-sm text-[#8A8A8A]">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveTab('transactions')}
                      className="w-full px-4 py-2 text-[#0052FF] hover:text-[#0047E0] font-medium text-sm"
                    >
                      Ver todas las transacciones
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-[#8A8A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-[#8A8A8A] text-lg font-medium mb-2">Aún no hay transacciones</p>
                    <p className="text-[#666666] text-sm">
                      Tus transacciones aparecerán aquí cuando realices tu primera operación
                    </p>
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


