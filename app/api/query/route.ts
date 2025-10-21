export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById } from "@/lib/db/queries"
import { retrieveContext, formatContextForPrompt } from "@/lib/rag/retrieval"
import { buildContextWindow } from "@/lib/rag/context"

const querySchema = z.object({
  documentId: z.string().uuid(),
  query: z.string().min(1).max(1000),
  topK: z.number().int().positive().max(20).optional(),
  similarityThreshold: z.number().min(0).max(1).optional(),
  provider: z.enum(["openai", "google"]).optional(),
  rerank: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, query, topK, similarityThreshold, provider, rerank } = querySchema.parse(body)

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

    // Retrieve context
    const result = await retrieveContext(documentId, query, {
      topK,
      similarityThreshold,
      provider,
      rerank,
    })

    // Build context window
    const contextWindow = buildContextWindow(result.chunks)

    // Format context for prompt
    const formattedContext = formatContextForPrompt(contextWindow.chunks)

    return NextResponse.json({
      success: true,
      data: {
        query: result.query,
        chunks: result.chunks.map((chunk) => ({
          id: chunk.id,
          content: chunk.content,
          similarity: chunk.similarity,
          position: chunk.position,
          metadata: chunk.metadata,
        })),
        context: formattedContext,
        metadata: {
          ...result.metadata,
          latency: result.latency,
          contextTokens: contextWindow.totalTokens,
        },
      },
    })
  } catch (error) {
    console.error("[QUERY_API_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }
}
