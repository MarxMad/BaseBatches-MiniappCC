"use client";

import { useState } from 'react';
import { Category } from '../types';

interface TransferScreenProps {
  onBack: () => void;
  categories: Category[];
  onDeleteCategory: (categoryId: string) => void;
  onSaveExpense: (expense: { amount: number; category: string; note: string }) => void;
  initialAmount?: number;
}

export function TransferScreen({ 
  onBack, 
  categories, 
  onDeleteCategory, 
  onSaveExpense,
  initialAmount = 0 
}: TransferScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState(initialAmount.toString());
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleSaveExpense = () => {
    if (selectedCategory && amount) {
      onSaveExpense({
        amount: parseFloat(amount),
        category: selectedCategory,
        note
      });
      onBack();
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeletingCategory(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setIsDeletingCategory(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#111111] rounded-2xl border border-[#2A2A2A] p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Categorizar Gasto</h2>
          <button
            onClick={onBack}
            className="text-[#B8B8B8] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Monto del Gasto */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Monto del Gasto (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {/* Categorías */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[#2A2A2A] border-2 border-[#FFD700]'
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <svg 
                      className="w-5 h-5" 
                      style={{ color: category.color }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                    </svg>
                  </div>
                  <span className="text-white">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nota */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
            Nota (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
            placeholder="Agregar una nota..."
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveExpense}
            className="flex-1 px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium"
            disabled={!selectedCategory || !amount}
          >
            Guardar Gasto
          </button>
        </div>

        {/* Modal de Confirmación de Eliminación */}
        {isDeletingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-[#2A2A2A]">
              <h3 className="text-xl font-bold text-white mb-4">Eliminar Categoría</h3>
              <p className="text-[#B8B8B8] mb-6">
                ¿Estás seguro de que deseas eliminar esta categoría? Los gastos asociados se moverán a la categoría "Otros".
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeletingCategory(false)}
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
    </div>
  );
} 