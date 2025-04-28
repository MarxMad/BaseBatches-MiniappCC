import React, { useState, useRef, useEffect } from 'react';
import { Paper, TextField, Button, Typography, Box, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAgent } from '@coinbase/onchainkit';
import { agentConfig } from '../config';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agent } = useAgent(agentConfig);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await agent.chat(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta del agente:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {message.sender === 'assistant' && (
              <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
            )}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
                color: message.sender === 'user' ? '#ffffff' : '#1a1a1a',
                borderRadius: 2,
                border: message.sender === 'assistant' ? '1px solid #e0e0e0' : 'none',
                '&:hover': {
                  boxShadow: message.sender === 'assistant' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                },
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: message.sender === 'user' ? 500 : 400,
                  lineHeight: 1.5,
                }}
              >
                {message.text}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: message.sender === 'user' ? 0.8 : 0.6,
                  display: 'block',
                  mt: 0.5,
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
            {message.sender === 'user' && (
              <Avatar sx={{ bgcolor: 'secondary.main' }}>U</Avatar>
            )}
          </Box>
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                bgcolor: '#f5f5f5',
                color: '#1a1a1a',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="body1">...</Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe tu mensaje..."
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={inputMessage.trim() === '' || isLoading}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default Chat; 