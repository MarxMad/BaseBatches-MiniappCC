export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface ExpenseWithCategory extends Expense {
  categoryDetails: Category;
}

export interface GameStats {
  id: string;
  name: string;
  totalGames: number;
  bestScore: number;
  lastPlayed: string;
  achievements: Achievement[];
  history: GameHistory[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface GameHistory {
  date: string;
  score: number;
  duration: number;
  result: 'win' | 'lose' | 'completed';
} 