import { generateEmbeddings } from "@/lib/ai/embeddings"
import { createEmbedding } from "@/lib/db/queries"
import prisma from "@/lib/db/prisma"
import { config } from "@/lib/config"

/**
 * Embeddings generation pipeline
 * This generates embeddings for chunks that don't have them yet
 * Called during question generation to ensure chunks are ready for RAG
 */

export interface EmbeddingsResult {
  documentId: string
  embeddingsGenerated: number
  success: boolean
  error?: string
}

export async function generateDocumentEmbeddings(
  documentId: string,
  provider?: "openai" | "google"
): Promise<EmbeddingsResult> {
  try {
    const embeddingProvider = provider || config.ai.provider

    // Fetch chunks that don't have embeddings yet
    const chunksWithoutEmbeddings = await prisma.chunk.findMany({
      where: {
        documentId,
        embeddings: {
          none: {},
        },
      },
      orderBy: { position: "asc" },
    })

    if (chunksWithoutEmbeddings.length === 0) {
      return {
        documentId,
        embeddingsGenerated: 0,
        success: true,
      }
    }

    const chunkTexts = chunksWithoutEmbeddings.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkTexts, embeddingProvider)

    // Store embeddings
    const model =
      embeddingProvider === "openai" ? config.ai.openai.embeddingModel : config.ai.google.embeddingModel

    for (let i = 0; i < chunksWithoutEmbeddings.length; i++) {
      await createEmbedding(chunksWithoutEmbeddings[i].id, embeddings[i], model, embeddingProvider)
    }

    return {
      documentId,
      embeddingsGenerated: embeddings.length,
      success: true,
    }
  } catch (error) {
    console.error(`[EMBEDDINGS_ERROR] Failed to generate embeddings for document ${documentId}:`, error)

    return {
      documentId,
      embeddingsGenerated: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
