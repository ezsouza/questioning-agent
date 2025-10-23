import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { logout } from "@/lib/auth/actions"

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Deletar todos os dados do usuário em cascata
    // O Prisma já está configurado com onDelete: Cascade no schema
    await prisma.user.delete({
      where: { id: user.id },
    })

    // Fazer logout
    await logout()

    return NextResponse.json({ 
      success: true, 
      message: "Conta excluída com sucesso" 
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Erro ao excluir conta" },
      { status: 500 }
    )
  }
}
