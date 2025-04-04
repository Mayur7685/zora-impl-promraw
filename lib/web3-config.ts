'use client';

import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { createCollectorClient } from '@zoralabs/protocol-sdk';
import { createPublicClient } from 'viem';
import { zora } from 'viem/chains';
import { ZORA_CONTRACT_CONFIG, ZORA_CHAIN_ID, ZORA_RPC_URL } from './contract-config';

// Define Zora chain configuration
const zoraChain = {
  id: ZORA_CHAIN_ID,
  name: 'Zora Sepolia',
  network: 'zora-sepolia',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [ZORA_RPC_URL] },
    public: { http: [ZORA_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Zora Explorer', url: 'https://sepolia.explorer.zora.energy' },
  },
  testnet: true,
} as const;

// Create Wagmi config
export const config = createConfig({
  chains: [zoraChain],
  connectors: [
    metaMask()
  ],
  transports: {
    [zoraChain.id]: http(ZORA_RPC_URL)
  }
});

// Create Zora client
export const createZoraClient = (chainId: number, publicClient: any) => {
  const zoraClient = createPublicClient({
    chain: zoraChain,
    transport: http(ZORA_RPC_URL),
  });

  return {
    mint: async ({ tokenContract, mintType, quantityToMint, tokenURI, minterAccount }: {
      tokenContract: `0x${string}`;
      mintType: '1155' | '721' | 'premint';
      quantityToMint: number;
      tokenURI: string;
      minterAccount: `0x${string}`;
    }) => {
      try {
        const parameters = {
          address: ZORA_CONTRACT_CONFIG.address,
          abi: ZORA_CONTRACT_CONFIG.abi,
          functionName: 'mint',
          args: [
            minterAccount,
            BigInt('0x' + Buffer.from(tokenURI).toString('hex').slice(0, 16)),
            BigInt(quantityToMint),
            tokenURI
          ],
        };

        return { parameters };
      } catch (error) {
        console.error('Error creating mint parameters:', error);
        throw error;
      }
    },
  };
}; 