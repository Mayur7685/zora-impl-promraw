"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSpring, animated } from "@react-spring/web"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Target, Brush } from "lucide-react"

interface PokemonCardProps {
  imageData: string
  cardData: {
    name: string
    type: string
    hp: number
    moves: Array<{
      name: string
      damage: number
    }>
    description: string
  }
  scores?: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
  }
  prompt?: string
}

export default function PokemonCard({ imageData, cardData, scores, prompt }: PokemonCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)
  const autoRotateRef = useRef<number>(0)

  // Get card type color
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; text: string; border: string }> = {
      Normal: { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-400" },
      Fire: { bg: "bg-red-100", text: "text-red-800", border: "border-red-400" },
      Water: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-400" },
      Electric: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-400" },
      Grass: { bg: "bg-green-100", text: "text-green-800", border: "border-green-400" },
      Ice: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-400" },
      Fighting: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-400" },
      Poison: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-400" },
      Ground: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-400" },
      Flying: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-400" },
      Psychic: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-400" },
      Bug: { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-400" },
      Rock: { bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-400" },
      Ghost: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-400" },
      Dragon: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-400" },
      Dark: { bg: "bg-neutral-100", text: "text-neutral-800", border: "border-neutral-400" },
      Steel: { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-400" },
      Fairy: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-400" },
    }

    return typeColors[type] || typeColors.Normal
  }

  const typeColor = getTypeColor(cardData.type)

  // Spring animation for the card
  const springProps = useSpring({
    transform: isHovered
      ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.05)`
      : autoRotate
        ? `perspective(1000px) rotateY(${rotation.y}deg) scale(1)`
        : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`,
    config: { mass: 5, tension: 350, friction: 40 },
  })

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    // Calculate rotation based on mouse position
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -20

    setRotation({ x, y })
  }

  // Auto-rotate animation
  useEffect(() => {
    if (autoRotate && !isHovered) {
      let angle = 0

      const animate = () => {
        angle = (angle + 0.5) % 360
        setRotation({ x: 0, y: angle })
        autoRotateRef.current = requestAnimationFrame(animate)
      }

      autoRotateRef.current = requestAnimationFrame(animate)
    }

    return () => {
      cancelAnimationFrame(autoRotateRef.current)
    }
  }, [autoRotate, isHovered])

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600"
    if (score >= 7) return "text-blue-600"
    if (score >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex justify-center items-center py-4">
      <animated.div
        ref={cardRef}
        style={springProps}
        className="relative w-64 rounded-xl overflow-hidden cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true)
          setAutoRotate(false)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setAutoRotate(true)
        }}
        onClick={() => setAutoRotate(!autoRotate)}
      >
        <Card className={`w-full h-full ${typeColor.border} border-2 overflow-hidden relative`}>
          {/* Holographic overlay effect */}
          <div
            className="absolute inset-0 opacity-30 z-10 bg-gradient-to-br from-transparent via-white to-transparent pointer-events-none"
            style={{
              backgroundSize: "200% 200%",
              backgroundPosition: `${rotation.y / 2 + 50}% ${rotation.x / 2 + 50}%`,
            }}
          />

          {/* Card image - now more prominent */}
          <div className="h-48 overflow-hidden bg-white border-b border-gray-200">
            <img
              src={imageData || "/placeholder.svg?height=200&width=300"}
              alt={cardData.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Prompt */}
          {prompt && (
            <div className="p-2 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center text-xs text-amber-800">
                <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="font-semibold mr-1">Prompt:</span>
                <span className="italic truncate">"{prompt}"</span>
              </div>
            </div>
          )}

          {/* Scores */}
          {scores && (
            <div className="p-2 bg-gray-50 border-b border-gray-200 grid grid-cols-4 gap-1">
              <div className="flex flex-col items-center">
                <Star className="h-3 w-3 text-blue-500" />
                <span className={`font-bold ${getScoreColor(scores.overall)}`}>{scores.overall.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500">Overall</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className={`font-bold ${getScoreColor(scores.creativity)}`}>{scores.creativity.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500">Create</span>
              </div>
              <div className="flex flex-col items-center">
                <Target className="h-3 w-3 text-red-500" />
                <span className={`font-bold ${getScoreColor(scores.promptAdherence)}`}>
                  {scores.promptAdherence.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-500">Adhere</span>
              </div>
              <div className="flex flex-col items-center">
                <Brush className="h-3 w-3 text-green-500" />
                <span className={`font-bold ${getScoreColor(scores.artisticQuality)}`}>
                  {scores.artisticQuality.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-500">Quality</span>
              </div>
            </div>
          )}

          {/* Card name and type */}
          <div className="p-3 flex justify-between items-center bg-white">
            <div className="flex items-center">
              <h3 className={`font-bold text-lg ${typeColor.text}`}>{cardData.name}</h3>
              <Badge variant="outline" className="ml-2 text-xs">
                {cardData.type}
              </Badge>
            </div>
            <div className={`font-bold ${typeColor.text}`}>{cardData.hp}</div>
          </div>

          {/* Card moves */}
          <div className="bg-white">
            {cardData.moves.map((move, index) => (
              <div key={index} className="p-2 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <Sparkles className={`h-3 w-3 mr-2 ${typeColor.text}`} />
                  <span className="font-medium">{move.name}</span>
                </div>
                <span className="font-bold text-lg">{move.damage}</span>
              </div>
            ))}
          </div>

          {/* Card description */}
          <div className="p-3 bg-gray-50 text-xs italic border-t border-gray-200">{cardData.description}</div>

          {/* Card footer */}
          <div className={`p-2 text-xs text-center ${typeColor.bg} ${typeColor.text} border-t border-gray-200`}>
            Promraw • AI-Generated Card
          </div>
        </Card>
      </animated.div>
    </div>
  )
}

