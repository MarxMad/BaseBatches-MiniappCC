"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { campusCoinService, User, Transaction, Book } from '../services/api';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

type AppContextType = {
  user: User | null;
  transactions: Transaction[];
  books: Book[];
  loading: boolean;
  error: string | null;
  buyBook: (bookId: string) => Promise<void>;
  makePayment: (amount: string, recipient: string) => Promise<void>;
  reserveBook: (bookId: string) => Promise<void>;
  cancelReservation: (bookId: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { context } = useMiniKit();

  useEffect(() => {
    // Cargar datos iniciales
    loadInitialData();
  }, []);

  // Efecto para sincronizar el estado del usuario con la wallet de OnchainKit
  useEffect(() => {
    if (context?.client?.address) {
      loadUserData(context.client.address);
    } else {
      setUser(null);
    }
  }, [context?.client?.address]);

  const loadUserData = async (walletAddress: string) => {
    try {
      setLoading(true);
      const userInfo = await campusCoinService.getUserInfo(walletAddress);
      setUser(userInfo);
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError('Error al cargar datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const books = await campusCoinService.getBooks();
      setBooks(books);
    } catch (err) {
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const buyBook = async (bookId: string) => {
    try {
      setLoading(true);
      const transaction = await campusCoinService.buyBook(bookId);
      setTransactions([transaction, ...transactions]);
    } catch (err) {
      setError('Error al comprar el libro');
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async (amount: string, recipient: string) => {
    try {
      setLoading(true);
      const transaction = await campusCoinService.makePayment(amount, recipient);
      setTransactions([transaction, ...transactions]);
    } catch (err) {
      setError('Error al realizar el pago');
    } finally {
      setLoading(false);
    }
  };

  const reserveBook = async (bookId: string) => {
    try {
      setLoading(true);
      await campusCoinService.reserveBook(bookId);
    } catch (err) {
      setError('Error al reservar el libro');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (bookId: string) => {
    try {
      setLoading(true);
      await campusCoinService.cancelReservation(bookId);
    } catch (err) {
      setError('Error al cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      setLoading(true);
      await campusCoinService.joinGroup(groupId);
    } catch (err) {
      setError('Error al unirse al grupo');
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      setLoading(true);
      await campusCoinService.leaveGroup(groupId);
    } catch (err) {
      setError('Error al salir del grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        books,
        loading,
        error,
        buyBook,
        makePayment,
        reserveBook,
        cancelReservation,
        joinGroup,
        leaveGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
} 