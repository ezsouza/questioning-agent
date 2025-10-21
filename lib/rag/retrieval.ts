import { generateEmbedding } from "@/lib/ai/embeddings"
import { searchSimilarChunks, logQuery } from "@/lib/db/queries"
import { config } from "@/lib/config"
import type { SearchResult } from "@/lib/db/types"

/**
 * RAG retrieval utilities
 */

export interface RetrievalOptions {
  topK?: number
  similarityThreshold?: number
  provider?: "openai" | "google"
  rerank?: boolean
}

export interface RetrievalResult {
  chunks: SearchResult[]
  query: string
  latency: number
  metadata: {
    topK: number
    similarityThreshold: number
    provider: string
    totalResults: number
  }
}

export async function retrieveContext(
  documentId: string,
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
  const startTime = Date.now()

  const topK = options.topK || config.rag.topK
  const similarityThreshold = options.similarityThreshold || config.rag.similarityThreshold
  const provider = options.provider || config.ai.provider

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, provider)

    // Search for similar chunks
    const results = await searchSimilarChunks(documentId, queryEmbedding, topK * 2) // Fetch more for re-ranking

    // Filter by similarity threshold
    let filteredResults = results.filter((r) => r.similarity >= similarityThreshold)

    // Re-rank if enabled (simple keyword-based re-ranking)
    if (options.rerank) {
      filteredResults = rerankResults(filteredResults, query)
    }

    // Take top K after filtering and re-ranking
    const finalResults = filteredResults.slice(0, topK)

    const latency = Date.now() - startTime

    // Log the query
    await logQuery({
      documentId,
      query,
      topK,
      results: finalResults,
      latency,
    })

    return {
      chunks: finalResults,
      query,
      latency,
      metadata: {
        topK,
        similarityThreshold,
        provider,
        totalResults: finalResults.length,
      },
    }
  } catch (error) {
    console.error("[RETRIEVAL_ERROR]", error)
    throw new Error("Failed to retrieve context")
  }
}

function rerankResults(results: SearchResult[], query: string): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/)

  return results
    .map((result) => {
      const content = result.content.toLowerCase()
      const keywordScore = queryTerms.reduce((score, term) => {
        const occurrences = (content.match(new RegExp(term, "g")) || []).length
        return score + occurrences
      }, 0)

      // Combine semantic similarity with keyword matching
      const combinedScore = result.similarity * 0.7 + (keywordScore / queryTerms.length) * 0.3

      return {
        ...result,
        similarity: combinedScore,
      }
    })
    .sort((a, b) => b.similarity - a.similarity)
}

export function formatContextForPrompt(chunks: SearchResult[]): string {
  return chunks
    .map((chunk, index) => {
      return `[Context ${index + 1}] (Similarity: ${(chunk.similarity * 100).toFixed(1)}%)\n${chunk.content}`
    })
    .join("\n\n---\n\n")
}

export function extractEvidenceFromChunks(chunks: SearchResult[]): string[] {
  return chunks.map((chunk) => {
    // Extract first sentence or first 200 characters as evidence
    const sentences = chunk.content.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    if (firstSentence && firstSentence.length > 0) {
      return firstSentence.length > 200 ? firstSentence.slice(0, 200) + "..." : firstSentence
    }
    return chunk.content.slice(0, 200) + "..."
  })
}
