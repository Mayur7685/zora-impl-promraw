import { zoraNFTABI } from './abis/zoraNFT';

export const ZORA_CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_ZORA_CONTRACT_ADDRESS as `0x${string}`,
  abi: zoraNFTABI,
} as const;

export const ZORA_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_ZORA_CHAIN_ID || '999999999');
export const ZORA_RPC_URL = process.env.NEXT_PUBLIC_ZORA_RPC_URL || 'https://sepolia.rpc.zora.energy'; 