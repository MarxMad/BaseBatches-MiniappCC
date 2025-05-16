import { NextResponse } from 'next/server';
import { sendNotification } from '../route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, notificationId, title, body: message } = body;

    if (!fid || !notificationId || !title || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await sendNotification(fid, notificationId, title, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificación' },
      { status: 500 }
    );
  }
} 