export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { prepareDocument } from "@/lib/processing/preparation"

const ingestSchema = z.object({
  documentId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { documentId } = ingestSchema.parse(body)

    // Prepare document (extract text, create chunks, analyze quality - NO embeddings)
    // Embeddings will be generated during question generation to save API costs
    const result = await prepareDocument(documentId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Preparation failed",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Document prepared successfully",
      data: {
        documentId: result.documentId,
        chunkCount: result.chunkCount,
        qualityScore: result.qualityScore,
        badges: result.badges,
      },
    })
  } catch (error) {
    console.error("[INGEST_API_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Preparation failed",
      },
      { status: 500 },
    )
  }
}
