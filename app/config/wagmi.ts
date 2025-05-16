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

// Detectar si estamos en Warpcast
const isWarpcast = typeof window !== 'undefined' && window.location.hostname.includes('warpcast.com');

// Crear los conectores
const connectors = [
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
].filter(Boolean); // Filtrar cualquier conector que sea undefined

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
  storage,
  pollingInterval: 10000,
}); 