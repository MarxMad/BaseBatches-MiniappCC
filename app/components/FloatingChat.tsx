'use client';

import { useState, useRef, useEffect } from 'react';
import { getAIResponse } from '../services/aiService';

type ChatMessage = {
  text: string;
  isBot: boolean;
  timestamp: string;
};

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "¡Hola! Soy tu asistente del campus. ¿En qué puedo ayudarte?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, {
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setInputMessage("");
    setIsLoading(true);

    try {
      // Obtener respuesta del bot
      const response = await getAIResponse(inputMessage);
      setMessages(prev => [...prev, {
        text: response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        // Botón flotante
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        // Ventana de chat
        <div className="bg-[var(--app-background)] rounded-lg shadow-xl border border-[var(--app-card-border)] w-96 max-w-[calc(100vw-2rem)] flex flex-col">
          {/* Header */}
          <div className="bg-[var(--app-accent)] p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/CampusCoin.png" alt="Bot" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-white font-medium">CampusBot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-[var(--app-accent-hover)] rounded-full p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-[var(--app-gray)] text-[var(--app-foreground)]'
                      : 'bg-[var(--app-accent)] text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--app-gray)] p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[var(--app-accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--app-accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--app-accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--app-card-border)] p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-lg px-4 py-2 text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 