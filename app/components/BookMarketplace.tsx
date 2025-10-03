"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useContractRead, useAccount, useWaitForTransactionReceipt, useContractWrite } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { ContractWriteResult, ContractWriteParams, UseContractWriteResult } from '../types/contracts';
import { Transaction, TransactionButton, TransactionSponsor, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from "@coinbase/onchainkit/transaction";
// import { getBuyBookCall, getBuyGuideCall, getMintAndListCall } from "../calls";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "../constants/marketplace";
import { uploadFileToPinata } from '../utils/pinataUpload';
import { NFTMintCard } from '@coinbase/onchainkit/nft';
import type { Abi } from 'viem';
import Image from 'next/image';
import { writeContract } from 'wagmi/actions';
import { sepolia } from 'viem/chains';
import { config } from "../config/wagmi";
import { ProofOfDelivery } from './ProofOfDelivery';
import BookCard from './BookCard';
import { ContactScreen } from './ContactScreen';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    price: number | bigint;
    category: string;
    image: string;
    seller: string;
    buyer?: string;
    delivered: boolean;
    rating: number;
    tokenURI: string;
    isAvailable?: boolean;
}

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface Listing {
    seller: string;
    price: bigint;
    sold: boolean;
    buyer: string;
    delivered: boolean;
}

// Estilos base
const techGradient = "bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]";
const glowEffect = "hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all duration-300";
const cardStyle = `${techGradient} rounded-2xl border border-[#333333] backdrop-blur-xl ${glowEffect}`;

function MintNFTCard({ 
  tokenURI, 
  price, 
  imageUrl, 
  onSuccess,
  setBooks,
  onClose 
}: { 
  tokenURI: string, 
  price: string, 
  imageUrl: string, 
  onSuccess: () => void,
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
  onClose: () => void
}) {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Validar y convertir el precio
  const priceInWei = (() => {
    try {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Precio inválido');
      }
      return parseUnits(priceNum.toString(), 18);
    } catch (error) {
      console.error('Error al convertir precio:', error);
      return BigInt(0);
    }
  })();

  const validTokenURI = tokenURI.startsWith('ipfs://') ? tokenURI : `ipfs://${tokenURI}`;

  const { writeContract, isPending, isSuccess, isError, error } = useContractWrite();

  // Obtener el total de libros para asignar el nuevo ID
  const { data: totalBooks } = useContractRead({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
    functionName: 'totalSupply'
  }) as { data: bigint | undefined };

  useEffect(() => {
    if (isSuccess) {
      setTransactionStatus('success');
      toast.success("¡NFT minteado y listado correctamente!");
      
      // Decodificar el tokenURI para obtener los metadatos
      try {
        const base64Data = tokenURI.split(',')[1];
        const metadata = JSON.parse(atob(base64Data));
        
        // Crear el nuevo libro
        const newBook: Book = {
          id: Number(totalBooks || 0),
          title: metadata.name,
          author: metadata.attributes?.find((attr: any) => attr.trait_type === "Autor")?.value || "Anónimo",
          description: metadata.description,
          price: Number(price),
          category: metadata.attributes?.find((attr: any) => attr.trait_type === "Categoría")?.value || "General",
          image: metadata.image,
          seller: address || '',
          rating: 0,
          tokenURI: tokenURI,
          isAvailable: true,
          delivered: false
        };

        // Actualizar el estado de los libros
        setBooks(prevBooks => [...prevBooks, newBook]);
        
        // Esperar un momento antes de cerrar para que el usuario vea el mensaje
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } catch (error) {
        console.error('Error al procesar metadatos:', error);
        toast.error('Error al procesar los metadatos del libro');
      }
    }
  }, [isSuccess, tokenURI, price, address, totalBooks, onSuccess, setBooks]);

  useEffect(() => {
    if (isError) {
      setTransactionStatus('error');
      const errorMessage = error?.message || 'Error desconocido';
      console.error('Error en la transacción:', errorMessage);
      if (errorMessage.includes('user denied')) {
        toast.error('Transacción cancelada por el usuario');
      } else if (errorMessage.includes('network')) {
        toast.error('Error de red. Por favor, verifica tu conexión');
      } else if (errorMessage.includes('insufficient funds')) {
        toast.error('Fondos insuficientes para la transacción');
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    }
  }, [isError, error]);

  if (!isConnected) {
    return (
      <div className="w-full text-center p-4 bg-[#1A1A1A] rounded-lg">
        <p className="text-[#B8B8B8]">Por favor, conecta tu wallet primero</p>
      </div>
    );
  }

  if (!imageUrl) {
  return (
      <div className="w-full text-center p-4 bg-[#1A1A1A] rounded-lg">
        <p className="text-[#B8B8B8]">Por favor, proporciona una imagen válida</p>
      </div>
    );
  }

  if (priceInWei === BigInt(0)) {
    return (
      <div className="w-full text-center p-4 bg-[#1A1A1A] rounded-lg">
        <p className="text-[#B8B8B8]">El precio debe ser mayor a cero</p>
      </div>
    );
  }

  const handleMint = async () => {
    try {
      setIsLoading(true);
      setTransactionStatus('pending');
      console.log('Enviando transacción con:', {
        to: MARKETPLACE_ADDRESS,
        functionName: "mintAndList",
        args: [validTokenURI, priceInWei],
        value: BigInt(0)
      });

      await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'mintAndList',
        args: [validTokenURI, priceInWei],
        value: BigInt(0)
      });
    } catch (error) {
      console.error('Error al mintear:', error);
      toast.error('Error al mintear el NFT');
      setTransactionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {transactionStatus === 'error' && (
      <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-[#FF4444] text-white p-2 rounded-full hover:bg-[#CC3333] transition-colors"
        >
          ✕
      </button>
      )}
      <button
        onClick={transactionStatus === 'error' ? onClose : handleMint}
        disabled={isLoading || isPending}
        className={`w-full px-4 py-2 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
          transactionStatus === 'error' 
            ? 'bg-[#FF4444] text-white hover:bg-[#CC3333]'
            : transactionStatus === 'success'
            ? 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
            : 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FF8C00]'
        }`}
      >
        {isLoading || isPending ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
            Minteando NFT...
          </div>
        ) : transactionStatus === 'error' ? (
          'Cerrar'
        ) : transactionStatus === 'success' ? (
          '¡Minteado Exitoso!'
        ) : (
          'Mintear NFT'
        )}
      </button>
    </div>
  );
}

interface BookMarketplaceProps {
    userDiscount?: number | null;
}

export const BookMarketplace = ({ userDiscount }: BookMarketplaceProps) => {
    const { address } = useAccount();
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [isApproving, setIsApproving] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [showContactScreen, setShowContactScreen] = useState(false);
    const [purchasedBook, setPurchasedBook] = useState<Book | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Función para calcular precio con descuento
    const calculateDiscountedPrice = (originalPrice: number | bigint) => {
        if (!userDiscount) return originalPrice;
        const price = typeof originalPrice === 'bigint' ? Number(originalPrice) : originalPrice;
        const discountAmount = (price * userDiscount) / 100;
        return price - discountAmount;
    };

    // Función para manejar la compra de un libro
    const handleBuyBook = async (bookId: number) => {
        setIsBuying(true);
        try {
            // Aquí iría la lógica de compra
            console.log('Comprando libro:', bookId);
            toast.success('Libro comprado exitosamente');
        } catch (error) {
            console.error('Error al comprar libro:', error);
            toast.error('Error al comprar libro');
        } finally {
            setIsBuying(false);
        }
    };
    
    // Estado para el formulario
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        description: '',
        price: '',
        category: '',
        image: '',
        tokenURI: ''
    });

    // Categorías disponibles - Organizadas por carreras y tipos
    const categories: Category[] = [
        { id: 1, name: 'Ingeniería', icon: '🔧' },
        { id: 2, name: 'Medicina', icon: '⚕️' },
        { id: 3, name: 'Derecho', icon: '⚖️' },
        { id: 4, name: 'Economía', icon: '💰' },
        { id: 5, name: 'Psicología', icon: '🧠' },
        { id: 6, name: 'Arquitectura', icon: '🏗️' },
        { id: 7, name: 'Ciencias', icon: '🔬' },
        { id: 8, name: 'Humanidades', icon: '📚' },
        { id: 9, name: 'Guías de Estudio', icon: '📖' },
        { id: 10, name: 'Exámenes', icon: '📝' },
        { id: 11, name: 'Idiomas', icon: '🌍' },
        { id: 12, name: 'Otros', icon: '📄' }
    ];

    const [showTransaction, setShowTransaction] = useState(false);

    // Crear arrays para los listings y tokenURIs
    const listings = Array.from({ length: 30 }, (_, i) => 
        useContractRead({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'listings',
            args: [i]
        }) as { data: Listing | undefined }
    );

    const tokenURIs = Array.from({ length: 30 }, (_, i) =>
        useContractRead({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'tokenURI',
            args: [i]
        }) as { data: string | undefined }
    );

    // Función para obtener los metadatos de un libro
    const getBookMetadata = async (tokenURI: string) => {
        try {
            console.log('Obteniendo metadatos para:', tokenURI);
            
            // Si el tokenURI contiene datos base64, extraerlos directamente
            if (tokenURI.includes('data:application/json;base64,')) {
                try {
                    const base64Data = tokenURI.split('data:application/json;base64,')[1];
                    const decodedData = atob(base64Data);
                    const metadata = JSON.parse(decodedData);
                    
                    // Asegurarnos de que la URL de la imagen sea accesible
                    if (metadata.image) {
                        // Si la imagen es una URL de IPFS, convertirla a una URL de gateway
                        if (metadata.image.startsWith('ipfs://')) {
                            const ipfsHash = metadata.image.replace('ipfs://', '');
                            metadata.image = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                        }
                    }
                    
                    return metadata;
                } catch (error) {
                    console.error('Error al decodificar base64:', error);
                }
            }
            
            // Limpiar el tokenURI para obtener el hash IPFS
            let ipfsHash = tokenURI;
            
            // Remover prefijos comunes
            if (ipfsHash.startsWith('ipfs://')) {
                ipfsHash = ipfsHash.replace('ipfs://', '');
            }
            
            // Remover URLs completas de gateways
            const gatewayPatterns = [
                'gateway.pinata.cloud/ipfs/',
                'ipfs.io/ipfs/',
                'cloudflare-ipfs.com/ipfs/'
            ];
            
            for (const pattern of gatewayPatterns) {
                if (ipfsHash.includes(pattern)) {
                    ipfsHash = ipfsHash.split(pattern)[1];
                    break;
                }
            }

            // Si no hay hash IPFS válido, devolver objeto por defecto
            if (!ipfsHash || ipfsHash === '') {
                                return {
                                    name: 'Libro NFT',
                                    description: 'Libro NFT en el marketplace',
                    image: 'https://gateway.pinata.cloud/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
                                    attributes: [
                                        {
                                            trait_type: "Autor",
                                            value: "Anónimo"
                                        },
                                        {
                                            trait_type: "Categoría",
                                            value: "General"
                                        }
                                    ]
                                };
            }

            // Lista de gateways con sus respectivos headers
            const gateways = [
                {
                    url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                    headers: {
                        'Accept': 'application/json'
                    }
                },
                {
                    url: `https://ipfs.io/ipfs/${ipfsHash}`,
                    headers: {
                        'Accept': 'application/json'
                    }
                },
                {
                    url: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            ];

            for (const gateway of gateways) {
                try {
                    console.log('Intentando gateway:', gateway.url);
                    const response = await fetch(gateway.url, {
                        method: 'GET',
                        headers: gateway.headers,
                        mode: 'cors'
                    });
                    
                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType?.includes('application/json')) {
                            const metadata = await response.json();
                            
                            // Asegurarnos de que la URL de la imagen sea accesible
                            if (metadata.image) {
                                // Si la imagen es una URL de IPFS, convertirla a una URL de gateway
                                if (metadata.image.startsWith('ipfs://')) {
                                    const imageHash = metadata.image.replace('ipfs://', '');
                                    metadata.image = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
                                }
                            }
                            
                            return metadata;
                            }
                        }
                    } catch (error) {
                    console.log('Error con gateway:', gateway.url, error);
                        continue;
                    }
                }

            // Si no se pudo obtener los metadatos, devolver un objeto por defecto
            return {
                name: 'Libro NFT',
                description: 'Libro NFT en el marketplace',
                image: 'https://gateway.pinata.cloud/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
                attributes: [
                    {
                        trait_type: "Autor",
                        value: "Anónimo"
                    },
                    {
                        trait_type: "Categoría",
                        value: "General"
                    }
                ]
            };
        } catch (error) {
            console.error('Error al obtener metadatos:', error);
            return {
                name: 'Libro NFT',
                description: 'Libro NFT en el marketplace',
                image: 'https://gateway.pinata.cloud/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
                attributes: [
                    {
                        trait_type: "Autor",
                        value: "Anónimo"
                    },
                    {
                        trait_type: "Categoría",
                        value: "General"
                    }
                ]
            };
        }
    };

    // Cargar todos los libros
    useEffect(() => {
        const loadAllBooks = async () => {
            try {
                console.log('Iniciando carga de libros...');
                console.log('Dirección de la wallet conectada:', address);
                const loadedBooks: Book[] = [];
    
                for (let i = 10; i < 30; i++) {
                    // Verificar primero si los hooks existen y tienen datos
                    if (!listings[i] || !tokenURIs[i]) {
                        console.log(`No hay datos para el índice ${i}`);
                        continue;
                    }
    
                    const listing = listings[i].data;
                    const tokenURI = tokenURIs[i].data;
    
                    // Si no hay listing o tokenURI, continuar con el siguiente
                    if (!listing || !tokenURI) {
                        console.log(`Datos incompletos para el índice ${i}:`, { listing, tokenURI });
                        continue;
                    }
    
                    try {
                        // Verificar si el listing es válido (tiene los campos necesarios)
                        if (!listing.seller && !Array.isArray(listing)) {
                            console.log(`Listing inválido para el índice ${i}:`, listing);
                            continue;
                        }
    
                        const sellerAddress = Array.isArray(listing) ? listing[0]?.toString().toLowerCase() : listing.seller?.toLowerCase();
                        const buyerAddress = Array.isArray(listing) ? listing[3]?.toString().toLowerCase() : listing.buyer?.toLowerCase();
                        const delivered = Array.isArray(listing) ? listing[4] : listing.delivered;
                        const userAddress = address?.toLowerCase();
                        
                        // Verificar si tenemos los datos mínimos necesarios
                        if (!sellerAddress) {
                            console.log(`No hay dirección de vendedor para el índice ${i}`);
                            continue;
                        }
    
                        const isOwner = userAddress && (
                            (sellerAddress && userAddress === sellerAddress && !buyerAddress) ||
                            (buyerAddress && userAddress === buyerAddress)
                        );
                        
                        console.log(`Procesando libro ${i}:`, { 
                            listing, 
                            tokenURI,
                            seller: sellerAddress,
                            buyer: buyerAddress,
                            delivered: delivered,
                            userAddress: userAddress,
                            isOwner
                        });
    
                        const metadata = await getBookMetadata(tokenURI);
                        
                        // Verificar si tenemos los metadatos mínimos necesarios
                        if (!metadata || !metadata.name) {
                            console.log(`Metadatos incompletos para el índice ${i}:`, metadata);
                            continue;
                        }
    
                        const rawPrice = Array.isArray(listing) ? listing[1] : (listing?.price ?? 0);
                        
                        loadedBooks.push({
                            id: i,
                            title: metadata.name || '',
                            author: metadata.attributes?.find((attr: any) => attr.trait_type === "Autor")?.value || '',
                            description: metadata.description || '',
                            price: rawPrice,
                            category: metadata.attributes?.find((attr: any) => attr.trait_type === "Categoría")?.value || '',
                            image: metadata.image || '',
                            seller: sellerAddress || '',
                            buyer: buyerAddress,
                            delivered: delivered,
                            rating: 0,
                            tokenURI: tokenURI,
                            isAvailable: !listing.sold
                        });
                    } catch (error) {
                        console.error(`Error al procesar libro ${i}:`, error);
                        continue;
                    }
                }
    
                console.log('Libros cargados:', loadedBooks.map(book => ({
                    id: book.id,
                    title: book.title,
                    seller: book.seller,
                    buyer: book.buyer,
                    delivered: book.delivered,
                    isOwner: address?.toLowerCase() === (book.delivered ? book.buyer?.toLowerCase() : book.seller?.toLowerCase())
                })));
                
                setBooks(loadedBooks);
            } catch (error) {
                console.error('Error al cargar libros:', error);
                toast.error('Error al cargar los libros');
            }
        };
    
        if (listings && tokenURIs) {
            loadAllBooks();
        } 
    }, [listings, tokenURIs, address]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewBook(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Crear una URL temporal para el preview
                const objectUrl = URL.createObjectURL(file);
                setPreviewImage(objectUrl);

                // Sube la imagen a Pinata
                const ipfsUrl = await uploadFileToPinata(file);
                
                // Actualizar el estado con la URL de IPFS
                setNewBook(prev => ({
                    ...prev,
                    image: ipfsUrl
                }));

                // Limpiar la URL temporal
                URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error('Error al subir imagen:', error);
                toast.error('Error al subir la imagen');
                setPreviewImage('');
            }
        }
    };

    const handlePublishBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            toast.error('Por favor, conecta tu wallet primero');
                return;
            }

        if (!newBook.title || !newBook.description || !newBook.price || !newBook.category || !newBook.image) {
            toast.error('Por favor, completa todos los campos requeridos');
                return;
            }

        try {
            // Validar el precio
            const price = Number(newBook.price);
            if (isNaN(price) || price <= 0) {
                toast.error('El precio debe ser un número mayor a cero');
                return;
            }
            
            // Convertir la URL de gateway a formato IPFS si es necesario
            let imageUrl = newBook.image;
            if (imageUrl.includes('gateway.pinata.cloud/ipfs/')) {
                const ipfsHash = imageUrl.split('gateway.pinata.cloud/ipfs/')[1];
                imageUrl = `ipfs://${ipfsHash}`;
            }
            
            // Crear el objeto de metadatos
            const metadata = {
                name: newBook.title,
                description: newBook.description,
                image: imageUrl,
                attributes: [
                    {
                        trait_type: "Autor",
                        value: newBook.author || "Anónimo"
                    },
                    {
                        trait_type: "Categoría",
                        value: newBook.category
                    }
                ]
            };

            // Convertir a JSON y luego a base64
            const metadataString = JSON.stringify(metadata);
            const base64Metadata = btoa(metadataString);
            const tokenURI = `data:application/json;base64,${base64Metadata}`;

            // Actualizar el estado con el tokenURI y el precio
            setNewBook(prev => ({
                ...prev,
                tokenURI,
                price: price.toString()
            }));

            // Mostrar el modal de transacción
            setIsPublishModalOpen(false);
            setShowTransaction(true);
        } catch (error) {
            console.error('Error al publicar libro:', error);
            toast.error('Error al publicar el libro');
        }
    };

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
    const txWait = useWaitForTransactionReceipt({
        hash: txHash,
    });

    /*
    const {
        data: buyData,
        isPending: isBuyPending,
        isSuccess: isBuySuccess,
        isError: isBuyError,
        writeAsync,
        write,
        error: buyError
    } = useContractWrite({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'buy',
    });
    */

    const handlePurchase = async (bookId: number, price: string) => {
        console.log("[handlePurchase] Iniciando función handlePurchase", { bookId, price, address });
        if (!address) {
            console.error("[handlePurchase] Dirección (address) no encontrada.");
            toast.error('Por favor, conecta tu wallet primero');
            return;
        }
        console.log("[handlePurchase] Dirección (address) encontrada, procediendo...");
        
        // Encontrar el libro comprado para mostrar en la pantalla de contacto
        const book = books.find(b => b.id === bookId);
        if (book) {
            setPurchasedBook(book);
        }
        
        try {
            // Pasando 'config' como primer argumento
            const tx = await writeContract(config, {
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                    abi: MARKETPLACE_ABI,
                functionName: 'buy',
                args: [BigInt(bookId)],
                value: parseUnits(price, 18),
            });
            setTxHash(tx);
            toast.success('Transacción enviada. Esperando confirmación...');
        } catch (error) {
            console.error('Error en handlePurchase:', error);
            toast.error('Error al enviar la transacción');
        }
    };

    useEffect(() => {
        if (txWait.isSuccess) {
            toast.success('¡Libro comprado correctamente!');
            // Mostrar pantalla de contacto
            if (purchasedBook) {
                setShowContactScreen(true);
            }
        }
        if (txWait.isError) {
            toast.error('Error al confirmar la transacción');
        }
    }, [txWait.isSuccess, txWait.isError, purchasedBook]);

    return (
        <div className="space-y-8">
            {/* Header del Marketplace */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
                        Marketplace
                    </h2>
                    <p className="text-[#B8B8B8] mt-2">Descubre y comparte libros académicos</p>
                </div>
                    <button
                    onClick={() => setIsPublishModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-xl 
                                 hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium shadow-lg 
                                 hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    <span>Publicar Libro</span>
                    </button>
            </div>

            {/* Barra de búsqueda y filtros mejorada */}
            <div className="space-y-4">
                {/* Barra de búsqueda principal */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Buscar libros, autores, materias..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-5 py-4 bg-[#1A1A1A] text-white rounded-xl border border-[#333333] 
                                     focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700] 
                                     transition-all pl-12 text-lg"
                        />
                        <svg className="w-6 h-6 text-[#666666] absolute left-4 top-1/2 transform -translate-y-1/2" 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-5 py-4 bg-[#1A1A1A] text-white rounded-xl border border-[#333333] 
                                 focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700] 
                                 transition-all appearance-none cursor-pointer w-full md:w-64 text-lg"
                    >
                        <option value="all">🔍 Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Categorías rápidas - Estilo Amazon */}
                <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#333333]">
                    <h3 className="text-lg font-semibold text-white mb-3">Categorías populares</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 8).map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedCategory === cat.id.toString()
                                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
                                        : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] hover:text-white'
                                }`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid de Libros - Diseño Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {books
                    .filter(book => {
                        // Filtro por categoría
                        if (selectedCategory !== 'all') {
                            const categoryName = categories.find(cat => cat.id.toString() === selectedCategory)?.name;
                            return book.category === categoryName;
                        }
                        return true;
                    })
                    .filter(book => {
                        // Filtro por búsqueda
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                            book.title.toLowerCase().includes(query) ||
                            book.author.toLowerCase().includes(query) ||
                            book.category.toLowerCase().includes(query) ||
                            book.description.toLowerCase().includes(query)
                        );
                    })
                    .map((book) => {
                    const userAddress = address?.toLowerCase();
                    const sellerAddress = book.seller?.toLowerCase();
                    const buyerAddress = book.buyer?.toLowerCase();
                    const delivered = book.delivered;
                    
                    // Determinar el estado del libro
                    const getBookStatus = () => {
                        // Considerar buyerAddress válido solo si no es 0x0 y es diferente al seller
                        const isValidBuyer = buyerAddress && buyerAddress !== '0x0000000000000000000000000000000000000000' && buyerAddress !== sellerAddress;
                        if (userAddress === sellerAddress) {
                            if (!isValidBuyer) {
                                return { isOwner: true, status: 'Tu Libro (En Venta)', color: 'from-[#FFD700] to-[#FFA500]' };
                            } else if (!delivered) {
                                return { isOwner: true, status: 'Tu Libro (Pendiente de Entrega)', color: 'from-[#FF8C00] to-[#FF4500]' };
                            } else {
                                return { isOwner: true, status: 'Tu Libro (Vendido)', color: 'from-[#4CAF50] to-[#45a049]' };
                            }
                        }
                        if (userAddress === buyerAddress && isValidBuyer) {
                            if (delivered) {
                                return { isOwner: true, status: 'Tu Libro (Entregado)', color: 'from-[#4CAF50] to-[#45a049]' };
                            } else {
                                return { isOwner: true, status: 'Tu Libro (Esperando Entrega)', color: 'from-[#FF8C00] to-[#FF4500]' };
                            }
                        }
                        if (isValidBuyer) {
                            return { isOwner: false, status: 'Vendido', color: 'from-[#FF4444] to-[#CC3333]' };
                        }
                        return { isOwner: false, status: 'Disponible', color: 'from-[#FFD700] to-[#FFA500]' };
                    };

                    const bookStatus = getBookStatus();
                    
                    console.log(`Estado final del libro ${book.id}:`, {
                        status: bookStatus.status,
                        isOwner: bookStatus.isOwner,
                        color: bookStatus.color
                    });

                    // Conversión robusta del precio de Wei a ETH (siempre usando BigInt para evitar pérdida de precisión)
                    let priceInEth: number | undefined = undefined;
                    try {
                        if (typeof book.price === 'bigint') {
                            priceInEth = Number(book.price) / 1e18;
                        } else if (typeof book.price === 'string') {
                            priceInEth = Number(BigInt(book.price)) / 1e18;
                        } else if (typeof book.price === 'number' && !isNaN(book.price)) {
                            priceInEth = Number(BigInt(book.price.toString())) / 1e18;
                        }
                    } catch {
                        priceInEth = undefined;
                    }
                    const priceLabel = (typeof priceInEth === 'number' && !isNaN(priceInEth))
                        ? `${priceInEth.toFixed(4)} ETH`
                        : 'Precio no disponible';
                    
                    // Determinar si el libro está disponible para comprar
                    const isValidBuyer = book.buyer &&
                        book.buyer !== '0x0000000000000000000000000000000000000000' &&
                        book.buyer !== book.seller;
                    const isAvailable = !isValidBuyer && book.isAvailable !== false;
                    
                    // LOG ADICIONAL PARA DEPURAR CONDICIONES DE RENDERIZADO DEL BOTÓN
                    console.log(`[Render Libro ID: ${book.id}] Condiciones:`, {
                        isWalletConnected: !!address,
                        isOwner: bookStatus.isOwner,
                        isBookAvailable: isAvailable,
                        bookStatusObject: bookStatus // Para ver el status y color exacto
                    });

                    return (
                        <div key={book.id} className={`${cardStyle} group relative overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
                            {/* Imagen del libro */}
                            <div className="relative h-64 overflow-hidden rounded-t-2xl">
                                <img 
                                    src={book.image} 
                                    alt={book.title}
                                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    {priceLabel}
                                </div>
                                {/* Badge de categoría */}
                                <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                    {book.category}
                                </div>
                            </div>
                            {/* Contenido */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#FFD700] transition-colors">{book.title}</h3>
                                    <p className="text-[#B8B8B8] text-sm mb-2">Por <span className="text-white font-medium">{book.author}</span></p>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[#FFD700] text-sm font-medium bg-[#FFD700]/10 px-2 py-1 rounded-full">
                                            {book.category}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[#999999] text-sm line-clamp-3 leading-relaxed">{book.description}</p>
                                {/* Botones de acción */}
                                <div className="flex flex-col space-y-2">
                                    {!address ? (
                                        <p className="text-center text-[#B8B8B8]">Conecta tu wallet para comprar</p>
                                    ) : bookStatus.isOwner ? (
                                        bookStatus.status === 'Tu Libro (Esperando Entrega)' && userAddress === buyerAddress && !delivered ? (
                                            <div className="flex flex-col items-center">
                                                <span className={`w-full px-4 py-3 bg-gradient-to-r ${bookStatus.color} text-white rounded-lg text-sm font-medium text-center mb-2`}>
                                                    {bookStatus.status}
                                                </span>
                                                <ProofOfDelivery orderId={book.id} onProofSubmitted={() => window.location.reload()} />
                                            </div>
                                        ) : (
                                            <span className={`w-full px-4 py-3 bg-gradient-to-r ${bookStatus.color} text-white rounded-lg text-sm font-medium text-center`}>
                                                {bookStatus.status}
                                            </span>
                                        )
                                    ) : isAvailable ? (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (book && typeof priceInEth === 'number' && !isNaN(priceInEth)) {
                                                    await handlePurchase(book.id, priceInEth.toString());
                                                } else {
                                                    toast.error('Datos inválidos para la compra.');
                                                }
                                            }}
                                            className="w-full px-4 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-[#00FF00] to-[#00CC00] hover:from-[#00CC00] hover:to-[#00AA00] text-black"
                                        >
                                            {(typeof priceInEth === 'number' && !isNaN(priceInEth))
                                                ? `Comprar por ${priceInEth.toFixed(4)} ETH`
                                                : 'No disponible'}
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <span className="w-full px-4 py-3 bg-gradient-to-r from-[#FF4444] to-[#CC3333] text-white rounded-lg text-sm font-medium text-center">
                                                Vendido
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Estado vacío */}
            {books.filter(book => {
                if (selectedCategory !== 'all') {
                    const categoryName = categories.find(cat => cat.id.toString() === selectedCategory)?.name;
                    return book.category === categoryName;
                }
                return true;
            }).filter(book => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                    book.title.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query) ||
                    book.category.toLowerCase().includes(query) ||
                    book.description.toLowerCase().includes(query)
                );
            }).length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {searchQuery || selectedCategory !== 'all' ? 'No se encontraron resultados' : 'No hay libros disponibles'}
                    </h3>
                    <p className="text-[#B8B8B8] text-center max-w-md">
                        {searchQuery || selectedCategory !== 'all' 
                            ? 'Intenta con otros términos de búsqueda o cambia la categoría.' 
                            : 'No se encontraron libros que coincidan con tu búsqueda. Intenta con otros términos o publica el primer libro.'
                        }
                    </p>
                </div>
            )}

            {/* Modal de Publicación de Libro */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] rounded-lg w-full max-w-md border border-[#333333] shadow-2xl">
                        <div className="p-6 border-b border-[#333333]">
                            <h3 className="text-xl font-bold text-white">Publicar Nuevo Libro</h3>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto p-6">
                            <form onSubmit={handlePublishBook} className="relative">
                                <div className="space-y-4">
                                    {/* Imagen del libro */}
                                    <div>
                                        <label className="block text-white mb-2">Imagen del Libro</label>
                                        <div className="flex flex-col items-center space-y-4">
                                            {previewImage ? (
                                                <div className="relative w-full h-48">
                                                    <Image
                                                        src={previewImage}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover rounded-lg border border-[#333333]"
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
                                                        className="absolute top-2 right-2 bg-[#FF4444] text-white p-1 rounded-full hover:bg-[#CC3333] transition-colors z-10"
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
                                        <label className="block text-white mb-2">Precio (ETH)</label>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            name="price"
                                            value={newBook.price}
                                            onChange={handleInputChange}
                                            placeholder="Precio en ETH"
                                            required
                                            min="0"
                                            step="0.00001"
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
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-[#333333] bg-[#1A1A1A]">
                                    <div className="flex gap-4 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsPublishModalOpen(false);
                                                setPreviewImage('');
                                                setShowTransaction(false);
                                            }}
                                            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                                <button
                                            type="submit"
                                            className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg hover:from-[#FFA500] hover:to-[#FF8C00] transition-all font-medium"
                                        >
                                            Publicar Libro
                                                </button>
                                            </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Transacción */}
            {showTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] rounded-lg w-full max-w-md border border-[#333333] shadow-2xl">
                        <div className="p-6 border-b border-[#333333]">
                            <h3 className="text-xl font-bold text-white">Confirmar Publicación</h3>
                        </div>
                        <div className="p-6">
                            <MintNFTCard 
                                tokenURI={newBook.tokenURI || ''} 
                                price={newBook.price} 
                                imageUrl={previewImage} 
                                setBooks={setBooks}
                                onSuccess={() => {
                                                setIsPublishModalOpen(false);
                                                setShowTransaction(false);
                                                setNewBook({
                                                    title: '',
                                                    author: '',
                                                    description: '',
                                                    price: '',
                                                    category: '',
                                        image: '',
                                        tokenURI: ''
                                                });
                                                setPreviewImage('');
                                }} 
                                onClose={() => {
                                                setShowTransaction(false);
                                                setNewBook({
                                                    title: '',
                                                    author: '',
                                                    description: '',
                                                    price: '',
                                                    category: '',
                                        image: '',
                                        tokenURI: ''
                                                });
                                                setPreviewImage('');
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Pantalla de Contacto */}
            {purchasedBook && (
                <ContactScreen
                    isOpen={showContactScreen}
                    onClose={() => {
                        setShowContactScreen(false);
                        setPurchasedBook(null);
                    }}
                    bookTitle={purchasedBook.title}
                    sellerAddress={purchasedBook.seller}
                    buyerAddress={address || ''}
                    onContactSent={(message, contactInfo) => {
                        toast.success('¡Mensaje enviado! El vendedor se pondrá en contacto contigo pronto.');
                        console.log('Mensaje enviado:', { message, contactInfo });
                    }}
                />
            )}
        </div>
    );
};