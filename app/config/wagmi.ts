import { http } from 'wagmi';
import { base } from 'wagmi/chains';
import { createConfig } from 'wagmi';
import { createStorage } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';

const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'campuscoin-wagmi',
});

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'CampusCoin',
      appLogoUrl: '/LogoCC.svg',
      darkMode: true,
    }),
    miniAppConnector()
  ],
  transports: {
    [base.id]: http(),
  },
  storage,
  pollingInterval: 10000,
}); 