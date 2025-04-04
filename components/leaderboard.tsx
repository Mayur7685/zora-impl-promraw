"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star } from "lucide-react"

// Mock data - in a real app, this would come from an API
const mockLeaderboardData = [
  { id: 1, username: "ArtMaster", score: 9.8, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, username: "CreativeSoul", score: 9.5, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, username: "PromptPro", score: 9.2, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, username: "DigitalDoodler", score: 8.9, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, username: "SketchWizard", score: 8.7, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 6, username: "ArtificialArtist", score: 8.5, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 7, username: "CanvasCrusader", score: 8.3, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 8, username: "DrawingDreamer", score: 8.1, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 9, username: "PenPioneer", score: 7.9, avatar: "/placeholder.svg?height=40&width=40" },
  { id: 10, username: "BrushBaron", score: 7.7, avatar: "/placeholder.svg?height=40&width=40" },
]

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<typeof mockLeaderboardData>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to get leaderboard data
    const fetchLeaderboard = async () => {
      setLoading(true)

      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setLeaderboardData(mockLeaderboardData)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <Star className="h-5 w-5 text-blue-400 opacity-50" />
    }
  }

  const getRankBackground = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700"
      case 1:
        return "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 border-2 border-gray-300 dark:border-gray-700"
      case 2:
        return "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700"
      default:
        return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leaderboardData.map((user, index) => (
        <div key={user.id} className={`flex items-center p-3 rounded-lg ${getRankBackground(index)}`}>
          <div className="w-8 flex justify-center mr-3">{getRankIcon(index + 1)}</div>

          <Avatar className="h-10 w-10 mr-3 border-2 border-orange-300 dark:border-orange-700">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-400 text-white">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {index < 3 && (
                <Badge
                  variant="outline"
                  className="text-xs mr-1 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 border-orange-200 dark:border-orange-800/30"
                >
                  Top {index + 1}
                </Badge>
              )}
              <span>Prompt: "Alien riding a giraffe"</span>
            </div>
          </div>

          <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
            {user.score.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  )
}

