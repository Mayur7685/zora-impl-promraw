"use client"

import { useState } from "react"
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createZoraClient } from "@/lib/web3-config"

interface MintNFTButtonProps {
  disabled?: boolean
  scores?: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
    feedback: string
    nftCard: {
      name: string
      type: string
      hp: number
      moves: Array<{
        name: string
        damage: number
      }>
      description: string
    }
  }
  prompt?: string
}

export default function MintNFTButton({ disabled = true, scores, prompt }: MintNFTButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isMinting, setIsMinting] = useState(false)
  const [mintingComplete, setMintingComplete] = useState(false)
  const { toast } = useToast()

  // Web3 hooks
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { writeContract } = useWriteContract()

  const handleMint = async () => {
    if (!title.trim() || !scores || !prompt || !address) {
      toast({
        title: "Error",
        description: "Please provide a title and ensure your wallet is connected.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    try {
      // Get the canvas drawing
      const canvas = document.querySelector("canvas")
      if (!canvas) {
        throw new Error("Canvas not found")
      }

      const imageData = canvas.toDataURL("image/png")

      // Upload image to IPFS (you'll need to implement this)
      const imageUrl = await uploadToIPFS(imageData)
      
      // Create metadata
      const metadata = {
        name: title,
        description: `Artwork created from prompt: ${prompt}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Creativity", value: scores.creativity },
          { trait_type: "Prompt Adherence", value: scores.promptAdherence },
          { trait_type: "Artistic Quality", value: scores.artisticQuality },
          { trait_type: "Overall Score", value: scores.overall },
          { trait_type: "Prompt", value: prompt },
        ],
      }

      // Upload metadata to IPFS
      const metadataUrl = await uploadToIPFS(JSON.stringify(metadata))

      // Initialize Zora client
      const zoraClient = createZoraClient(chainId, publicClient)

      // Create the mint transaction
      const { parameters } = await zoraClient.mint({
        tokenContract: process.env.NEXT_PUBLIC_ZORA_CONTRACT_ADDRESS as `0x${string}`,
        mintType: "1155",
        quantityToMint: 1,
        tokenURI: metadataUrl,
        minterAccount: address,
      })

      // Execute the mint transaction
      const hash = await writeContract(parameters)

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === "success") {
        setMintingComplete(true)
        toast({
          title: "NFT Minted Successfully!",
          description: `Your artwork "${title}" has been minted as an NFT.`,
        })

        // Reset after showing success
        setTimeout(() => {
          setMintingComplete(false)
          setIsOpen(false)
          setTitle("")
        }, 3000)
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast({
        title: "Error",
        description: "Failed to mint NFT. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  // Helper function to upload to IPFS (you'll need to implement this)
  const uploadToIPFS = async (data: string) => {
    // Implement your IPFS upload logic here
    // You can use services like nft.storage, web3.storage, or pinata
    throw new Error("IPFS upload not implemented")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transform transition-transform hover:scale-105"
          disabled={disabled || !address}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Mint NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint your artwork as NFT</DialogTitle>
          <DialogDescription>Your artwork will be minted on Zora Protocol.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Artwork"
              className="col-span-3"
              disabled={isMinting || mintingComplete}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Preview</Label>
            <div className="col-span-3 border rounded-md h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              Artwork Preview
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Details</Label>
            <div className="col-span-3 text-sm space-y-1">
              <p>
                <span className="font-medium">Prompt:</span> {prompt || "No prompt"}
              </p>
              <p>
                <span className="font-medium">Score:</span> {scores?.overall.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Creativity:</span> {scores?.creativity.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Prompt Adherence:</span> {scores?.promptAdherence.toFixed(1) || "-"}/10
              </p>
              <p>
                <span className="font-medium">Artistic Quality:</span> {scores?.artisticQuality.toFixed(1) || "-"}/10
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          {mintingComplete ? (
            <Button className="bg-green-600 hover:bg-green-700" disabled>
              ✓ Minted Successfully
            </Button>
          ) : (
            <Button onClick={handleMint} disabled={isMinting || !title.trim() || !address}>
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint NFT"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

