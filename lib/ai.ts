import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Generate creative prompt using OpenAI
export async function generateCreativePrompt() {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log("OPENAI_API_KEY environment variable is not set, using fallback prompt")
      return {
        prompt: "Alien riding a giraffe in a neon city",
        error: "OpenAI API key not configured. Using a default prompt instead.",
      }
    }

    // Generate a prompt with the OpenAI API
    const { text } = await generateText({
      model: openai("gpt-4"),
      system:
        "You are a creative prompt generator for an art platform. Generate unique, imaginative, and visual drawing prompts that would be fun to illustrate. The prompts should be concise (5-10 words), evocative, specific, and visually interesting. Focus on unusual combinations, fantastical scenarios, or surreal imagery. Each prompt should inspire a clear visual that an artist could draw. Avoid abstract concepts that are hard to visualize. Examples: 'Robot mermaid in a cyberpunk ocean', 'Astronaut having tea with aliens', 'Dragon librarian organizing magical books'. Never repeat the same prompt twice.",
      prompt:
        "Generate a single creative, visual drawing prompt that would be fun to illustrate. Make it unique, imaginative, and specific. The prompt should be concise (5-10 words) and visually striking. Do not include any explanations or additional text, just the prompt itself. Make sure this prompt is different from any previous prompts.",
      apiKey: apiKey,
    })

    return { prompt: text.trim() }
  } catch (error) {
    console.log("Error generating prompt:", error)
    return {
      prompt: "Alien riding a giraffe in a neon city",
      error: "Failed to generate a new prompt. Using a default prompt instead.",
    }
  }
}

// Evaluate drawing using OpenAI
export async function evaluateDrawing(imageBase64: string, prompt: string) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.log("OPENAI_API_KEY environment variable is not set, using fallback scores")
      return generateFallbackScores(prompt)
    }

    // Evaluate with the OpenAI API
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content:
            "You are an art critic AI. Respond ONLY with valid JSON. Do not include markdown formatting, code blocks, or any explanatory text. Just return the raw JSON object.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Evaluate this drawing based on the prompt: "${prompt}". 
              
              Score it in these three categories:
              1. Creativity (1-10): How original and imaginative is the drawing?
              2. Prompt Adherence (1-10): How well does it match the given prompt?
              3. Artistic Quality (1-10): How well-executed is the drawing technically?
              
              Also, generate an NFT card for this artwork with:
              - A creative name for the artwork/character in the drawing (max 15 chars)
              - A type (e.g., Digital, Abstract, Landscape, etc.) based on the drawing's style
              - HP value between 50-150
              - 2 special attributes with creative names and value ratings
              - A short description (max 100 chars)
              
              Provide the scores and NFT card data in JSON format like this:
              {
                "creativity": 8.5,
                "promptAdherence": 7.9,
                "artisticQuality": 8.2,
                "overall": 8.2,
                "feedback": "Brief 1-2 sentence feedback",
                "nftCard": {
                  "name": "ArtworkName",
                  "type": "StyleType",
                  "hp": 100,
                  "moves": [
                    {"name": "Attribute 1", "damage": 40},
                    {"name": "Attribute 2", "damage": 70}
                  ],
                  "description": "Short description of the artwork"
                }
              }
              
              IMPORTANT: Return ONLY the JSON object. Do not include any markdown formatting, code blocks, or explanatory text.`,
            },
            {
              type: "image",
              image: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            },
          ],
        },
      ],
      apiKey: apiKey,
    })

    // Extract JSON from the response if it's wrapped in a code block
    const jsonContent = extractJsonFromText(text)

    // Parse the JSON response
    try {
      const scores = JSON.parse(jsonContent)

      // Calculate overall score if not provided
      if (!scores.overall && scores.creativity && scores.promptAdherence && scores.artisticQuality) {
        scores.overall = Number(((scores.creativity + scores.promptAdherence + scores.artisticQuality) / 3).toFixed(1))
      }

      // Rename pokemonCard to nftCard if it exists
      if (scores.pokemonCard && !scores.nftCard) {
        scores.nftCard = scores.pokemonCard
        delete scores.pokemonCard
      }

      return {
        scores,
        success: true,
      }
    } catch (parseError) {
      console.log("Error parsing JSON:", parseError, "Raw content:", jsonContent)
      throw new Error("Failed to parse AI response as JSON")
    }
  } catch (error) {
    console.log("Error evaluating drawing:", error)
    return generateFallbackScores(prompt)
  }
}

// Helper function to extract JSON from text that might be wrapped in markdown code blocks
function extractJsonFromText(text: string): string {
  // Check if the text contains a JSON code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim()
  }

  // If no code block is found, try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0].trim()
  }

  // If all else fails, return the original text
  return text.trim()
}

// Helper function to generate fallback scores when API key is missing or there's an error
function generateFallbackScores(prompt: string) {
  return {
    scores: {
      creativity: Number.parseFloat((Math.random() * 3 + 7).toFixed(1)),
      promptAdherence: Number.parseFloat((Math.random() * 3 + 7).toFixed(1)),
      artisticQuality: Number.parseFloat((Math.random() * 3 + 7).toFixed(1)),
      overall: Number.parseFloat((Math.random() * 3 + 7).toFixed(1)),
      feedback: "Your artwork shows creativity and imagination! Keep exploring different techniques.",
      nftCard: {
        name: "DigitalArt",
        type: "Abstract",
        hp: Math.floor(Math.random() * 100) + 50,
        moves: [
          { name: "Visual Impact", damage: Math.floor(Math.random() * 50) + 20 },
          { name: "Color Harmony", damage: Math.floor(Math.random() * 70) + 30 },
        ],
        description: `A creative interpretation of "${prompt.substring(0, 30)}..."`,
      },
    },
    success: true,
    error: "OpenAI API key not configured. Using fallback scores.",
  }
}

