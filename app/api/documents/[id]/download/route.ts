import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { downloadFromR2 } from "@/lib/storage/r2-client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    if (!document.r2Key) {
      return NextResponse.json({ error: "Arquivo não disponível" }, { status: 404 })
    }

    // Download file from R2
    const fileBuffer = await downloadFromR2(document.r2Key)

    // Return file with download headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": document.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.name)}"`,
        "Content-Length": document.size.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[DOWNLOAD_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao baixar documento" },
      { status: 500 }
    )
  }
}
