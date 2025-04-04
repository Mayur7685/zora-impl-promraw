"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PromptData {
  prompt: string
  refreshedAt: string
  expiresAt: string
  cached: boolean
  warning?: string
}

interface DailyPromptProps {
  onPromptUpdate?: (prompt: string, data?: PromptData) => void
  isExpired?: boolean
}

export default function DailyPrompt({ onPromptUpdate, isExpired = false }: DailyPromptProps) {
  const [promptData, setPromptData] = useState<PromptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  // Fetch a new prompt
  const fetchPrompt = async () => {
    try {
      setLoading(true)

      // Add a timestamp to prevent caching
      const response = await fetch(`/api/prompt?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch prompt")
      }

      const data = await response.json()
      
      // Only update if we got a new prompt or if we don't have one yet
      if (!promptData || !data.cached) {
        setPromptData(data)

        // Pass the prompt and data to the parent component if callback exists
        if (onPromptUpdate && data.prompt) {
          onPromptUpdate(data.prompt, data)
        }
      }

      if (data.warning) {
        // Only show a toast for errors other than missing API key
        if (!data.warning.includes("API key not configured")) {
          toast({
            title: "Notice",
            description: data.warning,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.log("Error fetching prompt:", error)
      toast({
        title: "Error",
        description: "Failed to fetch prompt. Using a default prompt instead.",
        variant: "destructive",
      })

      // Set a default prompt in case of error
      const fallbackPrompt = {
        prompt: "Alien riding a giraffe in a neon city",
        refreshedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cached: false,
        warning: "Failed to fetch prompt. Using default.",
      }

      setPromptData(fallbackPrompt)

      // Pass the fallback prompt to the parent component
      if (onPromptUpdate) {
        onPromptUpdate(fallbackPrompt.prompt, fallbackPrompt)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch a prompt on initial load or when isExpired changes
  useEffect(() => {
    if (isExpired || !promptData) {
      fetchPrompt()
    }
  }, [isExpired])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPrompt()
  }

  const hasWarning = promptData?.warning !== undefined

  return (
    <Card
      className={`bg-gray-200 dark:bg-gray-800 border-4 ${
        hasWarning ? "border-gray-500 dark:border-gray-700" : "border-dashed border-gray-400 dark:border-gray-600"
      } rounded-xl shadow-lg`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-black text-white border-none mr-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Generated
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="h-8 px-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/30 rounded-full"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            <span className="text-xs">New Prompt</span>
          </Button>
        </div>

        {loading ? (
          <div className="h-8 bg-gray-100 dark:bg-gray-900/30 animate-pulse rounded-lg"></div>
        ) : (
          <>
            {hasWarning ? (
              <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <p className="text-gray-800 dark:text-gray-300 font-medium">{promptData?.prompt}</p>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-300 dark:border-gray-700">
                {promptData?.prompt || "Loading creative prompt..."}
              </h3>
            )}

            {/* Keep timestamp but make it hidden for metadata purposes */}
            {promptData?.refreshedAt && (
              <div className="mt-2 text-xs text-gray-800 dark:text-gray-300">
                <span>Generated: {new Date(promptData.refreshedAt).toLocaleString()}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

