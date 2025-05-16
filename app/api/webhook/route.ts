import { NextResponse } from 'next/server';
import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/frame-node";

// Almacenamiento temporal de tokens (en producción usar una base de datos)
const notificationTokens = new Map<string, { token: string; url: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);

    switch (data.event) {
      case 'frame_added':
      case 'notifications_enabled':
        if (data.notificationDetails) {
          notificationTokens.set(data.fid.toString(), {
            token: data.notificationDetails.token,
            url: data.notificationDetails.url
          });
        }
        break;

      case 'frame_removed':
      case 'notifications_disabled':
        notificationTokens.delete(data.fid.toString());
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Función para enviar notificaciones
export async function sendNotification(fid: string, notificationId: string, title: string, body: string) {
  const userToken = notificationTokens.get(fid.toString());
  
  if (!userToken) {
    console.log(`No hay token de notificación para el usuario ${fid}`);
    return;
  }

  try {
    const response = await fetch(userToken.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId,
        title,
        body,
        targetUrl: 'https://base-batches-miniapp-cc.vercel.app/dashboard',
        tokens: [userToken.token]
      })
    });

    const result = await response.json();
    console.log('Resultado de la notificación:', result);
    return result;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    throw error;
  }
}
