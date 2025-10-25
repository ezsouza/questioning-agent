export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getUserStorageInfo } from "@/lib/storage/quota"

/**
 * GET /api/documents/storage
 * Retorna informações detalhadas sobre o uso de storage do usuário
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const storageInfo = await getUserStorageInfo(user.id)

    return NextResponse.json({
      success: true,
      storage: storageInfo,
    })
  } catch (error) {
    console.error("[STORAGE_INFO_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch storage information" },
      { status: 500 }
    )
  }
}
