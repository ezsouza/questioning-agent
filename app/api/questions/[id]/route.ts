import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { updateQuestion, deleteQuestion } from "@/lib/db/queries"
import prisma from "@/lib/db"

const updateSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateSchema.parse(body)

    // Verify ownership
    const question = await prisma.question.findUnique({
      where: { id },
      include: { document: true },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (question.document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await updateQuestion(id, data)

    return NextResponse.json({ success: true, question: updated })
  } catch (error) {
    console.error("[QUESTION_UPDATE_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const question = await prisma.question.findUnique({
      where: { id },
      include: { document: true },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (question.document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await deleteQuestion(id)

    return NextResponse.json({ success: true, message: "Question deleted" })
  } catch (error) {
    console.error("[QUESTION_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
