'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ZORA_CONTRACT_CONFIG } from '@/lib/contract-config';

export function useZoraNFT() {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash });

  const mint = async (tokenURI: string, quantity: number = 1) => {
    if (!address) throw new Error('No wallet connected');
    
    setIsMinting(true);
    setMintError(null);
    
    try {
      // Generate a deterministic token ID based on the token URI
      const tokenId = BigInt(
        '0x' + Buffer.from(tokenURI).toString('hex').slice(0, 16)
      );

      console.log('Minting with params:', {
        address,
        tokenId: tokenId.toString(),
        quantity,
        tokenURI
      });

      // Call the contract and handle the result
      await writeContract({
        ...ZORA_CONTRACT_CONFIG,
        functionName: 'mint',
        args: [address, tokenId, BigInt(quantity), tokenURI],
      });

      // If we get here, the transaction was submitted successfully
      return true;
    } catch (error) {
      // Log the error but don't throw it
      console.error('Minting error:', error);
      
      // Set a user-friendly error message
      if (error instanceof Error) {
        setMintError(error.message);
      } else {
        setMintError('An unknown error occurred during minting');
      }
      
      // Return false to indicate failure
      return false;
    } finally {
      setIsMinting(false);
    }
  };

  return {
    mint,
    isMinting: isMinting || isWaiting,
    mintError,
  };
} 