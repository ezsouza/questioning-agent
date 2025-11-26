export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/auth/session"
import prisma from "@/lib/db/prisma"
import { exportQuestions, getMimeType, getFileExtension } from "@/lib/utils/export"
import type { ExportFormat } from "@/lib/types"
import type { ExportQuestion } from "@/lib/utils/export"

const exportSchema = z.object({
  questionIds: z.array(z.string()).optional(),
  documentId: z.string().optional(),
  format: z.enum(["json", "csv", "markdown", "txt"]),
})

export async function POST(request: Request) {
  try {
    const user = await requireUser()

    const body = await request.json()
    const { questionIds, format, documentId } = exportSchema.parse(body)

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    // Filter by specific questions if provided
    if (questionIds && questionIds.length > 0) {
      where.id = {
        in: questionIds,
      }
    }

    // Filter by document if provided
    if (documentId) {
      where.documentId = documentId
    }

    // Fetch questions
    const questions = await prisma.question.findMany({
      where,
      include: {
        document: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found" },
        { status: 404 }
      )
    }

    // Transform to export format
    const exportData: ExportQuestion[] = questions.map((q) => ({
      id: q.id,
      text: q.text,
      answer: q.answer,
      level: q.level,
      difficulty: q.difficulty,
      purpose: q.purpose,
      evidence: q.evidence || [],
      createdAt: q.createdAt,
      documentName: q.document.name,
    }))

    // Export to requested format
    const content = exportQuestions(exportData, format)
    const mimeType = getMimeType(format)
    const extension = getFileExtension(format)

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = documentId
      ? `questoes-${documentId.slice(0, 8)}-${timestamp}${extension}`
      : `questoes-${timestamp}${extension}`

    // Return file
    return new NextResponse(content, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[EXPORT_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
