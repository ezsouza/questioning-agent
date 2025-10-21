export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById, createQuestion, logGeneration } from "@/lib/db/queries"
import { retrieveContext, formatContextForPrompt, extractEvidenceFromChunks } from "@/lib/rag/retrieval"
import { generateQuestions } from "@/lib/ai/generation"
import type { CognitiveLevel } from "@prisma/client"

const generateSchema = z.object({
  documentId: z.string().uuid(),
  levels: z.array(z.enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"])),
  questionsPerLevel: z.number().int().positive().max(10).default(3),
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
    const { documentId, levels, questionsPerLevel, provider } = generateSchema.parse(body)

    // Verify document ownership
    const document = await getDocumentById(documentId)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (document.status !== "INDEXED") {
      return NextResponse.json({ error: "Document is not indexed yet" }, { status: 400 })
    }

    const allQuestions: Array<{
      text: string
      level: CognitiveLevel
      difficulty: "EASY" | "MEDIUM" | "HARD"
      evidence: string[]
    }> = []

    // Generate questions for each level
    for (const level of levels) {
      // Retrieve context for this cognitive level
      const query = buildQueryForLevel(level)
      const retrieval = await retrieveContext(documentId, query, {
        topK: 5,
        provider,
        rerank: true,
      })

      const context = formatContextForPrompt(retrieval.chunks)
      const evidence = extractEvidenceFromChunks(retrieval.chunks)

      // Generate questions
      const questions = await generateQuestions(context, level, questionsPerLevel, { provider })

      // Store questions in database
      for (const question of questions) {
        await createQuestion({
          documentId,
          userId: user.id,
          text: question.text,
          level: question.level,
          difficulty: question.difficulty,
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
          levels,
          questionsPerLevel,
          totalQuestions: allQuestions.length,
          latency,
        },
      },
    })
  } catch (error) {
    console.error("[GENERATE_API_ERROR]", error)

    const _latency = Date.now() - startTime

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Question generation failed" }, { status: 500 })
  }
}

function buildQueryForLevel(level: CognitiveLevel): string {
  const queries = {
    REMEMBER: "key facts, definitions, terms, and basic concepts",
    UNDERSTAND: "explanations, interpretations, and main ideas",
    APPLY: "examples, applications, and problem-solving scenarios",
    ANALYZE: "relationships, patterns, causes, and effects",
    EVALUATE: "arguments, evidence, judgments, and critiques",
    CREATE: "synthesis, design, innovation, and original ideas",
  }

  return queries[level]
}
