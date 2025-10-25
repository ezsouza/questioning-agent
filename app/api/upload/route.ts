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
      return NextResponse.json(
        {
          error: "Storage quota exceeded",
          details: {
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            required: file.size,
            available: quotaCheck.available,
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

    // Create document record
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
        status: "UPLOADING",
        userId: user.id,
      },
    })

    // Increment storage usage
    await incrementStorageUsage(user.id, file.size, {
      documentId: document.id,
      fileName: file.name,
    })

    // Trigger processing in the background
    // In production, this would be a queue job
    fetch(`${request.headers.get("origin")}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id }),
    }).catch((error) => {
      console.error("[UPLOAD_TRIGGER_INGEST_ERROR]", error)
    })

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
