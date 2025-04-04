'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useZoraNFT } from '@/hooks/useZoraNFT';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ZORA_CHAIN_ID } from '@/lib/contract-config';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import NFTCard from "@/components/nft-card";
import { uploadToIPFS, uploadMetadataToIPFS } from "@/lib/ipfs";

interface NFTMetadata {
  name: string;
  type: string;
  hp: number;
  moves: { name: string; damage: number; }[];
  description: string;
}

interface MintNFTProps {
  imageUrl?: string;
  metadata?: NFTMetadata;
  scores?: {
    creativity: number;
    promptAdherence: number;
    artisticQuality: number;
    overall: number;
  };
}

type MintType = 'drawing' | 'card';

function MintNFT({ imageUrl, metadata, scores }: MintNFTProps) {
  const [amount, setAmount] = useState<string>("1");
  const [mintType, setMintType] = useState<MintType>('drawing');
  const { mint, isMinting } = useZoraNFT();
  const { toast } = useToast();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);
  const [localScores, setLocalScores] = useState<{
    creativity: number;
    promptAdherence: number;
    artisticQuality: number;
    overall: number;
  } | undefined>(undefined);
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Try to get the canvas image if imageUrl is not provided
    if (!imageUrl) {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          console.log("Got canvas image directly:", dataUrl.substring(0, 50) + "...");
          setCanvasImageUrl(dataUrl);
        } catch (error) {
          console.error("Error getting canvas data:", error);
        }
      } else {
        console.log("Canvas element not found");
      }
    }
  }, [imageUrl]);

  useEffect(() => {
    // Debug logging
    console.log('MintNFT Props:', { 
      imageUrl: imageUrl ? (imageUrl.length > 50 ? `${imageUrl.substring(0, 50)}...` : imageUrl) : 'undefined',
      canvasImageUrl: canvasImageUrl ? (canvasImageUrl.length > 50 ? `${canvasImageUrl.substring(0, 50)}...` : canvasImageUrl) : 'undefined',
      metadata 
    });
    console.log('Wallet State:', { address, chainId });
    
    // Set image preview from either imageUrl or canvasImageUrl
    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log("Setting image preview from imageUrl");
      setImagePreview(imageUrl);
    } else if (canvasImageUrl) {
      console.log("Setting image preview from canvas");
      setImagePreview(canvasImageUrl);
    } else if (imageUrl) {
      console.log("Image URL is not a data URL:", imageUrl);
    } else {
      console.log("No image URL provided");
    }

    // Set scores from the scores prop if available
    if (scores) {
      setLocalScores(scores);
    } else {
      // Set mock scores for preview if no scores are provided
      setLocalScores({
        creativity: 8.5,
        promptAdherence: 7.8,
        artisticQuality: 9.0,
        overall: 8.4
      });
    }
  }, [imageUrl, canvasImageUrl, metadata, address, chainId, scores]);

  const handleMint = async () => {
    // Use either imageUrl or canvasImageUrl
    const finalImageUrl = imageUrl || canvasImageUrl;
    
    if (!finalImageUrl) {
      toast({
        title: "Error",
        description: "Missing image",
        variant: "destructive",
      });
      return;
    }

    if (mintType === 'card' && !metadata) {
      toast({
        title: "Error",
        description: "Missing metadata for card minting",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (chainId !== ZORA_CHAIN_ID) {
      try {
        await switchChain({ chainId: ZORA_CHAIN_ID });
        toast({
          title: "Network Changed",
          description: "Please try minting again",
        });
        return;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to switch network. Please switch to Zora Sepolia network manually.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Convert data URL to Blob
      const response = await fetch(finalImageUrl);
      const blob = await response.blob();
      
      // Upload image to IPFS
      const imageIpfsUrl = await uploadToIPFS(blob, 'nft-image.png');
      console.log("Image uploaded to IPFS:", imageIpfsUrl);

      // Create NFT metadata based on mint type
      let nftMetadata;
      
      if (mintType === 'drawing') {
        // Simple metadata for just the drawing
        nftMetadata = {
          name: "My Drawing",
          description: "A drawing I created",
          image: imageIpfsUrl,
          attributes: [
            {
              trait_type: "Type",
              value: "Drawing"
            }
          ]
        };
      } else if (metadata) {
        // Full metadata for the card with scores
        nftMetadata = {
          name: metadata.name,
          description: metadata.description,
          image: imageIpfsUrl,
          attributes: [
            {
              trait_type: "Type",
              value: metadata.type
            },
            {
              trait_type: "HP",
              value: metadata.hp
            },
            {
              trait_type: "Moves",
              value: metadata.moves.map(move => `${move.name} (${move.damage} damage)`).join(", ")
            }
          ],
          properties: {
            type: metadata.type,
            hp: metadata.hp,
            moves: metadata.moves
          }
        };
      }

      // Upload metadata to IPFS
      const metadataIpfsUrl = await uploadMetadataToIPFS(nftMetadata);
      console.log("Metadata uploaded to IPFS:", metadataIpfsUrl);

      const parsedAmount = parseInt(amount) || 1;
      const result = await mint(metadataIpfsUrl, parsedAmount);
      
      if (result) {
        toast({
          title: "Success",
          description: `NFT ${mintType === 'drawing' ? 'drawing' : 'card'} minted successfully! Check your wallet for the transaction.`,
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  if (!mounted) {
    return null;
  }

  const finalImageUrl = imageUrl || canvasImageUrl;
  const isButtonDisabled = isMinting || !finalImageUrl || (mintType === 'card' && !metadata) || !amount || !address;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          {/* Image Preview */}
          <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-black/5 border border-dashed">
            {imagePreview ? (
              <div className="w-full h-full flex items-center justify-center">
                <NFTCard
                  imageData={imagePreview}
                  cardData={{
                    name: metadata?.name || "Your Creation",
                    type: metadata?.type || "Digital Art"
                  }}
                  scores={localScores}
                  prompt={prompt}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Your creation will appear here</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Mint Type</Label>
            <RadioGroup 
              value={mintType} 
              onValueChange={(value) => setMintType(value as MintType)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="drawing" id="drawing" />
                <Label htmlFor="drawing">Just the Drawing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Full Card with Scores</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>

          <Button 
            onClick={handleMint}
            disabled={isButtonDisabled}
            className="w-full"
          >
            {isMinting ? "Minting..." : `Mint ${mintType === 'drawing' ? 'Drawing' : 'NFT Card'}`}
          </Button>

          {isButtonDisabled && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {!address && "Please connect your wallet"}
              {!finalImageUrl && "Missing image"}
              {mintType === 'card' && !metadata && "Missing metadata for card"}
              {!amount && "Please enter an amount"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { MintNFT };
export default MintNFT; 