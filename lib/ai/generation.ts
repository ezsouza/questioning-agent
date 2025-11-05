import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { config } from "@/lib/config"

/**
 * Question generation utilities
 */

export interface GenerationOptions {
  provider?: "openai" | "google"
  temperature?: number
  maxRetries?: number
  purpose?: "CREATION" | "EVALUATION"
  includeAnswers?: boolean
}

export interface GeneratedQuestion {
  text: string
  level: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  evidence: string[]
  reasoning?: string
  answer?: string
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
  level: string,
  count: number,
  options: GenerationOptions = {},
): Promise<GeneratedQuestion[]> {
  const provider = options.provider || config.ai.provider
  const temperature = options.temperature || config.generation.temperature
  const purpose = options.purpose || "EVALUATION"
  const includeAnswers = options.includeAnswers || false

  const prompt = buildPrompt(context, level, count, purpose, includeAnswers)

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

function buildPrompt(context: string, level: string, count: number, purpose: string = "EVALUATION", includeAnswers: boolean = false): string {
  const levelDescription = COGNITIVE_LEVEL_PROMPTS[level as keyof typeof COGNITIVE_LEVEL_PROMPTS] || COGNITIVE_LEVEL_PROMPTS.UNDERSTAND

  const purposeContext = purpose === "CREATION" 
    ? "These questions should help develop and expand the document, encouraging brainstorming and creative thinking."
    : "These questions should test comprehension and knowledge, suitable for an evaluation or exam."

  const answerInstruction = includeAnswers
    ? '\n7. Include a concise answer for each question in an "answer" field'
    : "\n7. DO NOT include answers in the questions"

  return `You are an expert educational content creator specializing in Bloom's Taxonomy.

Context from document:
${context}

Task: Generate ${count} high-quality questions at the "${level}" cognitive level.

Level Description: ${levelDescription}

Purpose: ${purposeContext}

Requirements:
1. Questions must be based ONLY on the provided context
2. Questions should be clear, specific, and unambiguous
3. Each question should cite specific evidence from the context
4. Vary the difficulty (easy, medium, hard) across questions
5. Questions should be appropriate for the ${level} level
6. Consider the ${purpose} purpose when crafting questions${answerInstruction}

Output Format (JSON):
[
  {
    "text": "The question text here?",
    "difficulty": "EASY|MEDIUM|HARD",
    "evidence": ["Quote from context that supports this question", "Another relevant quote"],
    "reasoning": "Brief explanation of why this question fits the ${level} level"${includeAnswers ? ',\n    "answer": "The answer to this question"' : ""}
  }
]

Generate exactly ${count} questions in valid JSON format:`
}

function parseQuestions(response: string, level: string): GeneratedQuestion[] {
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
      answer: q.answer,
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
