export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { deleteFromR2 } from "@/lib/storage/r2-client"
import { decrementStorageUsage } from "@/lib/storage/quota"
import prisma from "@/lib/db/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        chunks: true,
        versions: true,
      },
    })

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
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        size: true,
        userId: true,
        r2Key: true,
        status: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete: marcar como deletado ao invés de remover do banco
    await prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "FAILED", // Usar FAILED como marcador de deletado
      },
    })

    // Deletar arquivo do R2
    if (document.r2Key) {
      try {
        await deleteFromR2(document.r2Key)
      } catch (error) {
        console.warn("Erro ao deletar arquivo do R2:", error)
        // Não bloquear a deleção se o R2 falhar
      }
    }

    // Decrementar storage usage do usuário
    await decrementStorageUsage(user.id, document.size, {
      documentId: document.id,
      fileName: document.name,
    })

    return NextResponse.json({ success: true, message: "Document deleted" })
  } catch (error) {
    console.error("[DOCUMENT_DELETE_ERROR]", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (document.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, metadata } = body

    // Validar campos permitidos para atualização
    const updateData: any = {}
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (metadata !== undefined) {
      if (typeof metadata !== "object" || metadata === null) {
        return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
      }
      updateData.metadata = metadata
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Atualizar documento
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ 
      success: true, 
      document: updatedDocument,
      message: "Document updated successfully"
    })
  } catch (error) {
    console.error("[DOCUMENT_PATCH_ERROR]", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}
