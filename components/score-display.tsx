"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, Zap } from "lucide-react"

interface ScoreDisplayProps {
  scores: {
    creativity: number
    promptAdherence: number
    artisticQuality: number
    overall: number
    feedback?: string
    nftCard?: {
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
}

export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const [animatedScores, setAnimatedScores] = useState({
    creativity: 0,
    promptAdherence: 0,
    artisticQuality: 0,
    overall: 0,
  })

  useEffect(() => {
    // Animate the scores
    const duration = 1000 // 1 second
    const steps = 20
    const interval = duration / steps

    let step = 0

    const timer = setInterval(() => {
      step++

      const progress = step / steps

      setAnimatedScores({
        creativity: scores.creativity * progress,
        promptAdherence: scores.promptAdherence * progress,
        artisticQuality: scores.artisticQuality * progress,
        overall: scores.overall * progress,
      })

      if (step >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [scores])

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 dark:text-green-400"
    if (score >= 7) return "text-blue-600 dark:text-blue-400"
    if (score >= 5) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProgressColor = (score: number) => {
    if (score >= 9) return "bg-gradient-to-r from-gray-500 to-black"
    if (score >= 7) return "bg-gradient-to-r from-gray-400 to-gray-700"
    if (score >= 5) return "bg-gradient-to-r from-gray-300 to-gray-600"
    return "bg-gradient-to-r from-gray-200 to-gray-500"
  }

  const getRoastLevel = (score: number) => {
    if (score >= 9) return "🔥 Masterpiece! Even Picasso would be jealous!"
    if (score >= 7) return "🎨 Not bad! Your art teacher would be proud!"
    if (score >= 5) return "🖌️ Decent effort! Keep practicing!"
    return "😅 Well... at least you tried!"
  }

  const getDetailedFeedback = (score: number) => {
    if (score >= 9) return "This is exceptional work! The composition, technique, and execution are all top-notch. You've truly captured the essence of the prompt while adding your unique creative flair."
    if (score >= 7) return "Strong work! You've shown good understanding of the prompt and demonstrated solid artistic skills. There's room for improvement, but you're definitely on the right track."
    if (score >= 5) return "A good attempt! You've understood the basic requirements of the prompt, but there's potential to push your creativity further and refine your technique."
    return "This is a starting point! While the basic idea is there, consider spending more time on technique and really thinking outside the box for your next attempt."
  }

  return (
    <Card className="border-4 border-gray-300 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="pb-2 bg-gray-200 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 dark:text-gray-300">AI Evaluation</CardTitle>
          <Badge variant="outline" className="bg-black text-white border-none">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Scored
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <ScoreItem
          label="Creativity"
          score={animatedScores.creativity}
          actualScore={scores.creativity}
          color={getScoreColor(scores.creativity)}
          progressColor={getProgressColor(scores.creativity)}
        />

        <ScoreItem
          label="Prompt Adherence"
          score={animatedScores.promptAdherence}
          actualScore={scores.promptAdherence}
          color={getScoreColor(scores.promptAdherence)}
          progressColor={getProgressColor(scores.promptAdherence)}
        />

        <ScoreItem
          label="Artistic Quality"
          score={animatedScores.artisticQuality}
          actualScore={scores.artisticQuality}
          color={getScoreColor(scores.artisticQuality)}
          progressColor={getProgressColor(scores.artisticQuality)}
        />

        <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-lg">Overall Score</h4>
            <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {animatedScores.overall.toFixed(1)}
            </div>
          </div>
          <Progress
            value={animatedScores.overall * 10}
            className="h-4 rounded-full"
            indicatorClassName={`${getProgressColor(scores.overall)} rounded-full`}
          />
        </div>

        {/* AI Feedback Section */}
        <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <h4 className="font-semibold text-sm">AI's Detailed Analysis:</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            {getDetailedFeedback(scores.overall)}
          </p>
        </div>

        {/* Roast Section */}
        <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <h4 className="font-semibold text-sm">AI's Roast:</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            {getRoastLevel(scores.overall)}
          </p>
        </div>

        {scores.feedback && (
          <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-sm mb-1">Additional Feedback:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              "{scores.feedback}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ScoreItemProps {
  label: string
  score: number
  actualScore: number
  color: string
  progressColor: string
}

function ScoreItem({ label, score, actualScore, color, progressColor }: ScoreItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className={`font-semibold text-lg ${color}`}>{score.toFixed(1)}</span>
      </div>
      <Progress value={score * 10} className="h-3 rounded-full" indicatorClassName={progressColor + " rounded-full"} />
    </div>
  )
}

