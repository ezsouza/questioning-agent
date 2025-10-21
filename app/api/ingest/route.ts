import { NextResponse } from "next/server"
import { z } from "zod"
import { processDocument } from "@/lib/processing/pipeline"

const ingestSchema = z.object({
  documentId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { documentId } = ingestSchema.parse(body)

    console.log(`[INGEST_API] Starting ingestion for document ${documentId}`)

    // Process document (this could be moved to a queue in production)
    const result = await processDocument(documentId)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Processing failed",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Document processed successfully",
      data: {
        documentId: result.documentId,
        chunkCount: result.chunkCount,
        embeddingCount: result.embeddingCount,
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
        error: "Ingestion failed",
      },
      { status: 500 },
    )
  }
}
