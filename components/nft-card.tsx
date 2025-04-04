"use client"

import type React from "react"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Target, Brush, Download } from "lucide-react"
import html2canvas from 'html2canvas'

interface NFTCardProps {
  imageData: string
  cardData: {
    name: string
    type: string
  }
  scores?: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
  }
  prompt?: string
  promptGeneratedAt?: string
}

export default function NFTCard({ imageData, cardData, scores, prompt, promptGeneratedAt }: NFTCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Get card type color - Updated with more modern colors
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      Digital: { 
        bg: "bg-[#2E3192]", 
        text: "text-blue-300", 
        border: "border-blue-500",
        gradient: "from-blue-500 via-purple-500 to-pink-500"
      },
      Abstract: { 
        bg: "bg-[#6B1D9C]", 
        text: "text-purple-300", 
        border: "border-purple-500",
        gradient: "from-purple-500 via-pink-500 to-red-500"
      },
      Landscape: { 
        bg: "bg-[#1E8449]", 
        text: "text-green-300", 
        border: "border-green-500",
        gradient: "from-green-500 via-teal-500 to-blue-500"
      },
      Portrait: { 
        bg: "bg-[#C2185B]", 
        text: "text-pink-300", 
        border: "border-pink-500",
        gradient: "from-pink-500 via-red-500 to-yellow-500"
      },
      Surreal: { 
        bg: "bg-[#D4AC0D]", 
        text: "text-yellow-300", 
        border: "border-yellow-500",
        gradient: "from-yellow-500 via-orange-500 to-red-500"
      },
      Minimal: { 
        bg: "bg-[#17202A]", 
        text: "text-gray-300", 
        border: "border-gray-500",
        gradient: "from-gray-500 via-slate-500 to-zinc-500"
      }
    }

    return typeColors[type] || typeColors.Digital
  }

  const typeColor = getTypeColor(cardData.type)

  // Get rarity level based on overall score
  const getRarityLevel = (score: number) => {
    if (score >= 9) return { name: "Legendary", color: "text-purple-500", bg: "bg-purple-100" }
    if (score >= 8) return { name: "Epic", color: "text-red-500", bg: "bg-red-100" }
    if (score >= 7) return { name: "Rare", color: "text-blue-500", bg: "bg-blue-100" }
    if (score >= 6) return { name: "Uncommon", color: "text-green-500", bg: "bg-green-100" }
    return { name: "Common", color: "text-gray-500", bg: "bg-gray-100" }
  }

  // Get achievement based on score
  const getAchievement = (score: number) => {
    if (score >= 9) return "🎨 Master Artist"
    if (score >= 8) return "🌟 Creative Genius"
    if (score >= 7) return "✨ Artistic Prodigy"
    if (score >= 6) return "🎭 Creative Mind"
    return "🖌️ Budding Artist"
  }

  const rarity = scores ? getRarityLevel(scores.overall) : { name: "Common", color: "text-gray-500", bg: "bg-gray-100" }
  const achievement = scores ? getAchievement(scores.overall) : "🖌️ Budding Artist"

  // Update card data to use full prompt
  const enhancedCardData = {
    ...cardData,
    name: prompt || cardData.name,
  }

  // Download handler to capture entire card
  const handleDownload = async () => {
    const cardElement = document.querySelector('[data-card-download]')
    if (!cardElement) return

    try {
      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Convert to blob for better handling
      canvas.toBlob((blob) => {
        if (!blob) return
        
        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${cardData.type}-card.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0)
    } catch (error) {
      console.error('Error generating card image:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card container */}
      <div className="relative w-64">
        <div className="relative w-full" data-card-download>
          <Card className="w-full h-full overflow-hidden relative bg-black border-0">
            {/* Card image with gradient overlay */}
            <div className="h-48 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${typeColor.gradient} opacity-50 mix-blend-overlay`} />
              <img
                src={imageData || "/placeholder.svg"}
                alt={cardData.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                loading="eager"
              />
              {scores && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-white font-bold text-sm">{scores.overall.toFixed(1)}</span>
                  <Star className="h-3 w-3 text-yellow-400 inline ml-1" />
                </div>
              )}
            </div>

            {/* Card content */}
            <div className="relative z-20">
              {/* Title section */}
              <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-white/10">
                <div className="flex flex-col items-center text-center">
                  <Badge variant="outline" className={`mb-2 text-xs border-opacity-50 ${typeColor.text}`}>
                    {cardData.type}
                  </Badge>
                  <p className={`font-medium text-base ${typeColor.text} leading-snug`}>
                    "{enhancedCardData.name}"
                  </p>
                </div>
              </div>

              {/* Scores section */}
              {scores && (
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  <div className="bg-black/80 backdrop-blur-sm p-3 flex flex-col items-center">
                    <Star className="h-4 w-4 text-yellow-400 mb-1" />
                    <span className={`font-bold text-lg ${typeColor.text}`}>{scores.overall.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">Overall</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-sm p-3 flex flex-col items-center">
                    <Sparkles className="h-4 w-4 text-purple-400 mb-1" />
                    <span className={`font-bold text-lg ${typeColor.text}`}>{scores.creativity.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">Create</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-sm p-3 flex flex-col items-center">
                    <Target className="h-4 w-4 text-red-400 mb-1" />
                    <span className={`font-bold text-lg ${typeColor.text}`}>{scores.promptAdherence.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">Match</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-sm p-3 flex flex-col items-center">
                    <Brush className="h-4 w-4 text-green-400 mb-1" />
                    <span className={`font-bold text-lg ${typeColor.text}`}>{scores.artisticQuality.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">Quality</span>
                  </div>
                </div>
              )}

              {/* Achievement section */}
              <div className="bg-black/80 backdrop-blur-sm p-3 border-t border-white/10">
                <div className="flex items-center justify-center">
                  <span className={`text-sm font-medium ${typeColor.text}`}>{achievement}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors border border-white/10"
      >
        <Download className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">Download Card</span>
      </button>
    </div>
  )
}

