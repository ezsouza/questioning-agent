export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import prisma from "@/lib/db/prisma"
import type { Question, Document } from "@/lib/generated/prisma"

const bulkDeleteSchema = z.object({
  questionIds: z.array(z.string()).min(1),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionIds } = bulkDeleteSchema.parse(body)

    // Verify ownership of all questions
    const questions = await prisma.question.findMany({
      where: { 
        id: { in: questionIds },
      },
      include: { document: true },
    })

    if (questions.length !== questionIds.length) {
      return NextResponse.json({ error: "Some questions not found" }, { status: 404 })
    }

    const unauthorized = questions.some((q: Question & { document: Document }) => q.document.userId !== user.id)
    if (unauthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete all questions
    await prisma.question.deleteMany({
      where: { id: { in: questionIds } },
    })

    return NextResponse.json({ 
      success: true, 
      message: `${questionIds.length} ${questionIds.length === 1 ? 'questão deletada' : 'questões deletadas'}`,
      count: questionIds.length,
    })
  } catch (error) {
    console.error("[BULK_DELETE_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to delete questions" }, { status: 500 })
  }
}
