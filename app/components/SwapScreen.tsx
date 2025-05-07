"use client";

import { useState, useEffect } from 'react';

type Token = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  address: string;
  geckoId: string;
};

export function SwapScreen({ onBack }: { onBack: () => void }) {
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [selectedFromToken, setSelectedFromToken] = useState<string>('usdc');
  const [selectedToToken, setSelectedToToken] = useState<string>('eth');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isCalculating, setIsCalculating] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const tokens: Token[] = [
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      icon: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z',
      address: '0x...',
      geckoId: 'usd-coin'
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      address: '0x...',
      geckoId: 'ethereum'
    },
    {
      id: 'base',
      name: 'Base',
      symbol: 'BASE',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      address: '0x...',
      geckoId: ''
    }
  ];

  const fetchExchangeRate = async () => {
    try {
      setIsLoadingRate(true);
      
      // Siempre obtener los precios de ambos tokens
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd`
      );
      
      if (!response.ok) throw new Error('Error al obtener tasas de cambio');
      
      const data = await response.json();
      
      // USDC siempre debe ser 1 USD
      const usdcPrice = 1;
      const ethPrice = data.ethereum.usd;
      
      // Calcular la tasa según los tokens seleccionados
      let rate;
      if (selectedFromToken === 'usdc' && selectedToToken === 'eth') {
        rate = 1 / ethPrice; // Cuánto ETH obtienes por 1 USDC
      } else if (selectedFromToken === 'eth' && selectedToToken === 'usdc') {
        rate = ethPrice; // Cuántos USDC obtienes por 1 ETH
      }
      
      setExchangeRate(rate);
      setLastUpdate(new Date());

      // Recalcular el monto si hay un valor en fromAmount
      if (fromAmount && !isNaN(Number(fromAmount))) {
        const converted = Number(fromAmount) * rate;
        setToAmount(converted.toFixed(selectedToToken === 'eth' ? 6 : 2));
      }
    } catch (error) {
      console.error('Error al obtener tasa de cambio:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchExchangeRate, 30000);
    return () => clearInterval(interval);
  }, [selectedFromToken, selectedToToken]);

  const handleAmountChange = (value: string) => {
    if (!exchangeRate) return;

    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      setIsCalculating(true);
      const convertedAmount = Number(value) * exchangeRate;
      setToAmount(convertedAmount.toFixed(selectedToToken === 'eth' ? 6 : 2));
      setIsCalculating(false);
    } else {
      setToAmount('');
    }
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      alert('Por favor ingresa los montos para el swap');
      return;
    }

    try {
      // Aquí iría la lógica de swap
      console.log('Swap iniciado:', {
        fromToken: selectedFromToken,
        toToken: selectedToToken,
        fromAmount,
        toAmount,
        slippage
      });
    } catch (error) {
      console.error('Error en el swap:', error);
    }
  };

  const handleTokenSwap = () => {
    const tempToken = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(tempToken);
    setFromAmount('');
    setToAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-[#B8B8B8] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>
          <div className="w-6"></div>
        </div>

        {/* From Token */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Desde
          </label>
          <div className="flex space-x-2">
            <select
              value={selectedFromToken}
              onChange={(e) => setSelectedFromToken(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
            >
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Swap Button and Rate Display */}
        <div className="flex flex-col items-center my-4">
          <button
            onClick={handleTokenSwap}
            className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center hover:bg-[#2A2A2A] transition-colors mb-2"
          >
            <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          
          {/* Rate Display */}
          <div className="text-center text-sm">
            {isLoadingRate ? (
              <p className="text-[#B8B8B8] animate-pulse">Cargando tasa...</p>
            ) : exchangeRate ? (
              <div className="text-[#B8B8B8]">
                <p>1 {selectedFromToken.toUpperCase()} = {exchangeRate.toFixed(6)} {selectedToToken.toUpperCase()}</p>
                <p className="text-xs mt-1">
                  Actualizado: {lastUpdate?.toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <p className="text-red-500">Error al cargar tasa</p>
            )}
          </div>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            A
          </label>
          <div className="flex space-x-2">
            <select
              value={selectedToToken}
              onChange={(e) => setSelectedToToken(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]"
            >
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={toAmount}
              readOnly
              className="w-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] cursor-not-allowed opacity-80"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Slippage Settings */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Tolerancia de Deslizamiento
          </label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  slippage === value
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-black rounded-lg hover:from-[#FFC000] hover:to-[#FFB300] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Swap
          </button>
        </div>
      </div>
    </div>
  );
} 