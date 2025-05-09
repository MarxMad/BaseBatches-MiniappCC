"use client";

import React, { useState, useRef } from 'react';
import { useContractWrite, useContractRead, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'react-hot-toast';
import { USDC_ADDRESS, CAMPUS_COIN_ADDRESS, STUDY_GUIDE_NFT_ADDRESS } from '../constants/addresses';
import { CAMPUS_COIN_ABI, USDC_ABI, STUDY_GUIDE_NFT_ABI } from '../constants/abis';
import { LoadingSpinner } from './LoadingSpinner';
import { ContractWriteResult, ContractWriteParams, UseContractWriteResult } from '../types/contracts';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    price: number;
    category: string;
    image: string;
    seller: string;
    rating: number;
}

interface StudyGuide {
    id: number;
    title: string;
    author: string;
    description: string;
    subject: string;
    price: number;
    image: string;
    creator: string;
    totalSupply: number;
    minted: number;
    nftId?: number;
}

interface Category {
    id: number;
    name: string;
    icon: string;
}

// Estilos base
const techGradient = "bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]";
const glowEffect = "hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300";
const cardStyle = `${techGradient} rounded-2xl border border-[#333333] backdrop-blur-xl ${glowEffect}`;

export const BookMarketplace = () => {
    const { address } = useAccount();
    const [books, setBooks] = useState<Book[]>([]);
    const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublishGuideModalOpen, setIsPublishGuideModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isApproving, setIsApproving] = useState(false);
    const [activeTab, setActiveTab] = useState<'books' | 'guides'>('books');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Estado para el formulario
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        category: '',
        image: ''
    });

    // Estado para el formulario de guías
    const [newGuide, setNewGuide] = useState({
        title: '',
        author: '',
        description: '',
        subject: '',
        price: '',
        image: ''
    });

    // Categorías disponibles
    const categories: Category[] = [
        { id: 1, name: 'Libros de Texto', icon: 'BOOK' },
        { id: 2, name: 'Novelas', icon: 'NOVEL' },
        { id: 3, name: 'Referencia', icon: 'REF' },
        { id: 4, name: 'Revistas', icon: 'MAG' }
    ];

    // Leer allowance de USDC
    const { data: usdcAllowance } = useContractRead({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [address, CAMPUS_COIN_ADDRESS],
        watch: true,
    });

    // Aprobar USDC
    const { writeAsync: approveUsdc, data: approveData } = useContractWrite({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
    });

    // Esperar transacción de aprobación
    const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
        hash: approveData?.hash,
    });

    // Comprar libro
    const { writeAsync: purchaseBook, data: purchaseData } = useContractWrite({
        address: CAMPUS_COIN_ADDRESS,
        abi: CAMPUS_COIN_ABI,
        functionName: 'purchaseBook',
    });

    // Esperar transacción de compra
    const { isLoading: isPurchaseLoading } = useWaitForTransactionReceipt({
        hash: purchaseData?.hash,
    });

    // Comprar guía de estudio
    const { writeContract, data: purchaseGuideData } = useContractWrite() as UseContractWriteResult;

    // Esperar transacción de compra de guía
    const { isLoading: isPurchaseGuideLoading } = useWaitForTransactionReceipt({
        hash: purchaseGuideData,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewBook(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewImage(base64String);
                setNewBook(prev => ({
                    ...prev,
                    image: base64String
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublishBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Crear nuevo libro con imagen
            const newBookWithDetails: Book = {
                id: books.length + 1,
                title: newBook.title,
                author: newBook.author,
                description: newBook.description,
                price: parseFloat(newBook.price),
                category: newBook.category,
                image: newBook.image || '/placeholder-book.jpg',
                seller: 'Usuario Actual', // Esto se actualizará con la dirección del wallet
                rating: 0
            };

            // Actualizar la lista de libros
            setBooks(prevBooks => [...prevBooks, newBookWithDetails]);
            
            // Resetear el formulario
            setNewBook({
                title: '',
                author: '',
                description: '',
                price: '',
                category: '',
                image: ''
            });
            setPreviewImage('');
            setIsPublishModalOpen(false);
        } catch (error) {
            console.error('Error al publicar libro:', error);
        }
    };

    const handlePublishGuide = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Crear nueva guía
            const newGuideWithDetails: StudyGuide = {
                id: studyGuides.length + 1,
                title: newGuide.title,
                author: newGuide.author,
                description: newGuide.description,
                subject: newGuide.subject,
                price: parseFloat(newGuide.price),
                image: newGuide.image || '/placeholder-guide.jpg',
                creator: 'Usuario Actual', // Esto se actualizará con la dirección del wallet
                totalSupply: 100,
                minted: 0
            };

            // Actualizar la lista de guías
            setStudyGuides(prevGuides => [...prevGuides, newGuideWithDetails]);
            
            // Resetear el formulario
            setNewGuide({
                title: '',
                author: '',
                description: '',
                subject: '',
                price: '',
                image: ''
            });
            setPreviewImage('');
            setIsPublishGuideModalOpen(false);
        } catch (error) {
            console.error('Error al publicar guía:', error);
        }
    };

    const handlePurchase = async (book: Book) => {
        try {
            const priceInWei = parseUnits(book.price.toString(), 6); // USDC tiene 6 decimales

            // Verificar si necesitamos aprobación
            if (!usdcAllowance || usdcAllowance < priceInWei) {
                setIsApproving(true);
                try {
                    const tx = await approveUsdc({
                        args: [CAMPUS_COIN_ADDRESS, priceInWei],
                    });
                    await tx.wait();
                    toast.success('¡USDC aprobado correctamente!');
                } catch (error) {
                    console.error('Error al aprobar:', error);
                    toast.error('Error al aprobar USDC');
                    return;
                } finally {
                    setIsApproving(false);
                }
            }

            // Comprar el libro
            try {
                const tx = await purchaseBook({
                    args: [book.id],
                });
                await tx.wait();
                toast.success('¡Libro comprado correctamente!');
                // Actualizar la lista de libros
                setBooks(prevBooks => prevBooks.map(b => 
                    b.id === book.id ? { ...b, isAvailable: false } : b
                ));
            } catch (error) {
                console.error('Error al comprar:', error);
                toast.error('Error al comprar el libro');
            }

        } catch (error) {
            console.error('Error en la transacción:', error);
            toast.error('Error al procesar la compra');
        }
    };

    const handlePurchaseGuide = async (guide: StudyGuide) => {
        try {
            const priceInWei = parseUnits(guide.price.toString(), 18); // ETH tiene 18 decimales

            // Comprar la guía
            try {
                const params: ContractWriteParams = {
                    address: STUDY_GUIDE_NFT_ADDRESS,
                    abi: STUDY_GUIDE_NFT_ABI,
                    functionName: 'purchaseGuide',
                    args: [guide.id],
                    value: priceInWei,
                };

                const result = await writeContract(params);

                if (result.hash) {
                    toast.success('¡Guía comprada correctamente!');
                    // Actualizar la lista de guías
                    setStudyGuides(prevGuides => prevGuides.map(g => 
                        g.id === guide.id ? { ...g, minted: g.minted + 1 } : g
                    ));
                }
            } catch (error) {
                console.error('Error al comprar:', error);
                toast.error('Error al comprar la guía');
            }

        } catch (error) {
            console.error('Error en la transacción:', error);
            toast.error('Error al procesar la compra');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header del Marketplace */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
                        Marketplace
                    </h2>
                    <p className="text-[#B8B8B8] mt-2">Descubre y comparte recursos académicos</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`px-6 py-3 rounded-xl transition-all ${
                            activeTab === 'books'
                                ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold'
                                : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        Libros
                    </button>
                    <button
                        onClick={() => setActiveTab('guides')}
                        className={`px-6 py-3 rounded-xl transition-all ${
                            activeTab === 'guides'
                                ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold'
                                : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        Guías de Estudio
                    </button>
                    <button
                        onClick={() => activeTab === 'books' ? setIsPublishModalOpen(true) : setIsPublishGuideModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl 
                                 hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium shadow-lg 
                                 hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Publicar {activeTab === 'books' ? 'Libro' : 'Guía'}</span>
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={`Buscar por título, autor o ${activeTab === 'books' ? 'categoría' : 'materia'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 bg-[#1A1A1A] text-white rounded-xl border border-[#333333] 
                                 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] 
                                 transition-all pl-12"
                    />
                    <svg className="w-5 h-5 text-[#666666] absolute left-4 top-1/2 transform -translate-y-1/2" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {activeTab === 'books' && (
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-5 py-3 bg-[#1A1A1A] text-white rounded-xl border border-[#333333] 
                                 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] 
                                 transition-all appearance-none cursor-pointer w-full md:w-48"
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Grid de Contenido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'books' ? (
                    // Grid de Libros
                    books.map(book => (
                        <div key={book.id} 
                             className={`${cardStyle} group relative overflow-hidden transform transition-all duration-300 hover:-translate-y-2`}
                        >
                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] opacity-0 
                                          group-hover:opacity-10 transition-opacity duration-300" />
                            
                            {/* Imagen del libro */}
                            <div className="relative h-64 overflow-hidden rounded-t-2xl">
                                <img
                                    src={book.image || '/placeholder-book.jpg'}
                                    alt={book.title}
                                    className="w-full h-full object-cover transform transition-transform duration-300 
                                             group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            </div>

                            {/* Contenido */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{book.title}</h3>
                                    <p className="text-[#B8B8B8] text-sm">Por {book.author}</p>
                                </div>

                                <p className="text-[#999999] text-sm line-clamp-2">{book.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < book.rating ? 'text-[#FFD700]' : 'text-[#333333]'}`} 
                                                     fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[#B8B8B8] text-sm">({book.rating})</span>
                                    </div>
                                    <span className="text-[#FFD700] font-bold">{book.price} USDC</span>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => handlePurchase(book)}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium"
                                    >
                                        Comprar por {book.price} USDC
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const frameUrl = `${window.location.origin}/api/frame?bookId=${book.id}`;
                                            navigator.clipboard.writeText(frameUrl);
                                            toast.success('¡Enlace del Frame copiado! Compártelo en Warpcast');
                                        }}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span>Compartir en Farcaster</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Grid de Guías de Estudio
                    studyGuides.map(guide => (
                        <div key={guide.id} 
                             className={`${cardStyle} group relative overflow-hidden transform transition-all duration-300 hover:-translate-y-2`}
                        >
                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] opacity-0 
                                          group-hover:opacity-10 transition-opacity duration-300" />
                            
                            {/* Imagen de la guía */}
                            <div className="relative h-64 overflow-hidden rounded-t-2xl">
                                <img
                                    src={guide.image || '/placeholder-guide.jpg'}
                                    alt={guide.title}
                                    className="w-full h-full object-cover transform transition-transform duration-300 
                                             group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute top-4 right-4 bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm font-medium">
                                    NFT
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{guide.title}</h3>
                                    <p className="text-[#B8B8B8] text-sm">Por {guide.author}</p>
                                    <p className="text-[#FFD700] text-sm mt-1">{guide.subject}</p>
                                </div>

                                <p className="text-[#999999] text-sm line-clamp-2">{guide.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="text-[#B8B8B8] text-sm">
                                            {guide.minted} / {guide.totalSupply} minted
                                        </div>
                                    </div>
                                    <span className="text-[#FFD700] font-bold">{guide.price} USDC</span>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => handlePurchaseGuide(guide)}
                                        disabled={isPurchaseGuideLoading}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPurchaseGuideLoading ? (
                                            <div className="flex items-center justify-center">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            `Comprar NFT por ${guide.price} USDC`
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            const frameUrl = `${window.location.origin}/api/frame?guideId=${guide.id}`;
                                            navigator.clipboard.writeText(frameUrl);
                                            toast.success('¡Enlace del Frame copiado! Compártelo en Warpcast');
                                        }}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span>Compartir en Farcaster</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Estado vacío */}
            {(activeTab === 'books' ? books.length === 0 : studyGuides.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        No hay {activeTab === 'books' ? 'libros' : 'guías'} disponibles
                    </h3>
                    <p className="text-[#B8B8B8] text-center max-w-md">
                        No se encontraron {activeTab === 'books' ? 'libros' : 'guías'} que coincidan con tu búsqueda. 
                        Intenta con otros términos o publica el primer {activeTab === 'books' ? 'libro' : 'guía'}.
                    </p>
                </div>
            )}

            {/* Modal de Publicación de Guía */}
            {isPublishGuideModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md border border-[#333333] shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Publicar Nueva Guía de Estudio</h3>
                        <form onSubmit={handlePublishGuide} className="space-y-4">
                            {/* Imagen de la guía */}
                            <div>
                                <label className="block text-white mb-2">Imagen de la Guía</label>
                                <div className="flex flex-col items-center space-y-4">
                                    {previewImage ? (
                                        <div className="relative w-full h-48">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg border border-[#333333]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage('');
                                                    setNewGuide(prev => ({ ...prev, image: '' }));
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute top-2 right-2 bg-[#FF4444] text-white p-1 rounded-full hover:bg-[#CC3333] transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-48 border-2 border-dashed border-[#333333] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-colors bg-[#222222]"
                                        >
                                            <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="text-[#666666] mt-2">Subir imagen</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Campos del formulario */}
                            <div>
                                <label className="block text-white mb-2">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newGuide.title}
                                    onChange={(e) => setNewGuide(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Título de la guía"
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Autor</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={newGuide.author}
                                    onChange={(e) => setNewGuide(prev => ({ ...prev, author: e.target.value }))}
                                    placeholder="Autor de la guía"
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Materia</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={newGuide.subject}
                                    onChange={(e) => setNewGuide(prev => ({ ...prev, subject: e.target.value }))}
                                    placeholder="Materia de la guía"
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Descripción</label>
                                <textarea
                                    name="description"
                                    value={newGuide.description}
                                    onChange={(e) => setNewGuide(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción de la guía"
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Precio (USDC)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newGuide.price}
                                    onChange={(e) => setNewGuide(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="Precio en USDC"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div className="flex gap-4 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPublishGuideModalOpen(false);
                                        setPreviewImage('');
                                    }}
                                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold rounded-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all shadow-lg hover:shadow-xl"
                                >
                                    Publicar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Publicación de Libro (existente) */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md border border-[#333333] shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Publicar Nuevo Libro</h3>
                        <form onSubmit={handlePublishBook} className="space-y-4">
                            {/* Imagen del libro */}
                            <div>
                                <label className="block text-white mb-2">Imagen del Libro</label>
                                <div className="flex flex-col items-center space-y-4">
                                    {previewImage ? (
                                        <div className="relative w-full h-48">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg border border-[#333333]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage('');
                                                    setNewBook(prev => ({ ...prev, image: '' }));
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute top-2 right-2 bg-[#FF4444] text-white p-1 rounded-full hover:bg-[#CC3333] transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-48 border-2 border-dashed border-[#333333] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-colors bg-[#222222]"
                                        >
                                            <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="text-[#666666] mt-2">Subir imagen</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Campos del formulario */}
                            <div>
                                <label className="block text-white mb-2">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newBook.title}
                                    onChange={handleInputChange}
                                    placeholder="Título del libro"
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Autor</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={newBook.author}
                                    onChange={handleInputChange}
                                    placeholder="Autor del libro"
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Descripción</label>
                                <textarea
                                    name="description"
                                    value={newBook.description}
                                    onChange={handleInputChange}
                                    placeholder="Descripción del libro"
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Precio (USDC)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newBook.price}
                                    onChange={handleInputChange}
                                    placeholder="Precio en USDC"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-white mb-2">Categoría</label>
                                <select
                                    name="category"
                                    value={newBook.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 bg-[#222222] text-white rounded-lg border border-[#333333] focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPublishModalOpen(false);
                                        setPreviewImage('');
                                    }}
                                    className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold rounded-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all shadow-lg hover:shadow-xl"
                                >
                                    Publicar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}; 