import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { config } from "@/lib/config"

/**
 * Text chunking utilities
 */

export interface ChunkResult {
  content: string
  position: number
  metadata?: {
    startIndex: number
    endIndex: number
  }
}

export async function chunkText(text: string, chunkSize?: number, chunkOverlap?: number): Promise<ChunkResult[]> {
  const size = chunkSize || config.rag.chunkSize
  const overlap = chunkOverlap || config.rag.chunkOverlap

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: size,
    chunkOverlap: overlap,
    separators: ["\n\n", "\n", ". ", " ", ""],
  })

  const chunks = await splitter.createDocuments([text])

  return chunks.map((chunk, index) => ({
    content: chunk.pageContent,
    position: index,
    metadata: {
      startIndex: index * (size - overlap),
      endIndex: index * (size - overlap) + chunk.pageContent.length,
    },
  }))
}

export function estimateChunkCount(text: string, chunkSize?: number): number {
  const size = chunkSize || config.rag.chunkSize
  return Math.ceil(text.length / size)
}
