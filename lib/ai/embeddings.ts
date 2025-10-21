import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { embed } from "ai"
import { config } from "@/lib/config"

/**
 * Embedding generation utilities
 */

export async function generateEmbedding(text: string, provider?: "openai" | "google"): Promise<number[]> {
  const selectedProvider = provider || config.ai.provider

  try {
    if (selectedProvider === "openai") {
      const { embedding } = await embed({
        model: openai.embedding(config.ai.openai.embeddingModel),
        value: text,
      })
      return embedding
    } else {
      const { embedding } = await embed({
        model: google.textEmbeddingModel(config.ai.google.embeddingModel),
        value: text,
      })
      return embedding
    }
  } catch (error) {
    console.error("[EMBEDDING_ERROR]", error)
    throw new Error(`Failed to generate embedding with ${selectedProvider}`)
  }
}

export async function generateEmbeddings(texts: string[], provider?: "openai" | "google"): Promise<number[][]> {
  const embeddings: number[][] = []

  // Process in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchEmbeddings = await Promise.all(batch.map((text) => generateEmbedding(text, provider)))
    embeddings.push(...batchEmbeddings)
  }

  return embeddings
}
