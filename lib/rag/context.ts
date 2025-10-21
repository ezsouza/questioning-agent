import type { SearchResult } from "@/lib/db/types"

/**
 * Context management utilities
 */

export interface ContextWindow {
  chunks: SearchResult[]
  totalTokens: number
  maxTokens: number
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export function buildContextWindow(chunks: SearchResult[], maxTokens = 4000): ContextWindow {
  const selectedChunks: SearchResult[] = []
  let totalTokens = 0

  for (const chunk of chunks) {
    const chunkTokens = estimateTokens(chunk.content)

    if (totalTokens + chunkTokens <= maxTokens) {
      selectedChunks.push(chunk)
      totalTokens += chunkTokens
    } else {
      break
    }
  }

  return {
    chunks: selectedChunks,
    totalTokens,
    maxTokens,
  }
}

export function mergeOverlappingChunks(chunks: SearchResult[]): SearchResult[] {
  if (chunks.length <= 1) return chunks

  const merged: SearchResult[] = []
  let current = chunks[0]

  for (let i = 1; i < chunks.length; i++) {
    const next = chunks[i]

    // Check if chunks are adjacent (position-based)
    if (Math.abs(current.position - next.position) === 1) {
      // Merge chunks
      current = {
        ...current,
        content: current.content + "\n\n" + next.content,
        similarity: Math.max(current.similarity, next.similarity),
      }
    } else {
      merged.push(current)
      current = next
    }
  }

  merged.push(current)
  return merged
}

export function rankChunksByRelevance(chunks: SearchResult[], query: string): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/)

  return chunks
    .map((chunk) => {
      const content = chunk.content.toLowerCase()

      // Calculate term frequency
      const termFrequency = queryTerms.reduce((count, term) => {
        return count + (content.match(new RegExp(term, "g")) || []).length
      }, 0)

      // Calculate position score (earlier chunks might be more important)
      const positionScore = 1 / (chunk.position + 1)

      // Combined relevance score
      const relevanceScore = chunk.similarity * 0.6 + (termFrequency / queryTerms.length) * 0.3 + positionScore * 0.1

      return {
        ...chunk,
        similarity: relevanceScore,
      }
    })
    .sort((a, b) => b.similarity - a.similarity)
}
