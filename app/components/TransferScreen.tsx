"use client";

import { useState } from 'react';
import { useApp } from '../context/AppContext';

type Network = {
  id: string;
  name: string;
  icon: string;
  symbol: string;
};

export function TransferScreen({ 
  onBack, 
  categories,
  onDeleteCategory 
}: { 
  onBack: () => void, 
  categories: any[],
  onDeleteCategory: (categoryId: string) => void 
}) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('base');
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const networks: Network[] = [
    {
      id: 'base',
      name: 'Base Network',
      icon: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z',
      symbol: 'USDC'
    },
    {
      id: 'ethereum',
      name: 'Ethereum Mainnet',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      symbol: 'USDC'
    }
  ];

  const handleTransfer = async () => {
    if (!amount || !recipientAddress || !selectedCategory) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      // Aquí iría la lógica de transferencia
      console.log('Transferencia iniciada:', {
        network: selectedNetwork,
        amount,
        recipient: recipientAddress,
        category: selectedCategory,
        note
      });
    } catch (error) {
      console.error('Error en la transferencia:', error);
    }
  };

  const handleDeleteCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCategoryToDelete(categoryId);
    setIsDeletingCategory(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setIsDeletingCategory(false);
      setCategoryToDelete(null);
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 relative">
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
          <h2 className="text-2xl font-bold text-white">Nueva Transferencia</h2>
          <div className="w-6"></div>
        </div>

        {/* Network Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Red
          </label>
          <div className="grid grid-cols-2 gap-3">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={`flex items-center space-x-3 p-4 rounded-lg border ${
                  selectedNetwork === network.id
                    ? 'border-[#FFD700] bg-[#FFD700] bg-opacity-5'
                    : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                } transition-all duration-200`}
              >
                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={network.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{network.name}</p>
                  <p className="text-sm text-[#B8B8B8]">{network.symbol}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Monto (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
              placeholder="0.00"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B8B8B8]">
              USDC
            </div>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Dirección del Destinatario
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
            placeholder="0x..."
          />
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Categoría del Gasto
          </label>
          <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#2A2A2A] scrollbar-track-[#1A1A1A]">
            {categories.map((category) => (
              <div key={category.id} className="relative">
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-[#2A2A2A] border-2 border-[#FFD700]'
                      : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#2A2A2A]'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
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
                  <span className="text-sm font-medium text-white">{category.name}</span>
                </button>
                {category.id.startsWith('custom-') && (
                  <button
                    onClick={(e) => handleDeleteCategory(category.id, e)}
                    className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-400 transition-colors bg-[#1A1A1A] rounded-full"
                    title="Eliminar categoría"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Nota (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
            placeholder="Añade una nota a la transferencia..."
          />
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
            onClick={handleTransfer}
            disabled={!amount || !recipientAddress || !selectedCategory}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC000] text-black rounded-lg hover:from-[#FFC000] hover:to-[#FFB300] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar USDC
          </button>
        </div>
      </div>

      {/* Delete Category Confirmation Modal */}
      {isDeletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-[#2A2A2A]">
            <h3 className="text-xl font-bold text-white mb-4">Eliminar Categoría</h3>
            <p className="text-[#B8B8B8] mb-6">
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsDeletingCategory(false);
                  setCategoryToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 