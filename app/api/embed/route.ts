export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { generateEmbedding } from "@/lib/ai/embeddings"
import { getCurrentUser } from "@/lib/auth/session"

const embedSchema = z.object({
  text: z.string().min(1).max(10000),
  provider: z.enum(["openai", "google"]).optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { text, provider } = embedSchema.parse(body)

    const embedding = await generateEmbedding(text, provider)

    return NextResponse.json({
      success: true,
      embedding,
      dimensions: embedding.length,
      provider: provider || "openai",
    })
  } catch (error) {
    console.error("[EMBED_API_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Embedding generation failed" }, { status: 500 })
  }
}
