'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { metaMask } from 'wagmi/connectors';
import { useState, useEffect } from 'react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      await connect({ connector: metaMask() });
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  if (!mounted) {
    return (
      <Button
        variant="default"
        className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transform transition-transform hover:scale-105"
        disabled
      >
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      onClick={isConnected ? handleDisconnect : handleConnect}
      className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transform transition-transform hover:scale-105"
    >
      {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
    </Button>
  );
} 