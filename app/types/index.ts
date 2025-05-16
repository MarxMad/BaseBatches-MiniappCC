export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  date: string;
  description?: string;
}

export interface User {
  address: string;
  fid?: string;
  balance: string;
  transactions: Transaction[];
}

export interface GameStats {
  id: string;
  gameId: string;
  score: number;
  duration: number;
  result: 'win' | 'lose' | 'completed';
  date: string;
} 