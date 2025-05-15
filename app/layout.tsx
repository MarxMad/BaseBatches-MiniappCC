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
    openGraph: {
      title: "CampusCoin",
      description: "Mini app universitaria para pagos, marketplace y juegos educativos en blockchain",
      images: [
        {
          url: "https://base-batches-miniapp-cc.vercel.app/Ensigna.png",
          width: 1200,
          height: 630,
          alt: "CampusCoin"
        }
      ],
      type: "website",
      url: "https://base-batches-miniapp-cc.vercel.app/"
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
        <meta property="og:title" content="CampusCoin" />
        <meta property="og:description" content="Mini app universitaria para pagos, marketplace y juegos educativos en blockchain" />
        <meta property="og:image" content="https://base-batches-miniapp-cc.vercel.app/Ensigna.png" />
        <meta property="og:url" content="https://base-batches-miniapp-cc.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CampusCoin" />
        <meta name="twitter:description" content="Mini app universitaria para pagos, marketplace y juegos educativos en blockchain" />
        <meta name="twitter:image" content="https://base-batches-miniapp-cc.vercel.app/Ensigna.png" />
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
