import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    // Aquí deberías obtener los detalles del libro desde tu contrato o base de datos
    const book = {
      title: 'Título del Libro',
      author: 'Autor del Libro',
      price: '50 USDC',
      image: 'https://placeholder.com/book.jpg'
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111111',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <img
              src={book.image}
              alt={book.title}
              width={200}
              height={200}
              style={{
                borderRadius: '12px',
                marginRight: '20px',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginBottom: '10px',
                }}
              >
                {book.title}
              </h1>
              <p
                style={{
                  fontSize: '24px',
                  color: '#B8B8B8',
                  marginBottom: '20px',
                }}
              >
                por {book.author}
              </p>
              <div
                style={{
                  backgroundColor: '#FFD700',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  color: '#000000',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                {book.price}
              </div>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src="https://campuscoin.app/logo.png"
              alt="CampusCoin"
              width={32}
              height={32}
              style={{
                marginRight: '10px',
              }}
            />
            <span
              style={{
                color: '#FFD700',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              CampusCoin
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 