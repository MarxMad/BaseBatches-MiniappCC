"use client";

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

type Challenge = {
  id: number;
  title: string;
  description: string;
  reward: string;
  progress: number;
  icon: string;
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

export function Dashboard() {
  const { user } = useApp();
  const [balance, setBalance] = useState("0.00");
  const [activeSlide, setActiveSlide] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState<{[key: string]: number}>({});
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#FFD700',
    icon: '',
  });

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Ahorro Semanal",
      description: "Ahorra 50 USDC esta semana",
      reward: "5 USDC",
      progress: 75,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: 2,
      title: "Primera Compra",
      description: "Realiza tu primera compra en la cafetería",
      reward: "2 USDC",
      progress: 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      id: 3,
      title: "Invita Amigos",
      description: "Invita 3 amigos a usar CampusCoin",
      reward: "10 USDC",
      progress: 33,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ];

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

  // Combinar categorías predefinidas con personalizadas
  const allCategories = [...defaultCategories, ...customCategories];

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

  useEffect(() => {
    // Cargar categorías personalizadas del localStorage al iniciar
    const savedCategories = localStorage.getItem('customCategories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCustomCategories(parsed);
        console.log('Categorías cargadas:', parsed); // Para debugging
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Guardar categorías personalizadas en localStorage cuando cambien
    if (customCategories.length > 0) {
      localStorage.setItem('customCategories', JSON.stringify(customCategories));
      console.log('Categorías guardadas:', customCategories); // Para debugging
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

  const handleNewExpense = () => {
    setIsNewExpenseModalOpen(true);
    setSelectedCategory('');
    setNewExpense({ category: '', amount: '', description: '' });
  };

  const handleSubmitExpense = () => {
    if (newExpense.amount && selectedCategory) {
      const categoryDetails = allCategories.find(cat => cat.id === selectedCategory)!;
      const expense: ExpenseWithCategory = {
        id: Date.now(),
        category: selectedCategory,
        categoryDetails,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString(),
        description: newExpense.description,
      };
      
      setExpenses(prev => [...prev, expense]);
      setNewExpense({ category: '', amount: '', description: '' });
      setSelectedCategory('');
      setIsNewExpenseModalOpen(false);

      // Actualizar los totales por categoría
      setExpensesByCategory(prev => ({
        ...prev,
        [selectedCategory]: (prev[selectedCategory] || 0) + parseFloat(newExpense.amount)
      }));
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
      console.log('Nueva categoría agregada:', newCategoryItem); // Para debugging
      
      // Si estábamos en el modal de nuevo gasto, volvemos a él
      if (isNewExpenseModalOpen) {
        setTimeout(() => {
          setIsNewCategoryModalOpen(false);
          setIsNewExpenseModalOpen(true);
          setSelectedCategory(newCategoryItem.id);
        }, 100);
      } else {
        setIsNewCategoryModalOpen(false);
      }
      
      setNewCategory({ name: '', color: '#FFD700', icon: '' });
    }
  };

  const switchToNewCategory = () => {
    setIsNewExpenseModalOpen(false);
    setIsNewCategoryModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-[#111111] to-[#1A1A1A] rounded-xl p-6 mb-8 border border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Balance Total</h2>
          <button className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium">
            Recargar
          </button>
        </div>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold text-[#FFD700]">{balance}</span>
          <span className="ml-2 text-[#B8B8B8]">USDC</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button className="flex flex-col items-center justify-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors group">
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#1A1A1A] transition-colors">
              <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Enviar</span>
          </button>

          <button className="flex flex-col items-center justify-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors group">
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#1A1A1A] transition-colors">
              <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-2 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Escanear QR</span>
          </button>

          <button className="flex flex-col items-center justify-center p-3 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors group">
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#1A1A1A] transition-colors">
              <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Swap</span>
          </button>
        </div>
      </div>

      {/* Challenges Carousel */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Desafíos Activos</h2>
        <div className="relative">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex-none w-80 bg-[#111111] rounded-lg p-4 border border-[#2A2A2A]"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={challenge.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{challenge.title}</h3>
                    <p className="text-sm text-[#B8B8B8]">{challenge.description}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="h-2 bg-[#2A2A2A] rounded-full">
                    <div
                      className="h-full bg-[#FFD700] rounded-full transition-all duration-300"
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B8B8B8] text-sm">{challenge.progress}% completado</span>
                  <span className="text-[#FFD700] font-medium">Recompensa: {challenge.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Manager */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Gestor de Gastos</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleNewCategory}
              className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium"
            >
              Crear Categoría
            </button>
            <button 
              onClick={handleNewExpense}
              className="px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium"
            >
              Nuevo Gasto
            </button>
          </div>
        </div>

        {/* Expense Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Gastos del Mes</h3>
              <span className="text-[#FFD700] font-bold">${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-[#2A2A2A] rounded-full">
              <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Presupuesto</h3>
              <span className="text-[#B8B8B8] font-bold">$600.00</span>
            </div>
            <div className="h-2 bg-[#2A2A2A] rounded-full">
              <div className="h-full bg-[#FFD700] rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Ahorro</h3>
              <span className="text-[#00FF00] font-bold">$180.00</span>
            </div>
            <div className="h-2 bg-[#2A2A2A] rounded-full">
              <div className="h-full bg-[#00FF00] rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>

        {/* Expenses List by Category */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Gastos por Categoría</h3>
          <div className="space-y-4">
            {Object.entries(expensesByCategory).map(([categoryId, amount]) => (
              <div key={categoryId} className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getCategoryColor(categoryId) + '20' }}
                    >
                      <svg 
                        className="w-6 h-6" 
                        style={{ color: getCategoryColor(categoryId) }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(categoryId)} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{getCategoryName(categoryId)}</h4>
                      <p className="text-sm text-[#B8B8B8]">
                        {expenses.filter(e => e.category === categoryId).length} transacciones
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FFD700] font-bold">${amount.toFixed(2)}</p>
                    <p className="text-sm text-[#B8B8B8]">
                      {((amount / totalExpenses) * 100).toFixed(1)}% del total
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-[#2A2A2A] rounded-full">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(amount / totalExpenses) * 100}%`,
                      backgroundColor: getCategoryColor(categoryId)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Gastos Recientes</h3>
          <div className="space-y-2">
            {expenses.slice(-5).reverse().map((expense) => (
              <div key={expense.id} className="bg-[#111111] p-4 rounded-lg border border-[#2A2A2A] flex items-center justify-between">
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

        {/* New Expense Modal */}
        {isNewExpenseModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#111111] rounded-xl p-6 w-full max-w-md border border-[#2A2A2A]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Agregar Nuevo Gasto</h3>
                <button
                  onClick={switchToNewCategory}
                  className="px-3 py-1 bg-[#2A2A2A] text-[#FFD700] rounded-lg hover:bg-[#3A3A3A] transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nueva Categoría</span>
                </button>
              </div>

              {/* Categories Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-[#B8B8B8]">
                    Seleccionar Categoría
                  </label>
                  <span className="text-xs text-[#8A8A8A]">
                    {allCategories.length} categorías disponibles
                  </span>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#1A1A1A] scrollbar-thumb-[#2A2A2A]">
                  {/* Default Categories */}
                  {defaultCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-[#2A2A2A] border-2 border-[#FFD700]'
                          : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
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
                  ))}

                  {/* Custom Categories */}
                  {customCategories.length > 0 && (
                    <>
                      <div className="col-span-3 pt-2 pb-1">
                        <div className="flex items-center">
                          <div className="flex-grow border-t border-[#2A2A2A]"></div>
                          <span className="px-2 text-xs text-[#8A8A8A]">Categorías Personalizadas</span>
                          <div className="flex-grow border-t border-[#2A2A2A]"></div>
                        </div>
                      </div>

                      {customCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-[#2A2A2A] border-2 border-[#FFD700]'
                              : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
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
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Selected Category Preview */}
              {selectedCategory && (
                <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: (allCategories.find(c => c.id === selectedCategory)?.color || '#FFD700') + '20' 
                      }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        style={{ color: allCategories.find(c => c.id === selectedCategory)?.color || '#FFD700' }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={allCategories.find(c => c.id === selectedCategory)?.icon || ''} 
                        />
                      </svg>
                    </div>
                    <span className="text-white font-medium">
                      {allCategories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                  Monto
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                  placeholder="0.00"
                />
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#B8B8B8] mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD700]"
                  placeholder="Descripción del gasto"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsNewExpenseModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitExpense}
                  disabled={!selectedCategory || !newExpense.amount}
                  className="flex-1 px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC000] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Category Modal */}
        {isNewCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      </div>
    </div>
  );
} 