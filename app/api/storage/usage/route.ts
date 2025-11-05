export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import prisma from "@/lib/db/prisma"
import { getUserStorageInfo } from "@/lib/storage/quota"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get quota and usage
    const info = await getUserStorageInfo(user.id)
    
    // Get audit history
    const auditRecords = await prisma.storageAudit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    
    // Convert BigInt fields to numbers for JSON serialization
    const audit = auditRecords.map(record => ({
      ...record,
      fileSize: Number(record.fileSize),
      previousUsage: Number(record.previousUsage),
      newUsage: Number(record.newUsage),
    }))
    
    return NextResponse.json({ 
      used: info.used, 
      quota: info.limit, 
      audit 
    })
  } catch (error) {
    console.error("[STORAGE_USAGE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch storage usage" }, 
      { status: 500 }
    )
  }
}
