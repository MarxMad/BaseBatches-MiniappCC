"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiConfig } from 'wagmi';
import { config } from './config/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: "dark",
            theme: "mini-app-theme",
            name: "CampusCoin",
            logo: "/LogoCC.svg",
          },
          // wallet: {
          //   display: "modal",
          //   termsUrl: "https://tusitio.com/terminos",
          //   privacyUrl: "https://tusitio.com/privacidad",
          //   preference: "eoaOnly",
          //   supportedWallets: {
          //     frame: true,      // Warpcast/Farcaster Frame Wallet
          //     rabby: true,      // Rabby Wallet
          //     trust: true,      // Trust Wallet
          //   },
          //   signUpEnabled: false,
          // },
        }}
      >
        {children}
      </MiniKitProvider>
    </WagmiConfig>
  );
}
