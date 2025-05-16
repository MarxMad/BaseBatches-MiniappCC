import { NextResponse } from 'next/server';

// Almacenamiento temporal de tokens (en producción usar una base de datos)
const notificationTokens = new Map<string, { token: string; url: string }>();

// Límites de notificaciones
const RATE_LIMIT_PER_TOKEN = {
  perSecond: 1,
  perDay: 100
};

// Control de límites
const tokenUsage = new Map<string, {
  lastNotification: number;
  dailyCount: number;
  lastReset: number;
}>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, notificationDetails, fid } = body;

    switch (event) {
      case 'frame_added':
        if (notificationDetails) {
          notificationTokens.set(fid.toString(), {
            token: notificationDetails.token,
            url: notificationDetails.url
          });
          // Inicializar contadores para el nuevo token
          tokenUsage.set(notificationDetails.token, {
            lastNotification: 0,
            dailyCount: 0,
            lastReset: Date.now()
          });
        }
        break;

      case 'frame_removed':
      case 'notifications_disabled':
        const userTokens = notificationTokens.get(fid.toString());
        if (userTokens) {
          tokenUsage.delete(userTokens.token);
          notificationTokens.delete(fid.toString());
        }
        break;

      case 'notifications_enabled':
        if (notificationDetails) {
          notificationTokens.set(fid.toString(), {
            token: notificationDetails.token,
            url: notificationDetails.url
          });
          // Inicializar contadores para el nuevo token
          tokenUsage.set(notificationDetails.token, {
            lastNotification: 0,
            dailyCount: 0,
            lastReset: Date.now()
          });
        }
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }
}

// Función para enviar notificaciones
export async function sendNotification(fid: string, notification: {
  notificationId: string;
  title: string;
  body: string;
  targetUrl: string;
}) {
  const userTokens = notificationTokens.get(fid);
  if (!userTokens) return null;

  const now = Date.now();
  const usage = tokenUsage.get(userTokens.token);

  if (!usage) return null;

  // Resetear contador diario si ha pasado un día
  if (now - usage.lastReset > 24 * 60 * 60 * 1000) {
    usage.dailyCount = 0;
    usage.lastReset = now;
  }

  // Verificar límites
  if (now - usage.lastNotification < 30 * 1000) {
    return {
      successfulTokens: [],
      invalidTokens: [],
      rateLimitedTokens: [userTokens.token]
    };
  }

  if (usage.dailyCount >= RATE_LIMIT_PER_TOKEN.perDay) {
    return {
      successfulTokens: [],
      invalidTokens: [],
      rateLimitedTokens: [userTokens.token]
    };
  }

  try {
    const response = await fetch(userTokens.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...notification,
        tokens: [userTokens.token]
      })
    });

    const result = await response.json();

    // Actualizar contadores
    if (result.successfulTokens?.includes(userTokens.token)) {
      usage.lastNotification = now;
      usage.dailyCount++;
    }

    return {
      successfulTokens: result.successfulTokens || [],
      invalidTokens: result.invalidTokens || [],
      rateLimitedTokens: result.rateLimitedTokens || []
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      successfulTokens: [],
      invalidTokens: [],
      rateLimitedTokens: [userTokens.token]
    };
  }
}
