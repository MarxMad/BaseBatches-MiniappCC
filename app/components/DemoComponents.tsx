"use client";

import { type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Transaction as TransactionReact,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { useApp } from "../context/AppContext";
import { TransactionChart } from './TransactionChart';
import { QRCodeSVG } from 'qrcode.react';
import { getAIResponse } from '../services/aiService';

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  id?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
  id,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      id={id}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

type FeaturesProps = {
  setActiveTab: (tab: string) => void;
};

export function Features({ setActiveTab }: FeaturesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Key Features">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Minimalistic and beautiful UI design
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Responsive layout for all devices
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Dark mode support
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              OnchainKit integration
            </span>
          </li>
        </ul>
        <Button variant="outline" onClick={() => setActiveTab("home")}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
}

type HomeProps = {
  setActiveTab: (tab: string) => void;
};

type PaymentCardProps = {
  title: string;
  amount: string;
  merchant: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

function PaymentCard({ title, amount, merchant, status, date }: PaymentCardProps) {
  const statusColors = {
    pending: 'text-yellow-500',
    completed: 'text-green-500',
    failed: 'text-red-500'
  };

  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-[var(--app-foreground-muted)]">{merchant}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{amount}</p>
          <p className={`text-sm ${statusColors[status]}`}>{status}</p>
        </div>
      </div>
      <p className="text-xs text-[var(--app-foreground-muted)] mt-2">{date}</p>
    </Card>
  );
}

type QRScannerProps = {
  onScan: (data: string) => void;
}

function QRScanner({ onScan }: QRScannerProps) {
  return (
    <Card title="Escanear QR">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-[var(--app-foreground-muted)]">Área de escaneo QR</p>
        </div>
        <Button onClick={() => onScan('demo-qr-data')}>
          Escanear QR
        </Button>
      </div>
    </Card>
  );
}

type BalanceCardProps = {
  balance: string;
  currency: string;
}

function BalanceCard({ balance, currency }: BalanceCardProps) {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Balance</h3>
          <p className="text-sm text-[var(--app-foreground-muted)]">{currency}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{balance}</p>
        </div>
      </div>
    </Card>
  );
}

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  price: string;
  condition: 'nuevo' | 'usado' | 'excelente';
  imageUrl?: string;
  rating: number;
  reviews: number;
  onCompare?: () => void;
  onBuy?: () => void;
}

function BookCard({ id, title, author, price, condition, imageUrl, rating, reviews, onCompare, onBuy }: BookCardProps) {
  const conditionColors = {
    nuevo: 'text-green-500',
    usado: 'text-yellow-500',
    excelente: 'text-blue-500'
  };

  return (
    <Card className="mb-4">
      <div className="flex">
        <div className="w-24 h-32 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <p className="text-[var(--app-foreground-muted)] text-xs">Sin imagen</p>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-[var(--app-foreground-muted)]">{author}</p>
          <p className="text-xl font-bold mt-2">{price}</p>
          <p className={`text-sm ${conditionColors[condition]}`}>
            Condición: {condition}
          </p>
          <div className="flex space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={onCompare}>
              Comparar
            </Button>
            <Button variant="primary" size="sm" onClick={onBuy}>
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

type CompareBooksProps = {
  books: BookCardProps[];
  onClose: () => void;
}

function CompareBooks({ books, onClose }: CompareBooksProps) {
  return (
    <Card title="Comparar Libros">
      <div className="space-y-4">
        {books.map((book, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{book.title}</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">{book.author}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{book.price}</p>
              <p className={`text-sm ${book.condition === 'nuevo' ? 'text-green-500' : book.condition === 'usado' ? 'text-yellow-500' : 'text-blue-500'}`}>
                {book.condition}
              </p>
            </div>
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Card>
  );
}

type SearchBarProps = {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
}

function SearchBar({ onSearch, onFilter }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");

  return (
    <Card className="mb-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="flex-1 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
          />
          <Button variant="primary" size="sm">
            Buscar
          </Button>
        </div>
        <div className="flex space-x-2">
        <Button
            variant={selectedFilter === "todos" ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedFilter("todos");
              onFilter("todos");
            }}
          >
            Todos
        </Button>
          <Button
            variant={selectedFilter === "nuevo" ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedFilter("nuevo");
              onFilter("nuevo");
            }}
          >
            Nuevos
          </Button>
          <Button
            variant={selectedFilter === "usado" ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedFilter("usado");
              onFilter("usado");
            }}
          >
            Usados
          </Button>
          <Button
            variant={selectedFilter === "excelente" ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedFilter("excelente");
              onFilter("excelente");
            }}
          >
            Excelente
          </Button>
        </div>
      </div>
      </Card>
  );
}

type RatingProps = {
  rating: number;
  reviews: number;
}

function Rating({ rating, reviews }: RatingProps) {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-[var(--app-foreground-muted)]">
        ({reviews} reseñas)
      </span>
    </div>
  );
}

type MyBooksProps = {
  books: BookCardProps[];
}

function MyBooks({ books }: MyBooksProps) {
  return (
    <Card title="Mis Libros">
      <div className="space-y-4">
        {books.map((book, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <p className="text-[var(--app-foreground-muted)] text-xs">Sin imagen</p>
                )}
              </div>
              <div>
                <h4 className="font-medium">{book.title}</h4>
                <p className="text-sm text-[var(--app-foreground-muted)]">{book.author}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

type NotificationProps = {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

function Notification({ title, message, type, timestamp }: NotificationProps) {
  const typeColors = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`p-3 rounded-lg ${typeColors[type]} mb-2`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        <span className="text-xs opacity-70">{timestamp}</span>
      </div>
    </div>
  );
}

type UserProfileProps = {
  name: string;
  email: string;
  studentId: string;
  balance: string;
  onLogout: () => void;
}

function UserProfile({ name, email, studentId, balance, onLogout }: UserProfileProps) {
  return (
    <Card title="Mi Perfil">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[var(--app-accent)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-[var(--app-foreground-muted)]">{email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--app-foreground-muted)]">ID Estudiante</p>
            <p className="font-medium">{studentId}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--app-foreground-muted)]">Balance</p>
            <p className="font-medium">{balance}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </Card>
  );
}

type AppHeaderProps = {
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  notificationsCount: number;
}

function AppHeader({ onProfileClick, onNotificationsClick, notificationsCount }: AppHeaderProps) {
  return (
    <header className="bg-[var(--app-background)] border-b border-[var(--app-card-border)]">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center overflow-hidden border border-[#2A2A2A]">
              <img
                src="/LogoCC.svg"
                alt="CampusCoin"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-xl font-bold text-white';
                  fallback.textContent = 'CC';
                  target.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <h1 className="text-xl font-bold">CampusCoin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-full hover:bg-[#2A2A2A] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--app-foreground)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificationsCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#0052FF] text-white text-xs rounded-full flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={onProfileClick}
              className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center text-white hover:bg-[#3A3A3A] transition-colors"
            >
              U
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

type AppFooterProps = {
  onAboutClick: () => void;
  onHelpClick: () => void;
  onTermsClick: () => void;
}

function AppFooter({ onAboutClick, onHelpClick, onTermsClick }: AppFooterProps) {
  return (
    <footer className="bg-[var(--app-background)] border-t border-[var(--app-card-border)]">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-4">
            <button
              onClick={onAboutClick}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
            >
              Acerca de
            </button>
            <button
              onClick={onHelpClick}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
            >
              Ayuda
            </button>
            <button
              onClick={onTermsClick}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
            >
              Términos
            </button>
          </div>
          <div className="text-[var(--app-foreground-muted)]">
            © 2024 CampusCoin
          </div>
        </div>
      </div>
    </footer>
  );
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

function TransactionCard() {
  const { address } = useAccount();

  // Example transaction call - sending 0 ETH to self
  const calls = useMemo(() => address
    ? [
        {
          to: address,
          data: "0x" as `0x${string}`,
          value: BigInt(0),
        },
      ]
    : [], [address]);

  const sendNotification = useNotification();

  const handleSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;

    console.log(`Transaction successful: ${transactionHash}`);

    await sendNotification({
      title: "Congratulations!",
      body: `You sent your a transaction, ${transactionHash}!`,
    });
  }, [sendNotification]);

  return (
    <Card title="Make Your First Transaction">
      <div className="space-y-4">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Experience the power of seamless sponsored transactions with{" "}
          <a
            href="https://onchainkit.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0052FF] hover:underline"
          >
            OnchainKit
          </a>
          .
        </p>

        <div className="flex flex-col items-center">
          {address ? (
            <TransactionReact
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="text-white text-md" />
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </TransactionReact>
          ) : (
            <p className="text-yellow-400 text-sm text-center mt-2">
              Connect your wallet to send a transaction
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
}

function MetricCard({ title, value, change, isPositive, icon }: MetricCardProps) {
  return (
    <Card className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--app-foreground-muted)]">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </p>
        </div>
        <div className="w-12 h-12 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

type QuickActionProps = {
  title: string;
  icon: ReactNode;
  onClick: () => void;
}

function QuickAction({ title, icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-[var(--app-card-bg)] rounded-xl hover:bg-[var(--app-accent-light)] transition-colors"
    >
      <div className="w-10 h-10 bg-[var(--app-accent)] rounded-full flex items-center justify-center text-white mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
}

type RecentActivityProps = {
  type: 'payment' | 'book' | 'achievement';
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
}

function RecentActivity({ type, title, description, amount, timestamp }: RecentActivityProps) {
  const icons = {
    payment: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    book: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    achievement: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-[var(--app-accent-light)] rounded-lg transition-colors">
      <div className="w-8 h-8 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h4 className="font-medium truncate">{title}</h4>
          {amount && <span className="font-medium">{amount}</span>}
        </div>
        <p className="text-sm text-[var(--app-foreground-muted)] truncate">{description}</p>
        <p className="text-xs text-[var(--app-foreground-muted)] mt-1">{timestamp}</p>
      </div>
    </div>
  );
}

type AchievementProps = {
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: React.ReactNode;
  isCompleted: boolean;
  reward: {
    type: "tokens" | "badge" | "discount";
    amount?: number;
    badgeName?: string;
    discountPercentage?: number;
  };
  onClaim: () => Promise<void>;
};

function Achievement({ title, description, progress, total, icon, isCompleted, reward, onClaim }: AchievementProps) {
  const progressPercentage = (progress / total) * 100;
  const isClaimable = progress >= total && !isCompleted;

  return (
    <Card className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-green-100' : isClaimable ? 'bg-yellow-100' : 'bg-[var(--app-accent-light)]'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-medium truncate">{title}</h4>
          {isCompleted && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Completado
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--app-foreground-muted)] truncate">{description}</p>
        <div className="mt-2">
          <div className="h-1 bg-[var(--app-accent-light)] rounded-full">
            <div
              className={`h-full rounded-full ${
                isCompleted ? 'bg-green-500' : isClaimable ? 'bg-yellow-500' : 'bg-[var(--app-accent)]'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {progress}/{total}
            </p>
            {isClaimable && (
              <Button
                variant="primary"
                size="sm"
                onClick={onClaim}
                className="text-xs"
              >
                Reclamar Recompensa
              </Button>
            )}
          </div>
        </div>
        {isCompleted && (
          <div className="mt-2 p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-green-800">
              Recompensa: {reward.type === 'tokens' && `${reward.amount} CC`}
              {reward.type === 'badge' && `Badge: ${reward.badgeName}`}
              {reward.type === 'discount' && `${reward.discountPercentage}% de descuento`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

type MerchantCardProps = {
  name: string;
  category: string;
  rating: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function MerchantCard({ name, category, rating, isFavorite, onToggleFavorite }: MerchantCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-lg flex items-center justify-center">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-[var(--app-foreground-muted)]">{category}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
        </div>
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-[var(--app-foreground-muted)]'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

type GlobalSearchProps = {
  onSearch: (query: string) => void;
}

function GlobalSearch({ onSearch }: GlobalSearchProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar en CampusCoin..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="w-full px-4 py-2 pl-10 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
      />
      <svg
        className="w-5 h-5 text-[var(--app-foreground-muted)] absolute left-3 top-2.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
      </svg>
    </div>
  );
}

type ChallengeProps = {
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  deadline: string;
}

function Challenge({ title, description, reward, progress, total, deadline }: ChallengeProps) {
  return (
    <Card className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-medium truncate">{title}</h4>
          <span className="text-sm text-[var(--app-accent)]">{reward}</span>
        </div>
        <p className="text-sm text-[var(--app-foreground-muted)] truncate">{description}</p>
        <div className="mt-2">
          <div className="h-1 bg-[var(--app-accent-light)] rounded-full">
            <div
              className="h-full bg-[var(--app-accent)] rounded-full"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-[var(--app-foreground-muted)]">
              {progress}/{total}
            </p>
            <p className="text-xs text-[var(--app-foreground-muted)]">
              Vence: {deadline}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

type SocialGroupProps = {
  id: string;
  name: string;
  members: number;
  description: string;
  category: string;
  lastActivity: string;
  imageUrl: string;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onViewDetails: () => void;
};

function SocialGroup({ 
  id, 
  name, 
  members, 
  description, 
  category,
  lastActivity,
  imageUrl,
  isMember, 
  onJoin, 
  onLeave,
  onViewDetails 
}: SocialGroupProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-lg flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[var(--app-accent)]">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{name}</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">{category}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isMember ? 'bg-green-100 text-green-800' : 'bg-[var(--app-accent-light)] text-[var(--app-accent)]'
            }`}>
              {isMember ? 'Miembro' : 'Únete'}
            </span>
          </div>
          <p className="text-sm text-[var(--app-foreground-muted)] mt-1">{description}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-[var(--app-foreground-muted)] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs text-[var(--app-foreground-muted)]">{members} miembros</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-[var(--app-foreground-muted)] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[var(--app-foreground-muted)]">Última actividad: {lastActivity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
        >
          Ver Detalles
        </Button>
        {isMember ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeave}
          >
            Salir
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onJoin}
          >
            Unirse
          </Button>
        )}
      </div>
    </Card>
  );
}

type BookReservationProps = {
  title: string;
  author: string;
  pickupDate: string;
  returnDate: string;
  status: 'pending' | 'active' | 'completed';
  onCancel?: () => void;
}

function BookReservation({ title, author, pickupDate, returnDate, status, onCancel }: BookReservationProps) {
  const statusColors = {
    pending: 'text-yellow-500',
    active: 'text-green-500',
    completed: 'text-[var(--app-foreground-muted)]'
  };

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-[var(--app-foreground-muted)]">{author}</p>
        <div className="mt-2">
          <p className="text-xs text-[var(--app-foreground-muted)]">Recoger: {pickupDate}</p>
          <p className="text-xs text-[var(--app-foreground-muted)]">Devolver: {returnDate}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${statusColors[status]}`}>
          {status === 'pending' ? 'Pendiente' : status === 'active' ? 'Activo' : 'Completado'}
        </span>
        {status === 'pending' && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  );
}

type SplitPaymentProps = {
  title: string;
  amount: string;
  participants: number;
  paid: number;
  onPay: () => void;
}

function SplitPayment({ title, amount, participants, paid, onPay }: SplitPaymentProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-[var(--app-foreground-muted)]">{amount}</p>
        <p className="text-xs text-[var(--app-foreground-muted)]">
          {paid}/{participants} han pagado
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={onPay}>
        Pagar
      </Button>
    </Card>
  );
}

type BadgeProps = {
  title: string;
  description: string;
  icon: ReactNode;
  isUnlocked: boolean;
}

function Badge({ title, description, icon, isUnlocked }: BadgeProps) {
  return (
    <Card className={`flex items-center space-x-4 ${!isUnlocked && 'opacity-50'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-accent-light)]'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-[var(--app-foreground-muted)]">{description}</p>
      </div>
    </Card>
  );
}

type ChatMessageProps = {
  sender: string;
  message: string;
  timestamp: string;
  isSelf: boolean;
  isAI?: boolean;
  avatar?: string;
}

function ChatMessage({ sender, message, timestamp, isSelf, isAI, avatar }: ChatMessageProps) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isSelf ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
          isAI ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-[var(--app-accent)]'
        }`}>
          {avatar ? (
            <img src={avatar} alt={sender} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-white font-bold">
              {isAI ? 'AI' : sender.charAt(0)}
            </span>
          )}
        </div>
        <div className={`mx-2 ${isSelf ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isAI ? 'text-blue-600' : 'text-[var(--app-foreground)]'
            }`}>
              {sender}
            </span>
            {isAI && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Asistente IA
              </span>
            )}
          </div>
          <div className={`mt-1 p-3 rounded-lg ${
            isSelf 
              ? 'bg-[var(--app-accent)] text-white' 
              : isAI 
                ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                : 'bg-[var(--app-background-muted)] text-[var(--app-foreground)] border border-[var(--app-border)]'
          }`}>
            <p className="text-sm leading-relaxed">{message}</p>
            <span className={`text-xs mt-1 block ${
              isSelf 
                ? 'text-white/80' 
                : isAI 
                  ? 'text-blue-700/80' 
                  : 'text-[var(--app-foreground-muted)]'
            }`}>
              {timestamp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t border-[var(--app-border)] bg-[var(--app-background)]">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="flex-1 p-2 rounded-lg border border-[var(--app-border)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] bg-[var(--app-background)] text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!message.trim() || isLoading}
        className="bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Enviar'
        )}
      </Button>
    </form>
  );
}

type BookReviewProps = {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

function BookReview({ user, rating, comment, date }: BookReviewProps) {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium">{user}</h4>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <span className="text-xs text-[var(--app-foreground-muted)]">{date}</span>
      </div>
      <p className="text-sm text-[var(--app-foreground-muted)]">{comment}</p>
    </Card>
  );
}

type BudgetCardProps = {
  category: string;
  spent: number;
  limit: number;
  icon: ReactNode;
}

function BudgetCard({ category, spent, limit, icon }: BudgetCardProps) {
  const percentage = (spent / limit) * 100;
  const isOverLimit = percentage > 100;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center">
            {icon}
          </div>
          <h4 className="font-medium">{category}</h4>
        </div>
        <div className="text-right">
          <p className="font-medium">${spent} / ${limit}</p>
          <p className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-green-500'}`}>
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="h-2 bg-[var(--app-accent-light)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-[var(--app-accent)]'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </Card>
  );
}

type TokenComparisonProps = {
  token: {
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
  };
  comparisonTokens: Array<{
    name: string;
    symbol: string;
    price: number;
    change24h: number;
  }>;
}

function TokenComparison({ token, comparisonTokens }: TokenComparisonProps) {
  return (
    <Card title="Comparación de Tokens">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{token.name}</h4>
                <p className="text-sm text-[var(--app-foreground-muted)]">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${token.price.toFixed(2)}</p>
                <p className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.change24h >= 0 ? '↑' : '↓'} {Math.abs(token.change24h).toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--app-foreground-muted)]">Volumen 24h</p>
                <p className="font-medium">${(token.volume24h / 1000000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="text-sm text-[var(--app-foreground-muted)]">Capitalización</p>
                <p className="font-medium">${(token.marketCap / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium">Comparación con otros tokens</h5>
            <div className="space-y-3">
              {comparisonTokens.map((comparisonToken, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--app-card-bg)] rounded-lg">
                  <div>
                    <p className="font-medium">{comparisonToken.name}</p>
                    <p className="text-sm text-[var(--app-foreground-muted)]">{comparisonToken.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${comparisonToken.price.toFixed(2)}</p>
                    <p className={`text-sm ${comparisonToken.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparisonToken.change24h >= 0 ? '↑' : '↓'} {Math.abs(comparisonToken.change24h).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-medium">Rendimiento Histórico</h5>
          <div className="h-64 bg-[var(--app-card-bg)] rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <Button variant="ghost" size="sm">1D</Button>
                <Button variant="ghost" size="sm">1S</Button>
                <Button variant="ghost" size="sm">1M</Button>
                <Button variant="primary" size="sm">1A</Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--app-foreground-muted)]">Cambio total</p>
                <p className="text-green-500 font-medium">+45.2%</p>
              </div>
            </div>
            {/* Aquí iría el gráfico de rendimiento */}
            <div className="h-40 bg-[var(--app-background)] rounded-lg flex items-center justify-center">
              <p className="text-[var(--app-foreground-muted)]">Gráfico de rendimiento</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-medium">Información Adicional</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--app-card-bg)] rounded-lg">
              <p className="text-sm text-[var(--app-foreground-muted)]">Suministro Total</p>
              <p className="font-medium">1,000,000,000 CC</p>
            </div>
            <div className="p-4 bg-[var(--app-card-bg)] rounded-lg">
              <p className="text-sm text-[var(--app-foreground-muted)]">En Circulación</p>
              <p className="font-medium">500,000,000 CC</p>
            </div>
            <div className="p-4 bg-[var(--app-card-bg)] rounded-lg">
              <p className="text-sm text-[var(--app-foreground-muted)]">Tasa de Quema</p>
              <p className="font-medium">2% mensual</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

type WelcomeScreenProps = {
  onGetStarted: () => void;
}

function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[var(--app-background)] to-[var(--app-accent-light)] p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-32 h-32 bg-[var(--app-accent)] rounded-2xl flex items-center justify-center mx-auto overflow-hidden">
            <img 
              src="/LogoCC.svg" 
              alt="CampusCoin Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si la imagen no se carga
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.className = 'text-4xl font-bold text-white';
                fallback.textContent = 'CC';
                target.parentNode?.appendChild(fallback);
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-[var(--app-foreground)]">
            CampusCoin
          </h1>
          <p className="text-lg text-[var(--app-foreground-muted)]">
            Tu billetera digital universitaria
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-[var(--app-card-bg)] rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Pagos Rápidos</h3>
                  <p className="text-sm text-[var(--app-foreground-muted)]">Paga en cualquier comercio del campus</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--app-card-bg)] rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Biblioteca Digital</h3>
                  <p className="text-sm text-[var(--app-foreground-muted)]">Accede a libros y materiales</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--app-card-bg)] rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--app-accent-light)] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Comunidad</h3>
                  <p className="text-sm text-[var(--app-foreground-muted)]">Conecta con otros estudiantes</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onGetStarted}
          >
            Comenzar
          </Button>
        </div>
      </div>
    </div>
  );
}

type PaymentOptionsProps = {
  onClose: () => void;
  onPay: (amount: number, method: string) => void;
}

function PaymentOptions({ onClose, onPay }: PaymentOptionsProps) {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const budgetCategories = [
    {
      id: "libros",
      name: "Libros",
      icon: "📚",
      merchants: [
        { id: "libreria_central", name: "Librería Central" },
        { id: "libreria_digital", name: "Librería Digital" }
      ]
    },
    {
      id: "alimentos",
      name: "Alimentos",
      icon: "🍽️",
      merchants: [
        { id: "cafeteria", name: "Cafetería Central" },
        { id: "snack_bar", name: "Snack Bar" },
        { id: "comedor", name: "Comedor Universitario" }
      ]
    },
    {
      id: "transporte",
      name: "Transporte",
      icon: "🚌",
      merchants: [
        { id: "bus_campus", name: "Bus Universitario" },
        { id: "estacionamiento", name: "Estacionamiento" }
      ]
    },
    {
      id: "entretenimiento",
      name: "Entretenimiento",
      icon: "🎮",
      merchants: [
        { id: "gimnasio", name: "Gimnasio" },
        { id: "eventos", name: "Eventos Campus" }
      ]
    }
  ];

  const handlePay = async () => {
    if (!isConnected) {
      alert("Por favor, conecta tu wallet primero");
      return;
    }

    if (!amount || !selectedMethod || !selectedCategory || !selectedMerchant) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await onPay(Number(amount), selectedMethod);
      onClose();
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar el pago");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategoryData = budgetCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-[var(--app-background)] rounded-lg p-6 w-full max-w-md border border-[var(--app-card-border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--app-foreground)]">Realizar Pago</h2>
          <button onClick={onClose} className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Selección de Categoría */}
          <div>
            <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">
              Categoría de Gasto
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedMerchant("");
              }}
              className="w-full px-3 py-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
            >
              <option value="" className="text-[var(--app-foreground-muted)]">Selecciona una categoría</option>
              {budgetCategories.map((category) => (
                <option key={category.id} value={category.id} className="text-[var(--app-foreground)]">
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Comerciante (solo si hay categoría seleccionada) */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">
                Comerciante
              </label>
              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
              >
                <option value="" className="text-[var(--app-foreground-muted)]">Selecciona un comerciante</option>
                {selectedCategoryData?.merchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id} className="text-[var(--app-foreground)]">
                    {merchant.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">
              Monto a Pagar
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
              />
              <span className="absolute right-3 top-2 text-[var(--app-foreground-muted)]">CC</span>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-[var(--app-foreground-muted)] mb-1">
              Método de Pago
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
            >
              <option value="" className="text-[var(--app-foreground-muted)]">Selecciona un método</option>
              <option value="wallet" className="text-[var(--app-foreground)]">Wallet CampusCoin</option>
              <option value="usdc" className="text-[var(--app-foreground)]">USDC</option>
            </select>
          </div>

          {/* Información de la Transacción */}
          {selectedCategory && amount && (
            <div className="bg-[var(--app-accent-light)] p-4 rounded-lg border border-[var(--app-card-border)]">
              <h3 className="font-medium text-[var(--app-accent)] mb-2">Resumen del Pago</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Categoría:</span>
                  <span className="text-[var(--app-foreground)]">
                    {selectedCategoryData?.icon} {selectedCategoryData?.name}
                  </span>
                </div>
                {selectedMerchant && (
                  <div className="flex justify-between">
                    <span className="text-[var(--app-foreground-muted)]">Comerciante:</span>
                    <span className="text-[var(--app-foreground)]">
                      {selectedCategoryData?.merchants.find(m => m.id === selectedMerchant)?.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Monto:</span>
                  <span className="text-[var(--app-foreground)]">{amount} CC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--app-foreground-muted)]">Método:</span>
                  <span className="text-[var(--app-foreground)]">
                    {selectedMethod === 'wallet' ? 'Wallet CampusCoin' : 'USDC'}
                  </span>
                </div>
                {isConnected && (
                  <div className="flex justify-between">
                    <span className="text-[var(--app-foreground-muted)]">Wallet:</span>
                    <span className="text-[var(--app-foreground)]">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex space-x-2">
            <button
              onClick={handlePay}
              disabled={!amount || !selectedMethod || !selectedCategory || !selectedMerchant || !isConnected || isLoading}
              className="flex-1 px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Procesando..." : "Pagar"}
            </button>
            <button
              onClick={() => setShowQR(true)}
              disabled={!amount || !selectedMethod || !selectedCategory || !selectedMerchant || !isConnected}
              className="px-4 py-2 bg-[var(--app-gray)] text-[var(--app-foreground)] rounded-lg hover:bg-[var(--app-gray-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--app-card-border)]"
            >
              QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type TutorialStep = {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
};

type TutorialProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      target: "balance-section",
      title: "Tu Balance",
      description: "Aquí puedes ver tu saldo actual en CampusCoin y el historial de transacciones.",
      position: "bottom"
    },
    {
      target: "quick-actions",
      title: "Acciones Rápidas",
      description: "Accede rápidamente a las funciones más utilizadas como escanear QR, ver libros o unirte a grupos.",
      position: "top"
    },
    {
      target: "payment-button",
      title: "Realizar Pagos",
      description: "Haz clic aquí para realizar pagos a otros usuarios o comercios del campus.",
      position: "left"
    },
    {
      target: "transaction-chart",
      title: "Historial de Transacciones",
      description: "Visualiza todas tus transacciones y movimientos en un gráfico interactivo.",
      position: "top"
    },
    {
      target: "achievements",
      title: "Logros y Recompensas",
      description: "Gana badges y recompensas por usar la aplicación y completar desafíos.",
      position: "bottom"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative">
        <div className="absolute animate-bounce-slow"
             style={{
               top: tutorialSteps[currentStep].position === 'bottom' ? '100%' : 
                    tutorialSteps[currentStep].position === 'top' ? '-100%' : '0',
               left: tutorialSteps[currentStep].position === 'right' ? '100%' : 
                     tutorialSteps[currentStep].position === 'left' ? '-100%' : '0',
             }}>
          <Card className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{tutorialSteps[currentStep].title}</h3>
                <span className="text-sm text-[var(--app-foreground-muted)]">
                  {currentStep + 1}/{tutorialSteps.length}
                </span>
              </div>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                {tutorialSteps[currentStep].description}
              </p>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

type SectionType = "dashboard" | "books" | "groups" | "achievements" | "chat" | "group-details" | "balance" | "scan" | "profile" | "mybooks" | "payments" | "transactions";

export function Home({ setActiveTab }: HomeProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const { 
    user, 
    transactions, 
    books: apiBooks, 
    loading, 
    error,
    connectWallet,
    buyBook,
    makePayment,
    reserveBook,
    cancelReservation,
    joinGroup,
    leaveGroup
  } = useApp();

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [comparingBooks, setComparingBooks] = useState<BookCardProps[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessageProps[]>([
    {
      sender: "Asistente Campus",
      message: "¡Hola! Soy tu asistente de IA del campus. ¿En qué puedo ayudarte hoy?",
      timestamp: "Hace 1 minuto",
      isSelf: false,
      isAI: true
    }
  ]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const reviews: BookReviewProps[] = [
    {
      user: "María García",
      rating: 5,
      comment: "Excelente libro, muy completo y bien explicado. Me ayudó mucho en mi curso de programación.",
      date: "2024-04-28"
    },
    {
      user: "Carlos López",
      rating: 4,
      comment: "Buen contenido, pero algunas explicaciones podrían ser más claras. Aún así, muy útil para el curso.",
      date: "2024-04-27"
    },
    {
      user: "Ana Martínez",
      rating: 5,
      comment: "El mejor libro que he encontrado sobre el tema. Los ejemplos son muy prácticos y fáciles de seguir.",
      date: "2024-04-26"
    },
    {
      user: "Juan Pérez",
      rating: 4,
      comment: "Contenido muy completo, aunque el precio es un poco elevado. Vale la pena si lo necesitas para tus estudios.",
      date: "2024-04-25"
    }
  ];

  useEffect(() => {
    if (error) {
      setNotifications([{
        title: "Error",
        message: error,
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  }, [error]);

  useEffect(() => {
    // Mostrar el tutorial cuando el usuario cierre la pantalla de bienvenida
    if (!showWelcome && !localStorage.getItem('tutorialCompleted')) {
      setShowTutorial(true);
    }
  }, [showWelcome]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const handleBuyBook = async (book: BookCardProps) => {
    try {
      await buyBook(book.id);
      setNotifications([{
        title: "Compra Exitosa",
        message: `Has comprado ${book.title}`,
        type: "success",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (err) {
      setNotifications([{
        title: "Error en la Compra",
        message: "No se pudo completar la compra",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const handleReserveBook = async (book: BookCardProps) => {
    try {
      await reserveBook(book.id);
      setNotifications([{
        title: "Reserva Exitosa",
        message: `Has reservado ${book.title}`,
        type: "success",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (err) {
      setNotifications([{
        title: "Error en la Reserva",
        message: "No se pudo completar la reserva",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const handleJoinGroup = async (group: SocialGroupProps) => {
    try {
      await joinGroup(group.id);
      setNotifications([{
        title: "¡Bienvenido al grupo!",
        message: `Te has unido a ${group.name}`,
        type: "success",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (error) {
      setNotifications([{
        title: "Error al unirse",
        message: "No se pudo unir al grupo",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const handleLeaveGroup = async (group: SocialGroupProps) => {
    try {
      await leaveGroup(group.id);
      setNotifications([{
        title: "Has dejado el grupo",
        message: `Has salido de ${group.name}`,
        type: "info",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (error) {
      setNotifications([{
        title: "Error al salir",
        message: "No se pudo salir del grupo",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const handleViewGroupDetails = (group: SocialGroupProps) => {
    // Aquí iría la lógica para mostrar los detalles del grupo
    setActiveSection('group-details');
    // También podríamos abrir un modal con más información
  };

  const books: BookCardProps[] = [
    {
      id: '1',
      title: "Introducción a la Programación",
      author: "Juan Pérez",
      price: "$25.00",
      condition: "nuevo",
      imageUrl: "https://via.placeholder.com/150",
      rating: 4.5,
      reviews: 12
    },
    {
      id: '2',
      title: "Matemáticas Avanzadas",
      author: "María García",
      price: "$30.00",
      condition: "excelente",
      imageUrl: "https://via.placeholder.com/150",
      rating: 4.8,
      reviews: 8
    },
    {
      id: '3',
      title: "Historia del Arte",
      author: "Carlos López",
      price: "$20.00",
      condition: "usado",
      imageUrl: "https://via.placeholder.com/150",
      rating: 4.2,
      reviews: 15
    }
  ];

  const filteredBooks = books.filter((book: BookCardProps) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "todos" || book.condition === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCompare = (book: BookCardProps) => {
    setComparingBooks([...comparingBooks, book]);
    if (comparingBooks.length === 1) {
      setShowCompare(true);
    }
  };

  const metrics = [
    {
      title: "Balance Total",
      value: "$1,250.00",
      change: "5.2%",
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Gastos Mensuales",
      value: "$450.00",
      change: "2.1%",
      isPositive: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Libros Comprados",
      value: "12",
      change: "3",
      isPositive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  const quickActions = [
    {
      title: "Escanear",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      onClick: () => setActiveSection('scan')
    },
    {
      title: "Libros",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      onClick: () => setActiveSection('books')
    },
    {
      title: "Grupos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      onClick: () => setActiveSection('groups')
    }
  ];

  const activities = [
    {
      type: 'payment' as const,
      title: 'Cafetería Central',
      description: 'Compra de café y sándwich',
      timestamp: 'Hace 2 horas',
      amount: '$5.00'
    },
    {
      type: 'book' as const,
      title: 'Introducción a la Programación',
      description: 'Compra de libro',
      timestamp: 'Ayer',
      amount: '$25.00'
    },
    {
      type: 'achievement' as const,
      title: 'Primera Compra',
      description: '¡Felicidades! Has completado tu primera compra',
      timestamp: 'Hace 3 días'
    }
  ];

  const achievements = [
    {
      title: 'Comprador Frecuente',
      description: 'Realiza 10 compras en el campus',
      progress: 7,
      total: 10,
      icon: (
        <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      isCompleted: false,
      reward: {
        type: 'tokens',
        amount: 100
      }
    },
    {
      title: 'Explorador de Libros',
      description: 'Compra 5 libros diferentes',
      progress: 3,
      total: 5,
      icon: (
        <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      isCompleted: false,
      reward: {
        type: 'badge',
        badgeName: 'Lector Ávido'
      }
    },
    {
      title: 'Primer Pago',
      description: 'Realiza tu primera compra',
      progress: 1,
      total: 1,
      icon: (
        <svg className="w-6 h-6 text-[var(--app-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      isCompleted: true,
      reward: {
        type: 'discount',
        discountPercentage: 10
      }
    }
  ];

  const merchants = [
    {
      name: 'Cafetería Central',
      category: 'Alimentos y Bebidas',
      rating: 4.5,
      isFavorite: true
    },
    {
      name: 'Librería Universitaria',
      category: 'Libros y Materiales',
      rating: 4.8,
      isFavorite: false
    },
    {
      name: 'Papelería Express',
      category: 'Materiales Escolares',
      rating: 4.2,
      isFavorite: true
    }
  ];

  const challenges = [
    {
      title: "Comprador Frecuente",
      description: "Realiza 5 compras esta semana",
      reward: "100 puntos",
      progress: 3,
      total: 5,
      deadline: "2 días"
    },
    {
      title: "Explorador de Libros",
      description: "Compra 3 libros diferentes",
      reward: "50 puntos",
      progress: 1,
      total: 3,
      deadline: "5 días"
    }
  ];

  const socialGroups = [
    {
      id: "1",
      name: "Programación Avanzada",
      members: 25,
      description: "Grupo de estudio de programación avanzada y desarrollo de software",
      category: "Tecnología",
      lastActivity: "Hace 2 horas",
      imageUrl: "https://via.placeholder.com/150",
      isMember: true
    },
    {
      id: "2",
      name: "Matemáticas Discretas",
      members: 18,
      description: "Grupo de estudio de matemáticas discretas y teoría de grafos",
      category: "Matemáticas",
      lastActivity: "Hace 1 día",
      imageUrl: "https://via.placeholder.com/150",
      isMember: false
    },
    {
      id: "3",
      name: "Club de Lectura",
      members: 32,
      description: "Comparte y discute tus libros favoritos con otros estudiantes",
      category: "Literatura",
      lastActivity: "Hace 3 horas",
      imageUrl: "https://via.placeholder.com/150",
      isMember: false
    }
  ];

  const reservations = [
    {
      title: "Introducción a la Programación",
      author: "Juan Pérez",
      pickupDate: "2024-05-01",
      returnDate: "2024-05-15",
      status: "pending" as const
    },
    {
      title: "Matemáticas Avanzadas",
      author: "María García",
      pickupDate: "2024-04-20",
      returnDate: "2024-05-04",
      status: "active" as const
    }
  ];

  const splitPayments = [
    {
      title: "Cena de Grupo",
      amount: "$50.00",
      participants: 5,
      paid: 3
    },
    {
      title: "Materiales de Estudio",
      amount: "$30.00",
      participants: 3,
      paid: 1
    }
  ];

  const badges = [
    {
      title: "Primera Compra",
      description: "Realiza tu primera compra en el campus",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      isUnlocked: true
    },
    {
      title: "Lector Ávido",
      description: "Compra 10 libros diferentes",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      isUnlocked: false
    }
  ];

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario
    setChatMessages(prev => [...prev, {
      sender: "Tú",
      message,
      timestamp: new Date().toLocaleTimeString(),
      isSelf: true
    }]);

    // Obtener respuesta de IA
    setIsLoadingAI(true);
    try {
      const aiResponse = await getAIResponse(message);

      setChatMessages(prev => [...prev, {
        sender: "Asistente Campus",
        message: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        isSelf: false,
        isAI: true
      }]);
    } catch (error) {
      console.error('Error en el chat:', error);
      setNotifications([{
        title: "Error en el chat",
        message: "No se pudo obtener respuesta del asistente",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePayment = async (amount: number, method: string) => {
    try {
      setPaymentAmount(amount);
      setPaymentMethod(method);
      setShowPaymentOptions(false);
      
      // Mostrar notificación de pago exitoso
      setNotifications([{
        title: "Pago Exitoso",
        message: `Has realizado un pago de $${amount} con ${method}`,
        type: "success",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (error) {
      setNotifications([{
        title: "Error en el Pago",
        message: "No se pudo completar el pago",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
  };

  const handleClaimReward = async (achievement: typeof achievements[0]) => {
    try {
      // Aquí iría la lógica para reclamar la recompensa
      setNotifications([{
        title: "¡Recompensa Reclamada!",
        message: `Has recibido ${achievement.reward.type === 'tokens' ? `${achievement.reward.amount} CC` : 
                 achievement.reward.type === 'badge' ? `el badge ${achievement.reward.badgeName}` : 
                 `un ${achievement.reward.discountPercentage}% de descuento`}`,
        type: "success",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    } catch (error) {
      setNotifications([{
        title: "Error al Reclamar",
        message: "No se pudo reclamar la recompensa",
        type: "error",
        timestamp: new Date().toISOString()
      }, ...notifications]);
    }
  };

  const budgets: BudgetCardProps[] = [
    {
      category: "Libros",
      spent: 150,
      limit: 200,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      category: "Alimentos",
      spent: 250,
      limit: 300,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      category: "Transporte",
      spent: 80,
      limit: 150,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      category: "Entretenimiento",
      spent: 100,
      limit: 200,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const tokenData = {
    name: "CampusCoin",
    symbol: "CC",
    price: 1.25,
    change24h: 5.2,
    volume24h: 2500000,
    marketCap: 625000000
  };

  const comparisonTokens = [
    {
      name: "USDC",
      symbol: "USDC",
      price: 1.00,
      change24h: 0.1
    },
    {
      name: "USDT",
      symbol: "USDT",
      price: 1.00,
      change24h: 0.2
    },
    {
      name: "DAI",
      symbol: "DAI",
      price: 1.00,
      change24h: 0.3
    }
  ];

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        onProfileClick={() => handleSectionChange('profile')}
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        notificationsCount={notifications.length}
      />

      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-6">
          <GlobalSearch onSearch={setSearchQuery} />

          <Card title="CampusCoin">
            <div className="flex space-x-4 mb-4 overflow-x-auto pb-2">
              <Button
                variant={activeSection === 'dashboard' ? 'primary' : 'ghost'}
                onClick={() => handleSectionChange('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                id="payment-button"
                variant="primary"
                onClick={() => setShowPaymentOptions(true)}
                className={showTutorial ? 'tutorial-highlight' : ''}
              >
                Realizar Pago
              </Button>
              <Button
                variant={activeSection === 'scan' ? 'primary' : 'ghost'}
                onClick={() => handleSectionChange('scan')}
              >
                Escanear
              </Button>
              <Button
                variant={activeSection === 'balance' ? 'primary' : 'ghost'}
                onClick={() => handleSectionChange('balance')}
              >
                Balance
              </Button>
              <Button
                variant={activeSection === 'books' ? 'primary' : 'ghost'}
                onClick={() => handleSectionChange('books')}
              >
                Libros
              </Button>
              <Button
                variant={activeSection === 'mybooks' ? 'primary' : 'ghost'}
                onClick={() => handleSectionChange('mybooks')}
              >
                Mis Libros
              </Button>
            </div>

            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div 
                  id="balance-section" 
                  className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showTutorial ? 'tutorial-highlight' : ''}`}
                >
                  {metrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                  ))}
                </div>

                <div 
                  id="quick-actions" 
                  className={`grid grid-cols-3 gap-2 ${showTutorial ? 'tutorial-highlight' : ''}`}
                >
                  {quickActions.map((action, index) => (
                    <QuickAction key={index} {...action} />
                  ))}
                </div>

                <div 
                  id="transaction-chart"
                  className={showTutorial ? 'tutorial-highlight' : ''}
                >
                  <TransactionChart transactions={transactions} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="Actividades Recientes">
                    <div className="space-y-2">
                      {activities.map((activity, index) => (
                        <RecentActivity key={index} {...activity} />
                      ))}
                    </div>
                  </Card>

                  <Card title="Logros y Desafíos">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--app-foreground-muted)]">Logros Desbloqueados</h3>
                        <span className="text-xs bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-1 rounded-full">
                          {achievements.filter(a => a.isCompleted).length}/{achievements.length}
                        </span>
                      </div>

                      {/* Logros */}
                      {achievements.map((achievement, index) => (
                        <div key={index} className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-card-border)]">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              achievement.isCompleted 
                                ? 'bg-[var(--app-accent)] text-white' 
                                : 'bg-[var(--app-accent-light)] text-[var(--app-accent)]'
                            }`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-[var(--app-foreground)] truncate">{achievement.title}</h4>
                                {achievement.isCompleted ? (
                                  <span className="text-xs bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-0.5 rounded-full ml-2">
                                    Completado
                                  </span>
                                ) : (
                                  achievement.progress >= achievement.total && (
                                    <span className="text-xs bg-[var(--app-accent)] text-white px-2 py-0.5 rounded-full ml-2 animate-pulse">
                                      ¡Listo para reclamar!
                                    </span>
                                  )
                                )}
                              </div>
                              <p className="text-sm text-[var(--app-foreground-muted)] truncate">{achievement.description}</p>
                              <div className="mt-2">
                                <div className="h-1 bg-[var(--app-accent-light)] rounded-full">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      achievement.isCompleted 
                                        ? 'bg-[var(--app-accent)]' 
                                        : achievement.progress >= achievement.total
                                          ? 'bg-[var(--app-accent)] animate-pulse'
                                          : 'bg-[var(--app-accent-hover)]'
                                    }`}
                                    style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="text-xs text-[var(--app-foreground-muted)]">
                                    {achievement.progress}/{achievement.total}
                                  </p>
                                  {achievement.reward && (
                                    <p className="text-xs text-[var(--app-accent)]">
                                      {achievement.reward.type === 'tokens' && `${achievement.reward.amount} CC`}
                                      {achievement.reward.type === 'badge' && `Badge: ${achievement.reward.badgeName}`}
                                      {achievement.reward.type === 'discount' && `${achievement.reward.discountPercentage}% descuento`}
                                    </p>
                                  )}
                                </div>
                                {achievement.progress >= achievement.total && !achievement.isCompleted && (
                                  <button
                                    onClick={() => handleClaimReward(achievement)}
                                    className="mt-3 w-full px-4 py-2 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                                  >
                                    <span>🎁</span>
                                    <span>Reclamar Recompensa</span>
                                  </button>
                                )}
                                {achievement.isCompleted && (
                                  <div className="mt-3 p-2 bg-[var(--app-accent-light)] rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[var(--app-accent)]">🏆</span>
                                      <p className="text-sm text-[var(--app-accent)]">
                                        Recompensa reclamada
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Separador */}
                      <div className="border-t border-[var(--app-card-border)] my-4"></div>

                      {/* Desafíos Activos */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--app-foreground-muted)]">Desafíos Activos</h3>
                        <span className="text-xs bg-[var(--app-accent-light)] text-[var(--app-accent)] px-2 py-1 rounded-full">
                          {challenges.length} activos
                        </span>
                      </div>

                      {challenges.map((challenge, index) => (
                        <div key={index} className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-card-border)]">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-[var(--app-foreground)]">{challenge.title}</h4>
                              <p className="text-sm text-[var(--app-foreground-muted)]">{challenge.description}</p>
                            </div>
                            <span className="text-[var(--app-accent)] text-sm font-medium ml-2">
                              {challenge.reward}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="h-1 bg-[var(--app-accent-light)] rounded-full">
                              <div
                                className="h-full bg-[var(--app-accent)] rounded-full"
                                style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-[var(--app-foreground-muted)]">
                                {challenge.progress}/{challenge.total}
                              </p>
                              <p className="text-xs text-[var(--app-foreground-muted)]">
                                Vence: {challenge.deadline}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Resumen de Recompensas */}
                      <div className="mt-4 p-4 bg-[var(--app-accent-light)] rounded-lg">
                        <h4 className="font-medium text-[var(--app-accent)] mb-3">Resumen de Recompensas</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-[var(--app-foreground-muted)]">Tokens Ganados</p>
                            <p className="text-lg font-medium text-[var(--app-accent)]">
                              {achievements.reduce((sum, a) => sum + (a.isCompleted && a.reward.type === 'tokens' ? a.reward.amount || 0 : 0), 0)} CC
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[var(--app-foreground-muted)]">Badges Obtenidos</p>
                            <p className="text-lg font-medium text-[var(--app-accent)]">
                              {achievements.filter(a => a.isCompleted && a.reward.type === 'badge').length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[var(--app-foreground-muted)]">Desafíos Completados</p>
                            <p className="text-lg font-medium text-[var(--app-accent)]">
                              {achievements.filter(a => a.isCompleted).length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[var(--app-foreground-muted)]">Descuentos Activos</p>
                            <p className="text-lg font-medium text-[var(--app-accent)]">
                              {achievements.filter(a => a.isCompleted && a.reward.type === 'discount').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="CampusCoin Agent">
                    <div className="h-[400px] overflow-y-auto p-4">
                      {chatMessages.map((message, index) => (
                        <ChatMessage key={index} {...message} />
                      ))}
                    </div>
                    <ChatInput onSend={handleSendMessage} isLoading={isLoadingAI} />
                  </Card>

                  

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BudgetSection
                      onUpdateBudget={(category, newLimit) => {
                        // Aquí iría la lógica para actualizar el límite de una categoría
                        console.log(`Actualizando límite de ${category} a ${newLimit}`);
                      }}
                      onAddCategory={(category, limit, icon) => {
                        // Aquí iría la lógica para agregar una nueva categoría
                        console.log(`Nueva categoría: ${category} con límite ${limit} e ícono ${icon}`);
                      }}
                      onDeleteCategory={(category) => {
                        // Aquí iría la lógica para eliminar una categoría
                        console.log(`Eliminando categoría: ${category}`);
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <TokenComparison 
                      token={tokenData}
                      comparisonTokens={comparisonTokens}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'payments' && (
              <div>
                <PaymentCard
                  title="Cafetería Central"
                  amount="$5.00"
                  merchant="Cafetería Central"
                  status="completed"
                  date="2024-04-28 10:30"
                />
                <PaymentCard
                  title="Librería Universitaria"
                  amount="$25.00"
                  merchant="Librería U"
                  status="pending"
                  date="2024-04-28 11:15"
                />
              </div>
            )}

            {activeSection === 'scan' && (
              <QRScanner onScan={(data) => console.log('QR Scanned:', data)} />
            )}

            {activeSection === 'balance' && (
              <BalanceSection />
            )}

            {activeSection === 'books' && (
              <div>
                <SearchBar
                  onSearch={setSearchQuery}
                  onFilter={setSelectedFilter}
                />
                {filteredBooks.map((book, index) => (
                  <BookCard
                    key={index}
                    {...book}
                    onCompare={() => handleCompare(book)}
                    onBuy={() => handleBuyBook(book)}
                  />
                ))}
              </div>
            )}

            {activeSection === 'mybooks' && (
              <MyBooks books={books.filter(book => book.condition === "usado")} />
            )}

            {activeSection === 'profile' && (
              <UserProfile
                name="Usuario Ejemplo"
                email="usuario@ejemplo.com"
                studentId="20240001"
                balance="$100.00"
                onLogout={() => console.log('Logout')}
              />
            )}
          </Card>
        </div>
      </main>

      <Tutorial isOpen={showTutorial} onClose={handleTutorialClose} />

      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <PaymentOptions
            onClose={() => setShowPaymentOptions(false)}
            onPay={handlePayment}
          />
        </div>
      )}

      <AppFooter
        onAboutClick={() => console.log('About clicked')}
        onHelpClick={() => console.log('Help clicked')}
        onTermsClick={() => console.log('Terms clicked')}
      />

      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Notificaciones</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <Notification key={index} {...notification} />
              ))
            ) : (
              <p className="text-center text-gray-500">No hay notificaciones</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type SectionType = "dashboard" | "books" | "groups" | "achievements" | "chat" | "group-details" | "balance" | "scan" | "profile" | "mybooks" | "payments" | "transactions";

function BalanceSection() {
  const { transactions } = useApp();
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(100.00);
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("month");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotification();

  const handleTransaction = async (value: string) => {
    try {
      const tx = await TransactionReact({
        value
      });
      return tx;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };

  const handleDeposit = async () => {
    if (!isConnected) {
      notify({
        title: "Error",
        body: "Por favor, conecta tu wallet primero"
      });
      return;
    }

    if (!depositAmount || Number(depositAmount) <= 0) {
      notify({
        title: "Error",
        body: "Por favor, ingresa un monto válido"
      });
      return;
    }

    setIsLoading(true);
    try {
      const amount = Number(depositAmount);
      await handleTransaction(amount.toString());
      
      setBalance(prev => prev + amount);
      notify({
        title: "Éxito",
        body: `Depósito exitoso de ${amount} CC desde ${address?.slice(0, 6)}...${address?.slice(-4)}`
      });
      setShowDepositModal(false);
      setDepositAmount("");
    } catch (error) {
      notify({
        title: "Error",
        body: "Error al procesar el depósito"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      notify({
        title: "Error",
        body: "Por favor, conecta tu wallet primero"
      });
      return;
    }

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      notify({
        title: "Error",
        body: "Por favor, ingresa un monto válido"
      });
      return;
    }

    if (!withdrawAddress || !withdrawAddress.startsWith("0x") || withdrawAddress.length !== 42) {
      notify({
        title: "Error",
        body: "Por favor, ingresa una dirección de wallet válida"
      });
      return;
    }

    const amount = Number(withdrawAmount);
    if (amount > balance) {
      notify({
        title: "Error",
        body: "Saldo insuficiente"
      });
      return;
    }

    setIsLoading(true);
    try {
      const txResult = await TransactionReact({
        data: "0x",
        value: "0"
      });

      setBalance(prev => prev - amount);
      notify({
        title: "Éxito",
        body: `Retiro exitoso de ${amount} CC a ${withdrawAddress.slice(0, 6)}...${withdrawAddress.slice(-4)}`
      });
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
    } catch (error) {
      notify({
        title: "Error",
        body: "Error al procesar el retiro"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    const now = new Date();
    switch (selectedPeriod) {
      case "day":
        return txDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      case "month":
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      case "year":
        return txDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Sección de Balance Principal */}
      <div className="bg-[#1A1A1A] rounded-xl p-6 shadow-sm border border-[#2A2A2A]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Tu Billetera CampusCoin</h2>
            <p className="text-sm text-[#8A8A8A]">Gestiona tus fondos y tokens</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0047E0] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected}
            >
              {isConnected ? "Depositar" : "Conectar Wallet"}
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-[#3A3A3A]"
              disabled={!isConnected}
            >
              {isConnected ? "Retirar" : "Conectar Wallet"}
            </button>
          </div>
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          {balance.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
        </div>
        <div className="text-sm text-[#8A8A8A]">
          {isConnected ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#0052FF] rounded-full"></span>
                <span>Wallet conectada: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <div className="mt-1">
                Última actualización: {new Date().toLocaleString()}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Conecta tu wallet para gestionar tus fondos</span>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-[#2A2A2A]">
          <h3 className="font-medium text-white mb-2">Acciones Rápidas</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('payments')}
              className="w-full px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0047E0] transition-colors font-medium text-sm flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Realizar Pago</span>
            </button>
            <button
              onClick={() => navigate('scan')}
              className="w-full px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium text-sm flex items-center justify-center space-x-2 border border-[#3A3A3A]"
            >
              <span>📱</span>
              <span>Escanear QR</span>
            </button>
          </div>
        </div>

        {/* Sección de Transacciones Recientes */}
        <div className="md:col-span-2 bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-[#2A2A2A]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-white">Transacciones Recientes</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as "day" | "week" | "month" | "year")}
              className="px-3 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="day">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>
          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx, index) => (
              <div key={index} className="flex justify-between items-center p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-white">{tx.title}</p>
                  <p className="text-sm text-[#8A8A8A]">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.amount?.startsWith('-') ? 'text-red-500' : 'text-[#0052FF]'}`}>
                    {tx.amount}
                  </p>
                  <p className="text-sm text-[#8A8A8A]">{tx.status}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setActiveTab('transactions')}
              className="w-full px-4 py-2 text-[#0052FF] hover:text-[#0047E0] font-medium text-sm"
            >
              Ver todas las transacciones
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Depósito */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#1A1A1A] p-6 rounded-xl w-96 border border-[#2A2A2A]">
            <h3 className="text-xl font-semibold mb-4 text-white">Depositar Fondos</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8A8A8A] mb-1">
                  Monto a depositar
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div className="bg-[#2A2A2A] p-3 rounded-lg border border-[#3A3A3A]">
                <p className="text-sm text-white font-medium">Información de depósito</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-[#8A8A8A]">
                    Wallet de origen: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No conectada"}
                  </p>
                  <p className="text-xs text-[#8A8A8A]">
                    Contrato de destino: 0x... (Contrato de CampusCoin)
                  </p>
                  <p className="text-xs text-[#8A8A8A]">
                    Red: Sepolia Testnet
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount("");
                }}
                className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium border border-[#3A3A3A]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeposit}
                disabled={isLoading || !isConnected}
                className="px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0047E0] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Procesando..." : "Depositar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Retiro */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#1A1A1A] p-6 rounded-xl w-96 border border-[#2A2A2A]">
            <h3 className="text-xl font-semibold mb-4 text-white">Retirar Fondos</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8A8A8A] mb-1">
                  Monto a retirar
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8A8A8A] mb-1">
                  Dirección de destino
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
                <p className="text-xs text-[#8A8A8A] mt-1">
                  Ingresa la dirección de la wallet donde quieres recibir los fondos
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                  setWithdrawAddress("");
                }}
                className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium border border-[#3A3A3A]"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isLoading}
                className="px-4 py-2 bg-[#0052FF] text-white rounded-lg hover:bg-[#0047E0] transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Procesando..." : "Retirar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type BudgetSectionProps = {
  onUpdateBudget: (category: string, newLimit: number) => void;
  onAddCategory: (category: string, limit: number, icon: string) => void;
  onDeleteCategory: (category: string) => void;
}

function BudgetSection({ onUpdateBudget, onAddCategory, onDeleteCategory }: BudgetSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💰");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState("");
  const [localBudgets, setLocalBudgets] = useState([
    {
      category: "Libros",
      spent: 150,
      limit: 200,
      icon: "📚"
    },
    {
      category: "Alimentos",
      spent: 250,
      limit: 300,
      icon: "🍽️"
    },
    {
      category: "Transporte",
      spent: 80,
      limit: 150,
      icon: "🚌"
    }
  ]);

  const availableIcons = ["💰", "🍽️", "📚", "🚌", "🎮", "🏠", "👕", "💊", "🎓", "🎨"];

  const handleSaveNewCategory = () => {
    if (newCategory && newLimit) {
      onAddCategory(newCategory, Number(newLimit), selectedIcon);
      setShowAddModal(false);
      setNewCategory("");
      setNewLimit("");
      setSelectedIcon("💰");
    }
  };

  const handleUpdateLimit = (category: string) => {
    if (editingLimit) {
      onUpdateBudget(category, Number(editingLimit));
      setEditingCategory(null);
      setEditingLimit("");
    }
  };

  return (
    <Card title="Presupuesto Mensual">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Categorías de Gastos</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            Agregar Categoría
          </Button>
        </div>

        <div className="space-y-4">
          {localBudgets.map((budget, index) => (
            <div key={index} className="relative">
              <BudgetCard {...budget} />
              {editingCategory === budget.category ? (
                <div className="absolute right-2 top-2 flex items-center space-x-2">
                  <input
                    type="number"
                    value={editingLimit}
                    onChange={(e) => setEditingLimit(e.target.value)}
                    className="w-24 px-2 py-1 text-sm bg-[var(--app-background)] border border-[var(--app-accent)] rounded"
                    placeholder="Nuevo límite"
                  />
                  <button
                    onClick={() => handleUpdateLimit(budget.category)}
                    className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)]"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setEditingLimit("");
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="absolute right-2 top-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingCategory(budget.category);
                      setEditingLimit(budget.limit.toString());
                    }}
                    className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)]"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCategory(budget.category)}
                    className="text-red-500 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal para agregar nueva categoría */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--app-background)] p-6 rounded-xl w-96 border border-[var(--app-card-border)]">
              <h3 className="text-xl font-semibold mb-4">Nueva Categoría de Gasto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ej: Alimentación"
                    className="w-full p-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Límite Mensual
                  </label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ícono
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`p-2 rounded-lg text-xl ${
                          selectedIcon === icon
                            ? 'bg-[var(--app-accent)] text-white'
                            : 'bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)]'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategory("");
                    setNewLimit("");
                    setSelectedIcon("💰");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveNewCategory}
                  disabled={!newCategory || !newLimit}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Resumen y Estadísticas */}
        <div className="mt-6 p-4 bg-[var(--app-gray)] rounded-lg">
          <h4 className="font-medium mb-3">Resumen del Mes</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--app-foreground-muted)]">Gasto Total</p>
              <p className="text-lg font-medium">
                ${localBudgets.reduce((sum, budget) => sum + budget.spent, 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-foreground-muted)]">Presupuesto Total</p>
              <p className="text-lg font-medium">
                ${localBudgets.reduce((sum, budget) => sum + budget.limit, 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-foreground-muted)]">Categorías</p>
              <p className="text-lg font-medium">{localBudgets.length}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-foreground-muted)]">Categorías Excedidas</p>
              <p className="text-lg font-medium text-red-500">
                {localBudgets.filter(budget => (budget.spent / budget.limit) > 1).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
