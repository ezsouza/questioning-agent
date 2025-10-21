import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { config } from "@/lib/config"
import type { CognitiveLevel } from "@prisma/client"

/**
 * Question generation utilities
 */

export interface GenerationOptions {
  provider?: "openai" | "google"
  temperature?: number
  maxRetries?: number
}

export interface GeneratedQuestion {
  text: string
  level: CognitiveLevel
  difficulty: "EASY" | "MEDIUM" | "HARD"
  evidence: string[]
  reasoning?: string
}

const COGNITIVE_LEVEL_PROMPTS = {
  REMEMBER: "Create questions that test recall of facts, terms, basic concepts, and answers.",
  UNDERSTAND: "Create questions that test comprehension, explanation, and interpretation of ideas.",
  APPLY: "Create questions that test the ability to use information in new situations or solve problems.",
  ANALYZE: "Create questions that test the ability to break down information, find patterns, and draw connections.",
  EVALUATE: "Create questions that test the ability to justify decisions, critique, and make judgments.",
  CREATE: "Create questions that test the ability to produce original work, design solutions, or generate new ideas.",
}

export async function generateQuestions(
  context: string,
  level: CognitiveLevel,
  count: number,
  options: GenerationOptions = {},
): Promise<GeneratedQuestion[]> {
  const provider = options.provider || config.ai.provider
  const temperature = options.temperature || config.generation.temperature

  const prompt = buildPrompt(context, level, count)

  try {
    const model = provider === "openai" ? openai(config.ai.openai.model) : google(config.ai.google.model)

    const { text } = await generateText({
      model,
      prompt,
      temperature,
      maxRetries: options.maxRetries || config.generation.maxRetries,
    })

    return parseQuestions(text, level)
  } catch (error) {
    console.error("[GENERATION_ERROR]", error)
    throw new Error(`Failed to generate questions with ${provider}`)
  }
}

function buildPrompt(context: string, level: CognitiveLevel, count: number): string {
  const levelDescription = COGNITIVE_LEVEL_PROMPTS[level]

  return `You are an expert educational content creator specializing in Bloom's Taxonomy.

Context from document:
${context}

Task: Generate ${count} high-quality questions at the "${level}" cognitive level.

Level Description: ${levelDescription}

Requirements:
1. Questions must be based ONLY on the provided context
2. Questions should be clear, specific, and unambiguous
3. DO NOT include answers in the questions
4. Each question should cite specific evidence from the context
5. Vary the difficulty (easy, medium, hard) across questions
6. Questions should be appropriate for the ${level} level

Output Format (JSON):
[
  {
    "text": "The question text here?",
    "difficulty": "EASY|MEDIUM|HARD",
    "evidence": ["Quote from context that supports this question", "Another relevant quote"],
    "reasoning": "Brief explanation of why this question fits the ${level} level"
  }
]

Generate exactly ${count} questions in valid JSON format:`
}

function parseQuestions(response: string, level: CognitiveLevel): GeneratedQuestion[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON array found in response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array")
    }

    return parsed.map((q) => ({
      text: q.text,
      level,
      difficulty: q.difficulty || "MEDIUM",
      evidence: Array.isArray(q.evidence) ? q.evidence : [],
      reasoning: q.reasoning,
    }))
  } catch (error) {
    console.error("[PARSE_ERROR]", error)
    throw new Error("Failed to parse generated questions")
  }
}

export function estimateDifficulty(question: string): "EASY" | "MEDIUM" | "HARD" {
  const wordCount = question.split(/\s+/).length
  const hasMultipleClauses = (question.match(/,|;/g) || []).length > 2
  const hasComplexWords = /\b\w{12,}\b/.test(question)

  if (wordCount < 10 && !hasMultipleClauses) {
    return "EASY"
  } else if (wordCount > 20 || hasComplexWords || hasMultipleClauses) {
    return "HARD"
  } else {
    return "MEDIUM"
  }
}
