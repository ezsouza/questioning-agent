import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth/session"
import prisma from "@/lib/db"
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

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        blobUrl: blob.url,
        status: "UPLOADING",
        userId: user.id,
      },
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
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
