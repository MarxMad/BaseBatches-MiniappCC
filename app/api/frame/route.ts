import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://base-batches-miniapp-cc.vercel.app/';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CampusCoin Book</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${baseUrl}/api/og/book/${bookId}" />
        <meta property="fc:frame:button:1" content="Ver Detalles" />
        <meta property="fc:frame:button:2" content="Comprar Libro" />
        <meta property="fc:frame:post_url" content="${baseUrl}/api/frame/action" />
      </head>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
} 