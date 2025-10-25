import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getFileUrl } from "@/lib/storage/r2-client"
import prisma from "@/lib/db/prisma"

/**
 * Generate fresh signed URL for user's files
 * 
 * Security:
 * - Only allows users to get URLs for their own files
 * - Validates file ownership before generating URL
 * - Uses appropriate expiration times based on file type
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { key, type = "document" } = body

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Chave do arquivo é obrigatória" },
        { status: 400 }
      )
    }

    // Validate ownership based on file type
    if (type === "avatar") {
      // Check if this is user's avatar
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { imageKey: true },
      })

      if (!dbUser || dbUser.imageKey !== key) {
        return NextResponse.json(
          { error: "Acesso negado a este arquivo" },
          { status: 403 }
        )
      }

      // Avatar URLs expire in 24 hours (frequently accessed)
      const url = await getFileUrl(key, 24 * 3600)
      return NextResponse.json({ url, expiresIn: 24 * 3600 })
    } else if (type === "document") {
      // Check if this is user's document
      const document = await prisma.document.findFirst({
        where: {
          r2Key: key,
          userId: user.id,
        },
        select: { id: true },
      })

      if (!document) {
        return NextResponse.json(
          { error: "Acesso negado a este arquivo" },
          { status: 403 }
        )
      }

      // Document URLs expire in 1 hour (sensitive content)
      const url = await getFileUrl(key, 3600)
      return NextResponse.json({ url, expiresIn: 3600 })
    } else {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return NextResponse.json(
      { error: "Erro ao gerar URL assinada" },
      { status: 500 }
    )
  }
}
