import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const systemPrompt = `Eres un asistente virtual para la plataforma CampusCoin, una aplicación de pagos y gestión estudiantil.
Tu objetivo es ayudar a los estudiantes con:
1. Información sobre pagos y transacciones
2. Consultas sobre libros y reservas
3. Información sobre grupos de estudio
4. Preguntas sobre logros y recompensas
5. Ayuda general con la plataforma

Mantén un tono amigable y profesional, y siempre responde en español.
Si no estás seguro de algo, sé honesto y sugiere contactar al soporte técnico.`;

export async function getAIResponse(message: string): Promise<string> {
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