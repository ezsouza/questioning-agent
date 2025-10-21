import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById } from "@/lib/db/queries"
import { processDocument } from "@/lib/processing/pipeline"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const document = await getDocumentById(id)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if document is already being processed
    if (document.status === "PROCESSING") {
      return NextResponse.json({ error: "Document is already being processed" }, { status: 400 })
    }

    // Trigger processing
    const result = await processDocument(id)

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
      data: result,
    })
  } catch (error) {
    console.error("[DOCUMENT_PROCESS_ERROR]", error)
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
  }
}
