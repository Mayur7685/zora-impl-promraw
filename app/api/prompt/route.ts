import { NextResponse } from "next/server"
import { generateCreativePrompt } from "@/lib/ai"

// Cache the last generated prompt
let lastPrompt: { prompt: string; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
  const now = Date.now()

  // Check if we have a cached prompt that's still valid
  if (lastPrompt && now - lastPrompt.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      prompt: lastPrompt.prompt,
      refreshedAt: new Date(lastPrompt.timestamp).toISOString(),
      expiresAt: new Date(lastPrompt.timestamp + CACHE_DURATION).toISOString(),
      cached: true,
    })
  }

  // Generate a new prompt
  const result = await generateCreativePrompt()

  // Cache the new prompt
  lastPrompt = {
    prompt: result.prompt,
    timestamp: now,
  }

  return NextResponse.json({
    prompt: result.prompt,
    refreshedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + CACHE_DURATION).toISOString(),
    cached: false,
    ...(result.error && { warning: result.error }),
  })
}

