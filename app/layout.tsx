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
    title: "CampusCoin",
    description: "Mini app universitaria para pagos, marketplace y juegos educativos en blockchain",
    manifest: "/manifest.json",
    icons: {
      icon: "/Ensigna.png",
      apple: "/Ensigna.png",
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: "https://base-batches-miniapp-cc.vercel.app/Ensigna.png",
        button: {
          title: "🚀 Iniciar CampusCoin",
          action: {
            type: "launch_frame",
            name: "CampusCoin",
            url: "https://base-batches-miniapp-cc.vercel.app/",
            splashImageUrl: "https://base-batches-miniapp-cc.vercel.app/Ensigna.png",
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
        <meta name="theme-color" content="#0A0A0A" />
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
