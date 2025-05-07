import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { untrustedData, trustedData } = data;
    const buttonIndex = untrustedData.buttonIndex;
    const bookId = untrustedData.bookId;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campuscoin.app';

    if (buttonIndex === 1) {
      // Ver detalles
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${baseUrl}/api/og/book/${bookId}/details" />
            <meta property="fc:frame:button:1" content="← Volver" />
            <meta property="fc:frame:button:2" content="Comprar Ahora" />
            <meta property="fc:frame:post_url" content="${baseUrl}/api/frame/action" />
          </head>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } else if (buttonIndex === 2) {
      // Comprar - Redirigir a la página de compra
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${baseUrl}/api/og/book/${bookId}/buy" />
            <meta property="fc:frame:button:1" content="Ir a Comprar" />
            <meta property="fc:redirect" content="${baseUrl}/book/${bookId}" />
          </head>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/api/og/error" />
          <meta property="fc:frame:button:1" content="Volver al Inicio" />
        </head>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error handling frame action:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/api/og/error" />
          <meta property="fc:frame:button:1" content="Intentar de nuevo" />
        </head>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
} 