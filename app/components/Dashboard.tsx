"use client";

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TransferScreen } from './TransferScreen';
import { QRScanner } from './QRScanner';
import { SwapScreen } from './SwapScreen';
import { BookMarketplace } from './BookMarketplace';
import { useAccount, useContractRead, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { USDC_ADDRESS } from '../constants/addresses';
import { USDC_ABI } from '../constants/abis';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useWalletStats } from '../hooks/useWalletStats';

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

// Agregar estilos base para el dashboard
const techGradient = "bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]";
const glowEffect = "hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300";
const cardStyle = `${techGradient} rounded-2xl border border-[#333333] backdrop-blur-xl ${glowEffect}`;
const iconContainerStyle = "bg-[#111111] bg-opacity-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-70";

export function Dashboard() {
  const { user } = useApp();
  const { address, isConnected } = useAccount();
  const { balanceChange24h, transactionCount, gasSaved } = useWalletStats();
  
  // Leer balance de USDC
  const { data: usdcBalance } = useContractRead({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address
    }
  });

  // Formatear balance
  const formattedBalance = usdcBalance 
    ? formatUnits(usdcBalance, 6) // USDC tiene 6 decimales
    : '0.00';

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
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSwapScreenOpen, setIsSwapScreenOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Primera Compra",
      description: "Realiza tu primera compra en el marketplace",
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
      progress: 0,
      reward: "50 Puntos",
      endDate: "2024-03-20",
      type: 'special',
      requirements: {
        current: 0,
        target: 1,
        unit: 'compras'
      },
      status: 'active'
    },
    {
      id: 2,
      title: "Vendedor Estrella",
      description: "Vende 3 libros esta semana",
      icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
      progress: 66,
      reward: "100 Puntos",
      endDate: "2024-03-15",
      type: 'weekly',
      requirements: {
        current: 2,
        target: 3,
        unit: 'ventas'
      },
      status: 'active'
    },
    {
      id: 3,
      title: "Transacciones Diarias",
      description: "Realiza 5 transacciones hoy",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      progress: 80,
      reward: "30 Puntos",
      endDate: "2024-03-10",
      type: 'daily',
      requirements: {
        current: 4,
        target: 5,
        unit: 'transacciones'
      },
      status: 'active'
    },
    {
      id: 4,
      title: "Calificador Experto",
      description: "Califica 10 libros comprados",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      progress: 40,
      reward: "80 Puntos",
      endDate: "2024-03-25",
      type: 'weekly',
      requirements: {
        current: 4,
        target: 10,
        unit: 'calificaciones'
      },
      status: 'active'
    }
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

  // Componente para el carrusel de desafíos
  const ChallengesCarousel = () => {
    const filteredChallenges = selectedType === 'all' 
      ? challenges 
      : challenges.filter(challenge => challenge.type === selectedType);

    const getTypeColor = (type: string) => {
      switch(type) {
        case 'daily': return 'text-green-400';
        case 'weekly': return 'text-blue-400';
        case 'special': return 'text-purple-400';
        default: return 'text-white';
      }
    };

    const getProgressColor = (progress: number) => {
      if (progress >= 80) return 'bg-green-500';
      if (progress >= 50) return 'bg-yellow-500';
      return 'bg-blue-500';
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] hover:border-[#FFD700] transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#2A2A2A] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={challenge.icon} />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white text-lg">{challenge.title}</h3>
                  <span className={`text-sm font-medium ${getTypeColor(challenge.type)}`}>
                    {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                  </span>
                </div>
                <p className="text-[#B8B8B8] text-sm mt-1">{challenge.description}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm text-[#B8B8B8]">
                <span>Progreso: {challenge.requirements.current}/{challenge.requirements.target} {challenge.requirements.unit}</span>
                <span>{challenge.progress}%</span>
              </div>
              <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(challenge.progress)} rounded-full transition-all duration-500`}
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[#FFD700] font-semibold">{challenge.reward}</span>
                </div>
                <span className="text-sm text-[#B8B8B8]">
                  Termina: {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${techGradient} min-h-screen`}>
      {/* Header con Logo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA500] opacity-50 blur-xl" />
            <div className="relative w-full h-full bg-black rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
                CC
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">CampusCoin</h1>
            <p className="text-sm text-[#B8B8B8]">Tu Wallet Universitaria</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#1A1A1A] rounded-xl px-4 py-2 border border-[#333333]">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-[#B8B8B8]">Base Network</span>
          </div>
          
        </div>
      </div>

      {/* Balance Card */}
      <div className={`${cardStyle} p-8 mb-8 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full filter blur-[128px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFA500] rounded-full filter blur-[96px] opacity-10" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Balance Total</h2>
              <p className="text-[#B8B8B8] text-sm">Actualizado hace 2 min</p>
            </div>
            {!isConnected ? (
              <span className="text-[#B8B8B8] bg-[#222222] px-4 py-2 rounded-lg">Wallet no conectada</span>
            ) : (
              <button 
                onClick={() => setIsDepositModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Recargar USDC</span>
              </button>
            )}
          </div>

          <div className="flex items-baseline mb-8">
            <span className="text-5xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
              {isConnected ? formattedBalance : '-.--'}
            </span>
            <span className="ml-3 text-lg text-[#B8B8B8]">USDC</span>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                title: "Enviar",
                icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
                onClick: () => setIsTransferScreenOpen(true)
              },
              {
                title: "Escanear QR",
                icon: "M12 4v1m6 11h2m-2 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
                onClick: () => setIsQRScannerOpen(true)
              },
              {
                title: "Swap",
                icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
                onClick: () => setIsSwapScreenOpen(true)
              }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={!isConnected}
                className={`group p-4 rounded-xl transition-all duration-300
                  ${isConnected 
                    ? 'bg-[#1A1A1A] hover:bg-[#222222] hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-[#1A1A1A] opacity-50 cursor-not-allowed'}`}
              >
                <div className={`${iconContainerStyle} w-14 h-14 mx-auto mb-3`}>
                  <svg className="w-7 h-7 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white block text-center">{action.title}</span>
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#B8B8B8] text-sm">24h Cambio</span>
                <span className={balanceChange24h >= 0 ? "text-green-400" : "text-red-400"}>
                  {balanceChange24h >= 0 ? '+' : ''}{balanceChange24h}%
                </span>
              </div>
              <div className="h-1 bg-[#333333] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${balanceChange24h >= 0 ? 'bg-green-400' : 'bg-red-400'} rounded-full`} 
                  style={{ width: `${Math.min(Math.abs(balanceChange24h * 4), 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#B8B8B8] text-sm">Transacciones</span>
                <span className="text-[#FFD700]">{transactionCount}</span>
              </div>
              <div className="h-1 bg-[#333333] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FFD700] rounded-full" 
                  style={{ width: `${Math.min((transactionCount / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#B8B8B8] text-sm">Gas Gastado</span>
                <span className="text-purple-400">{gasSaved.toFixed(4)} ETH</span>
              </div>
              <div className="h-1 bg-[#333333] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-400 rounded-full" 
                  style={{ width: `${Math.min((gasSaved / 0.1) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Manager Section */}
      <div className={`${cardStyle} p-8 mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Gestor de Gastos</h2>
            <p className="text-[#B8B8B8] text-sm">Controla tus gastos y categorías</p>
          </div>
          <button
            onClick={handleNewCategory}
            className="px-6 py-3 bg-[#222222] text-white rounded-xl hover:bg-[#333333] transition-all font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Categoría</span>
          </button>
        </div>

        {/* Expense Summary Cards con diseño mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Gastos del Mes",
              amount: totalExpenses.toFixed(2),
              color: "#FFD700",
              progress: (totalExpenses / budget) * 100
            },
            {
              title: "Presupuesto",
              amount: budget.toFixed(2),
              color: "#00FF00",
              progress: 100,
              isEditable: true
            },
            {
              title: "Ahorro",
              amount: savings.toFixed(2),
              color: savings >= 0 ? "#00FFFF" : "#FF5555",
              progress: Math.abs(savingsPercentage)
            }
          ].map((item, index) => (
            <div key={index} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] relative overflow-hidden">
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
              return (
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
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-[#FFD700] font-bold">${amount.toFixed(2)}</p>
                        <p className="text-sm text-[#B8B8B8]">
                          {((amount / totalExpenses) * 100).toFixed(1)}% del total
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
              );
            })}
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

      {/* Challenges Section */}
      <div className={`${cardStyle} p-8 mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Desafíos Activos</h2>
            <p className="text-[#B8B8B8] text-sm">Completa desafíos para ganar recompensas</p>
          </div>
          <div className="flex space-x-2">
            {['all', 'daily', 'weekly', 'special'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold shadow-lg'
                    : 'bg-[#222222] text-white hover:bg-[#333333]'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ChallengesCarousel />
      </div>

      {/* Book Marketplace */}
      <div className="mt-8">
        <BookMarketplace />
      </div>

      {/* Transfer Screen */}
      {isTransferScreenOpen && (
        <TransferScreen 
          onBack={() => setIsTransferScreenOpen(false)} 
          categories={allCategories}
          onDeleteCategory={handleDeleteCategory}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
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
    </div>
  );
} 