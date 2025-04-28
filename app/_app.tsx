import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { AgentProvider } from '@coinbase/onchainkit';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <AgentProvider>
        <Component {...pageProps} />
      </AgentProvider>
    </ThemeProvider>
  );
}

export default MyApp; 