import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { logout } from "@/lib/auth/actions"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Para desativar, apenas fazemos logout
    // A conta não é deletada e pode ser reativada fazendo login novamente
    await logout()

    return NextResponse.json({ 
      success: true, 
      message: "Conta desativada com sucesso" 
    })
  } catch (error) {
    console.error("Error deactivating account:", error)
    return NextResponse.json(
      { error: "Erro ao desativar conta" },
      { status: 500 }
    )
  }
}
