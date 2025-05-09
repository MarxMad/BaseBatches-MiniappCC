"use client";

// Tipos de datos
export interface User {
  address: string;
  balance: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'payment' | 'book' | 'reservation';
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  available: boolean;
}

// Servicios
export class CampusCoinService {
  // Métodos de usuario
  async getUserInfo(address: string): Promise<User> {
    // Simulación de datos del usuario
    return {
      address,
      balance: '1000',
      transactions: []
    };
  }

  // Métodos de libros
  async getBooks(): Promise<Book[]> {
    // Simulación de libros
    return [
      {
        id: '1',
        title: 'Introducción a la Blockchain',
        author: 'Satoshi Nakamoto',
        price: '50',
        available: true
      },
      {
        id: '2',
        title: 'Smart Contracts 101',
        author: 'Vitalik Buterin',
        price: '45',
        available: true
      }
    ];
  }

  async buyBook(bookId: string): Promise<Transaction> {
    // Simulación de compra
    return {
      id: Math.random().toString(),
      type: 'book',
      amount: '50',
      date: new Date().toISOString(),
      status: 'completed'
    };
  }

  // Métodos de pagos
  async makePayment(amount: string, recipient: string): Promise<Transaction> {
    // Simulación de pago
    return {
      id: Math.random().toString(),
      type: 'payment',
      amount,
      date: new Date().toISOString(),
      status: 'completed'
    };
  }

  // Métodos de reservas
  async reserveBook(bookId: string): Promise<void> {
    // Simulación de reserva
    return;
  }

  async cancelReservation(bookId: string): Promise<void> {
    // Simulación de cancelación
    return;
  }

  // Métodos de grupos sociales
  async joinGroup(groupId: string): Promise<void> {
    // Simulación de unirse a grupo
    return;
  }

  async leaveGroup(groupId: string): Promise<void> {
    // Simulación de salir de grupo
    return;
  }
}

// Instancia global del servicio
export const campusCoinService = new CampusCoinService(); 