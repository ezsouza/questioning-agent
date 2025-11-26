export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById, createQuestion, logGeneration } from "@/lib/db/queries"
import { retrieveContext, formatContextForPrompt, extractEvidenceFromChunks } from "@/lib/rag/retrieval"
import { generateQuestions } from "@/lib/ai/generation"
import { generateDocumentEmbeddings } from "@/lib/processing/embeddings-pipeline"
import { config } from "@/lib/config"
import prisma from "@/lib/db/prisma"
import { 
  getNegativeFeedbackForDocument, 
  formatNegativeFeedbackForPrompt,
  analyzeFeedbackPatterns 
} from "@/lib/rag/feedback-context"

const generateSchema = z.object({
  documentId: z.string().uuid(),
  levels: z.array(
    z.enum([
      // Evaluation levels (Bloom's Taxonomy)
      "REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE",
      // Creation levels (Creative Process)
      "EXPLORE", "IDEATE", "PROTOTYPE", "REFINE", "INTEGRATE", "INNOVATE"
    ])
  ),
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

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Document must be INDEXED to have complete chunks and embeddings
    if (document.status !== "INDEXED") {
      return NextResponse.json(
        { 
          error: "Document is not ready for question generation",
          details: `Current status: ${document.status}. Please wait for processing to complete or process the document manually.`,
          status: document.status
        },
        { status: 400 }
      )
    }

    // Verify chunks exist
    const chunkCount = await prisma.chunk.count({
      where: { documentId }
    })

    if (chunkCount === 0) {
      console.error(`[GENERATE] Document ${documentId} has no chunks despite being INDEXED`)
      return NextResponse.json(
        { 
          error: "Document has no content chunks",
          details: "The document processing failed to create chunks. Please reprocess the document.",
          action: "REPROCESS_REQUIRED"
        },
        { status: 400 }
      )
    }

    // Verify embeddings exist for all chunks
    const embeddingCount = await prisma.embedding.count({
      where: {
        chunk: {
          documentId
        }
      }
    })

    // Auto-generate embeddings if missing
    if (embeddingCount === 0 || embeddingCount < chunkCount) {
      console.warn(`[GENERATE] Document ${documentId} is missing embeddings. Attempting to generate them automatically...`)
      
      try {
        const embeddingsResult = await generateDocumentEmbeddings(documentId, provider)
        
        if (!embeddingsResult.success) {
          console.error(`[GENERATE] Failed to auto-generate embeddings:`, embeddingsResult)
          return NextResponse.json(
            { 
              error: "Document has no embeddings",
              details: `Automatic embedding generation failed: ${embeddingsResult.error || 'Unknown error'}. Please reprocess the document manually.`,
              action: "REPROCESS_REQUIRED"
            },
            { status: 400 }
          )
        }
        
        // Update embedding count after generation
        const newEmbeddingCount = await prisma.embedding.count({
          where: {
            chunk: {
              documentId
            }
          }
        })
        
        if (newEmbeddingCount === 0) {
          console.error(`[GENERATE] Still no embeddings after auto-generation`)
          return NextResponse.json(
            { 
              error: "Failed to generate embeddings",
              details: "Automatic embedding generation completed but no embeddings were created. The document may have invalid content.",
              action: "REPROCESS_REQUIRED"
            },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error(`[GENERATE] Error during auto-embedding generation:`, error)
        return NextResponse.json(
          { 
            error: "Failed to generate embeddings",
            details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            action: "REPROCESS_REQUIRED"
          },
          { status: 500 }
        )
      }
    }

    // Get negative feedback to avoid similar mistakes
    const negativeFeedbacks = await getNegativeFeedbackForDocument(documentId, user.id)
    const feedbackPrompt = formatNegativeFeedbackForPrompt(negativeFeedbacks)
    
    // Analyze patterns if there's significant negative feedback
    if (negativeFeedbacks.length > 0) {
      const patterns = analyzeFeedbackPatterns(negativeFeedbacks)
      console.log(`[GENERATE] Found ${negativeFeedbacks.length} negative feedbacks`)
      console.log(`[GENERATE] Most common issues:`, patterns.mostCommonReasons.slice(0, 3))
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
      // Retrieve context for this cognitive level using semantic search on chunks
      const query = buildQueryForLevel(level, purpose)
      const retrieval = await retrieveContext(documentId, query, {
        topK: 10, // Increased to get more diverse chunks
        provider,
        rerank: true,
      })

      // Validate that we got chunks
      if (!retrieval.chunks || retrieval.chunks.length === 0) {
        console.error(`[GENERATE] No chunks retrieved for level ${level}. Skipping this level.`)
        continue
      }

      // Format context with token limit (8000 tokens ≈ 32000 chars)
      // This ensures we don't exceed model's context window while using ONLY chunk content
      const context = formatContextForPrompt(retrieval.chunks, 8000)
      
      // Validate context is not empty
      if (!context || context.trim().length === 0) {
        console.error(`[GENERATE] Empty context after formatting for level ${level}. Skipping.`)
        continue
      }

      // Extract evidence from chunks for reference
      const evidence = extractEvidenceFromChunks(retrieval.chunks)

      // Generate questions with purpose-specific prompts
      // The AI model will ONLY use the chunk content provided in the context
      const questions = await generateQuestions(
        context,
        level,
        questionsPerLevel,
        {
          provider,
          purpose,
          includeAnswers,
          feedbackContext: feedbackPrompt, // Include negative feedback context
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

    // Validate that at least some questions were generated
    if (allQuestions.length === 0) {
      console.error(`[GENERATE] No questions were generated for document ${documentId}`)
      return NextResponse.json(
        { 
          error: "Failed to generate questions",
          details: "No questions could be generated from the document chunks. The document may not have enough content.",
        },
        { status: 500 }
      )
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
      EXPLORE: "key concepts that could be expanded, definitions that need more context",
      IDEATE: "ideas that need deeper explanation, concepts requiring clarification",
      PROTOTYPE: "potential applications, scenarios where concepts could be used differently",
      REFINE: "unexplored relationships, alternative perspectives, hidden patterns",
      INTEGRATE: "areas needing validation, assumptions to challenge, improvements to suggest",
      INNOVATE: "opportunities for innovation, gaps to fill, new directions to explore",
    }
    return creationQueries[level] || creationQueries.INNOVATE
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
