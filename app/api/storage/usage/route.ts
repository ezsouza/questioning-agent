import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import prisma from "@/lib/db/prisma"
import { getUserStorageInfo } from "@/lib/storage/quota"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    // Search quota and usage
    const info = await getUserStorageInfo(userId)
    // Search audit history
    const audit = await prisma.storageAudit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ used: info.used, quota: info.limit, audit })
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
