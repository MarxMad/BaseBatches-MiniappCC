import { NextResponse } from 'next/server';
import { parseWebhookEvent, verifyAppKeyWithNeynar } from '@farcaster/frame-node';

// Almacenamiento temporal de tokens (en producción usar una base de datos)
const notificationTokens = new Map<string, { token: string; url: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);

    switch (data.event) {
      case 'frame_added':
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

      case 'notifications_enabled':
        if (data.notificationDetails) {
          notificationTokens.set(data.fid.toString(), {
            token: data.notificationDetails.token,
            url: data.notificationDetails.url
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
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}
