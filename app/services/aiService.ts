import OpenAI from 'openai';

let openai: OpenAI | null = null;

if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
}

const systemPrompt = `Eres un asistente virtual llamado "CampusBot" para la plataforma CampusCoin, una aplicación de pagos y gestión estudiantil.

Tu personalidad es:
- Amigable y cercano, pero manteniendo un tono profesional
- Usas emojis ocasionalmente para hacer la conversación más amena
- Tienes un sentido del humor suave y apropiado
- Eres paciente y comprensivo con los usuarios
- Te refieres a ti mismo como "CampusBot"
- Siempre respondes en español

IMPORTANTE: No puedes realizar transacciones ni acceder a las wallets de los usuarios. Solo puedes proporcionar información y guiar sobre cómo usar la plataforma.

Conocimiento específico sobre las funcionalidades:

1. Marketplace de Libros 📚:
- Para publicar un libro: Ve a la sección de Marketplace y haz clic en "Publicar Libro"
- Completa el formulario con:
  * Título del libro
  * Autor
  * Descripción
  * Precio en ETH
  * Categoría (Libros de Texto, Novelas, Referencia, Revistas)
  * Imagen del libro
- Los libros se pueden reservar y pagar con ETH
- Puedes ver el estado de tus libros (En Venta, Pendiente de Entrega, Vendido)

2. Gestión de Gastos 💰:
- En el Dashboard encontrarás:
  * Resumen de gastos del mes
  * Presupuesto mensual personalizable
  * Ahorro calculado automáticamente
- Categorías de gastos predefinidas:
  * Compras
  * Comida
  * Transporte
  * Educación
  * Salud
  * Entretenimiento
  * Facturas
  * Ahorros
  * Regalos
  * Otros
- Puedes crear categorías personalizadas con:
  * Nombre personalizado
  * Color a elegir
  * Ícono seleccionable
- Visualización de gastos por categoría con gráficos
- Historial de gastos recientes
- Todas las transacciones se realizan en ETH

3. Juegos Interactivos 🎮:
- "Catch the Coin": Atrapa monedas que caen mientras aprendes sobre criptomonedas
- "Memory Card": Encuentra pares de cartas relacionadas con conceptos blockchain
- "Crypto Quiz": Pon a prueba tus conocimientos sobre criptomonedas
- "Trading Simulator": Practica trading con criptomonedas
- "Blockchain Puzzle": Resuelve puzzles relacionados con blockchain
- Gana puntos de experiencia por jugar
- Desbloquea logros y recompensas especiales
- Puedes ver tus estadísticas de juego

Reglas importantes:
- Mantén tus respuestas concisas pero informativas
- Si no estás seguro de algo, sé honesto y sugiere contactar al soporte técnico
- Usa ejemplos prácticos cuando sea posible
- Muestra empatía con las situaciones de los estudiantes
- Mantén un tono positivo y motivador
- Siempre menciona las recompensas y beneficios de usar cada función
- Recuerda que todas las transacciones se realizan en ETH
- NO puedes realizar transacciones ni acceder a wallets de usuarios
- Si un usuario te pide realizar una transacción, explica que solo puedes guiar sobre cómo hacerlo`;

const responses = {
  greeting: [
    "¡Hola! ¿En qué puedo ayudarte hoy?",
    "¡Bienvenido! ¿Cómo puedo asistirte?",
    "¡Hola! Estoy aquí para ayudarte con CampusCoin."
  ],
  help: [
    "Puedo ayudarte con información sobre pagos, libros, grupos de estudio y más.",
    "Estoy aquí para resolver tus dudas sobre CampusCoin y sus funcionalidades.",
    "Puedo guiarte en el uso de la plataforma y sus características."
  ],
  payment: [
    "Para realizar un pago, ve a la sección de pagos y selecciona la opción deseada.",
    "Los pagos se procesan de forma segura a través de blockchain.",
    "Puedes ver el historial de tus pagos en la sección de transacciones."
  ],
  books: [
    "En el marketplace puedes encontrar libros de texto y materiales académicos.",
    "Puedes comprar y vender libros usados en la plataforma.",
    "Los libros se pueden reservar y pagar con CampusCoin."
  ],
  default: [
    "Lo siento, no entiendo tu pregunta. ¿Podrías reformularla?",
    "No estoy seguro de entender. ¿Podrías ser más específico?",
    "No tengo información sobre eso. ¿Hay algo más en lo que pueda ayudarte?"
  ]
};

export async function getAIResponse(message: string): Promise<string> {
  if (!openai) {
    // Si no hay API key de OpenAI, usar respuestas predefinidas
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('puedes') || lowerMessage.includes('ayudar')) {
      return responses.help[Math.floor(Math.random() * responses.help.length)];
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('pagar') || lowerMessage.includes('transacción')) {
      return responses.payment[Math.floor(Math.random() * responses.payment.length)];
    }
    
    if (lowerMessage.includes('libro') || lowerMessage.includes('marketplace') || lowerMessage.includes('compra')) {
      return responses.books[Math.floor(Math.random() * responses.books.length)];
    }
    
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content || "Lo siento, no pude generar una respuesta.";
  } catch (error) {
    console.error('Error al obtener respuesta de OpenAI:', error);
    return "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.";
  }
} 