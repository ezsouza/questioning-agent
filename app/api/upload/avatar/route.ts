import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { uploadToR2, deleteFromR2 } from "@/lib/storage/r2-client"
import prisma from "@/lib/db/prisma"
import { config } from "@/lib/config"

const MAX_FILE_SIZE = config.storage.limits.maxAvatarSize // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser()

    if (!sessionUser) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar usuário completo do banco para acessar imageKey
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, imageKey: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP" },
        { status: 400 }
      )
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      )
    }

    // Deletar avatar antigo do R2, se existir
    if (user.imageKey) {
      try {
        await deleteFromR2(user.imageKey)
      } catch (error) {
        console.warn("Erro ao deletar avatar antigo:", error)
        // Não bloquear o upload se a exclusão falhar
      }
    }

    // Upload para Cloudflare R2
    const uploadResult = await uploadToR2(file, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId: user.id,
      folder: "avatars",
    })

    // Atualizar imageKey do usuário no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: uploadResult.url,
        imageKey: uploadResult.key,
      },
    })

    return NextResponse.json({
      url: uploadResult.url,
      size: file.size,
      type: file.type,
      key: uploadResult.key,
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    )
  }
}
