import { extractText } from "./extractors"
import { chunkText } from "./chunker"
import { generateEmbeddings } from "@/lib/ai/embeddings"
import { createChunks, createEmbedding, updateDocumentStatus } from "@/lib/db/queries"
import { downloadFromR2 } from "@/lib/storage/r2-client"
import { analyzeDocumentQuality } from "@/lib/rag/quality-analysis"
import prisma from "@/lib/db/prisma"
import { config } from "@/lib/config"

/**
 * Document processing pipeline
 */

export interface ProcessingResult {
  documentId: string
  chunkCount: number
  embeddingCount: number
  success: boolean
  error?: string
}

export async function processDocument(documentId: string): Promise<ProcessingResult> {
  try {
    // Update status to processing
    await updateDocumentStatus(documentId, "PROCESSING")

    // Fetch document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Download file from R2
    if (!document.r2Key) {
      throw new Error("Document has no R2 storage key")
    }

    const buffer = await downloadFromR2(document.r2Key)

    // Extract text
    const text = await extractText(buffer, document.type)

    if (!text || text.trim().length === 0) {
      throw new Error("No text content extracted from document")
    }

    // Store document version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content: text,
        metadata: {
          extractedAt: new Date().toISOString(),
          textLength: text.length,
        },
      },
    })

    // Chunk text
    const chunks = await chunkText(text)

    if (chunks.length === 0) {
      throw new Error("No chunks generated from document")
    }

    // Create chunks in database
    await createChunks(documentId, chunks)

    // Fetch created chunks to get their IDs
    const createdChunks = await prisma.chunk.findMany({
      where: { documentId },
      orderBy: { position: "asc" },
    })

    // Generate embeddings
    const chunkTexts = createdChunks.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkTexts, config.ai.provider)

    // Store embeddings
    for (let i = 0; i < createdChunks.length; i++) {
      await createEmbedding(
        createdChunks[i].id,
        embeddings[i],
        config.ai.provider === "openai" ? config.ai.openai.embeddingModel : config.ai.google.embeddingModel,
        config.ai.provider,
      )
    }

    // Analyze document quality
    const qualityAnalysis = await analyzeDocumentQuality(documentId)

    // Update document with quality metrics
    await prisma.document.update({
      where: { id: documentId },
      data: {
        qualityScore: qualityAnalysis.qualityScore,
        contentAnalysis: qualityAnalysis.analysis,
        badges: qualityAnalysis.badges,
      },
    })

    // Update status to indexed
    await updateDocumentStatus(documentId, "INDEXED")

    return {
      documentId,
      chunkCount: chunks.length,
      embeddingCount: embeddings.length,
      success: true,
    }
  } catch (error) {
    console.error(`[PROCESSING_ERROR] Failed to process document ${documentId}:`, error)

    // Update status to failed
    await updateDocumentStatus(documentId, "FAILED")

    return {
      documentId,
      chunkCount: 0,
      embeddingCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
