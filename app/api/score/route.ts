import { NextResponse } from "next/server"
import { evaluateDrawing } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY environment variable is not set, using fallback scoring")
    }

    const formData = await request.formData()
    const imageData = formData.get("image") as string
    const prompt = formData.get("prompt") as string

    if (!imageData || !prompt) {
      return NextResponse.json({ error: "Missing image or prompt" }, { status: 400 })
    }

    // Call the AI evaluation function
    const result = await evaluateDrawing(imageData, prompt)

    if (!result.success) {
      return NextResponse.json({
        error: result.error || "Failed to evaluate drawing",
        scores: result.scores, // Include fallback scores if available
      })
    }

    return NextResponse.json({
      scores: result.scores,
      ...(result.error && { warning: result.error }),
    })
  } catch (error) {
    console.log("Error scoring image:", error)

    // Generate fallback scores in case of error
    const fallbackScores = {
      creativity: 8.5,
      promptAdherence: 8.2,
      artisticQuality: 8.7,
      overall: 8.5,
      feedback: "We had trouble analyzing your drawing, but it looks great! Keep creating!",
      nftCard: {
        name: "Fallbackmon",
        type: "Digital",
        hp: 100,
        moves: [
          { name: "Error Handling", damage: 50 },
          { name: "Backup Plan", damage: 70 },
        ],
        description: "A mysterious creation that appears when the system encounters an error.",
      },
    }

    return NextResponse.json({
      scores: fallbackScores,
      warning: "Failed to score image with AI. Using fallback scores.",
    })
  }
}

