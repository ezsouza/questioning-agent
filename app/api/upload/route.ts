export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/storage/r2-client"
import { checkStorageQuota, incrementStorageUsage, StorageQuotaError } from "@/lib/storage/quota"
import { getCurrentUser } from "@/lib/auth/session"
import prisma from "@/lib/db/prisma"
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const isValidType = Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)
    if (!isValidType) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Check storage quota
    const quotaCheck = await checkStorageQuota(user.id, file.size)
    if (!quotaCheck.allowed) {
      const usedMB = (quotaCheck.used / (1024 * 1024)).toFixed(2)
      const limitMB = (quotaCheck.limit / (1024 * 1024)).toFixed(2)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const availableMB = (quotaCheck.available / (1024 * 1024)).toFixed(2)

      return NextResponse.json(
        {
          error: `Limite de armazenamento excedido. Você está usando ${usedMB}MB de ${limitMB}MB. Este arquivo (${fileSizeMB}MB) excede o espaço disponível (${availableMB}MB).`,
          details: {
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            required: file.size,
            available: quotaCheck.available,
            usedMB,
            limitMB,
            fileSizeMB,
            availableMB,
          },
        },
        { status: 413 }
      )
    }

    // Upload to Cloudflare R2
    const uploadResult = await uploadToR2(file, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId: user.id,
      folder: "documents",
    })

    // Create document record with INDEXED status
    // Processing (chunking, embeddings) will happen only when generating questions
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        blobUrl: uploadResult.url,
        r2Key: uploadResult.key,
        r2Bucket: uploadResult.bucket,
        contentType: uploadResult.contentType,
        checksum: uploadResult.checksum,
        status: "INDEXED", // Mark as ready immediately
        userId: user.id,
      },
    })

    // Increment storage usage
    await incrementStorageUsage(user.id, file.size, {
      documentId: document.id,
      fileName: file.name,
    })

    // No automatic processing - will be done on-demand during question generation

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          name: document.name,
          status: document.status,
          size: document.size,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)

    // Handle storage quota errors
    if (error instanceof StorageQuotaError) {
      return NextResponse.json(
        {
          error: error.message,
          details: {
            used: error.used,
            limit: error.limit,
            required: error.required,
          },
        },
        { status: 413 }
      )
    }

    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
