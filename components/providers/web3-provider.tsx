"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { zoraSepolia } from 'wagmi/chains';
import { Hydrate } from 'wagmi';
import { useEffect, useState } from 'react';
import { ConnectWallet } from '@/components/connect-wallet';

const config = createConfig({
  chains: [zoraSepolia],
  transports: {
    [zoraSepolia.id]: http()
  }
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-8">
              <ConnectWallet />
            </div>
            <Hydrate config={config}>
              {children}
            </Hydrate>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 