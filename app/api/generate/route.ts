export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById, createQuestion, logGeneration } from "@/lib/db/queries"
import { retrieveContext, formatContextForPrompt, extractEvidenceFromChunks } from "@/lib/rag/retrieval"
import { generateQuestions } from "@/lib/ai/generation"
import { generateDocumentEmbeddings } from "@/lib/processing/embeddings-pipeline"
import prisma from "@/lib/db/prisma"

const generateSchema = z.object({
  documentId: z.string().uuid(),
  levels: z.array(z.enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"])),
  questionsPerLevel: z.number().int().positive().max(10).default(3),
  purpose: z.enum(["CREATION", "EVALUATION"]).default("EVALUATION"),
  includeAnswers: z.boolean().default(false),
  provider: z.enum(["openai", "google"]).optional(),
})

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, levels, questionsPerLevel, purpose, includeAnswers, provider } = generateSchema.parse(body)

    // Verify document ownership
    const document = await getDocumentById(documentId)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if document has chunks
    const chunkCount = await prisma.chunk.count({
      where: { documentId }
    })

    if (chunkCount === 0) {
      return NextResponse.json(
        { error: "Document not prepared yet. Please process the document first." },
        { status: 400 }
      )
    }

    // Check if embeddings exist, generate if needed
    const embeddingCount = await prisma.embedding.count({
      where: {
        chunk: {
          documentId
        }
      }
    })

    if (embeddingCount === 0) {
      // Generate embeddings for all chunks
      const embeddingsResult = await generateDocumentEmbeddings(documentId, provider)
      
      if (!embeddingsResult.success) {
        return NextResponse.json(
          { error: "Failed to generate embeddings for document chunks" },
          { status: 500 }
        )
      }
    }

    const allQuestions: Array<{
      text: string
      level: string
      difficulty: "EASY" | "MEDIUM" | "HARD"
      evidence: string[]
      answer?: string
    }> = []

    // Generate questions for each level
    for (const level of levels) {
      // Retrieve context for this cognitive level
      const query = buildQueryForLevel(level, purpose)
      const retrieval = await retrieveContext(documentId, query, {
        topK: 5,
        provider,
        rerank: true,
      })

      const context = formatContextForPrompt(retrieval.chunks)
      const evidence = extractEvidenceFromChunks(retrieval.chunks)

      // Generate questions with purpose-specific prompts
      const questions = await generateQuestions(
        context,
        level,
        questionsPerLevel,
        {
          provider,
          purpose,
          includeAnswers,
        }
      )

      // Store questions in database
      for (const question of questions) {
        await createQuestion({
          documentId,
          userId: user.id,
          text: question.text,
          level: question.level,
          difficulty: question.difficulty,
          purpose: purpose,
          answer: includeAnswers ? question.answer : undefined,
          evidence: question.evidence.length > 0 ? question.evidence : evidence,
        })

        allQuestions.push(question)
      }
    }

    const latency = Date.now() - startTime

    // Log generation
    await logGeneration({
      documentId,
      provider: provider || "openai",
      model: provider === "google" ? "gemini-2.0-flash-exp" : "gpt-4o-mini",
      levels: levels,
      questionsCount: allQuestions.length,
      latency,
      success: true,
    })

    return NextResponse.json({
      success: true,
      message: `Generated ${allQuestions.length} questions`,
      data: {
        questions: allQuestions,
        metadata: {
          provider: provider || "openai",
          purpose,
          includeAnswers,
          levels,
          questionsPerLevel,
          totalQuestions: allQuestions.length,
          latency,
        },
      },
    })
  } catch (error) {
    console.error("[GENERATE_API_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Question generation failed" }, { status: 500 })
  }
}

function buildQueryForLevel(level: string, purpose: string): string {
  if (purpose === "CREATION") {
    // For creation/brainstorming - focus on expansive, exploratory queries
    const creationQueries: Record<string, string> = {
      REMEMBER: "key concepts that could be expanded, definitions that need more context",
      UNDERSTAND: "ideas that need deeper explanation, concepts requiring clarification",
      APPLY: "potential applications, scenarios where concepts could be used differently",
      ANALYZE: "unexplored relationships, alternative perspectives, hidden patterns",
      EVALUATE: "areas needing validation, assumptions to challenge, improvements to suggest",
      CREATE: "opportunities for innovation, gaps to fill, new directions to explore",
    }
    return creationQueries[level] || creationQueries.CREATE
  } else {
    // For evaluation/testing - focus on assessment queries
    const evaluationQueries: Record<string, string> = {
      REMEMBER: "key facts, definitions, terms, and basic concepts to test recall",
      UNDERSTAND: "explanations, interpretations, and main ideas to test comprehension",
      APPLY: "examples, applications, and problem-solving scenarios to test application",
      ANALYZE: "relationships, patterns, causes, and effects to test analytical thinking",
      EVALUATE: "arguments, evidence, judgments, and critiques to test evaluation skills",
      CREATE: "synthesis, design, innovation, and original ideas to test creative thinking",
    }
    return evaluationQueries[level] || evaluationQueries.UNDERSTAND
  }
}
