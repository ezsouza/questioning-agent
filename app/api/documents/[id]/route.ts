import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentById } from "@/lib/db/queries"
import prisma from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error("[DOCUMENT_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await prisma.document.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Document deleted" })
  } catch (error) {
    console.error("[DOCUMENT_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
