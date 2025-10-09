import './theme.css';
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppProvider } from './context/AppContext';
import { Inter } from 'next/font/google';
import { FloatingChat } from './components/FloatingChat';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "CAMPUS",
    description: "Tu marketplace universitario global - Compra, vende y gana tokens $CAMPUS",
    manifest: "/manifest.json",
    icons: {
      icon: "/CampusCoin.png",
      apple: "/CampusCoin.png",
    },
    openGraph: {
      title: "CAMPUS",
      description: "Tu marketplace universitario global - Compra, vende y gana tokens $CAMPUS",
      images: [
        {
          url: "https://base-batches-miniapp-cc.vercel.app/CampusCoin.png",
          width: 1200,
          height: 630,
          alt: "CAMPUS"
        }
      ],
      type: "website",
      url: "https://base-batches-miniapp-cc.vercel.app/"
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: "https://base-batches-miniapp-cc.vercel.app/CampusCoin.png",
        button: {
          title: "🚀 Iniciar CAMPUS",
          action: {
            type: "launch_frame",
            name: "CAMPUS",
            url: "https://base-batches-miniapp-cc.vercel.app/",
            splashImageUrl: "https://base-batches-miniapp-cc.vercel.app/CampusCoin.png",
            splashBackgroundColor: "#0A0A0A",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta property="og:title" content="CAMPUS" />
        <meta property="og:description" content="Tu marketplace universitario global - Compra, vende y gana tokens $CAMPUS" />
        <meta property="og:image" content="https://base-batches-miniapp-cc.vercel.app/CampusCoin.png" />
        <meta property="og:url" content="https://base-batches-miniapp-cc.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CAMPUS" />
        <meta name="twitter:description" content="Tu marketplace universitario global - Compra, vende y gana tokens $CAMPUS" />
        <meta name="twitter:image" content="https://base-batches-miniapp-cc.vercel.app/CampusCoin.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AppProvider>
            {children}
          </AppProvider>
        </Providers>
        <FloatingChat />
      </body>
    </html>
  );
}
