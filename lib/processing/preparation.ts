import { extractText } from "./extractors"
import { chunkText } from "./chunker"
import { createChunks, updateDocumentStatus } from "@/lib/db/queries"
import { downloadFromR2 } from "@/lib/storage/r2-client"
import { analyzeDocumentQuality } from "@/lib/rag/quality-analysis"
import prisma from "@/lib/db/prisma"

/**
 * Document preparation pipeline (without embeddings)
 * This prepares the document by:
 * 1. Extracting text
 * 2. Creating chunks
 * 3. Analyzing quality and generating badges
 * 
 * Embeddings are generated later during question generation to save API costs
 */

export interface PreparationResult {
  documentId: string
  chunkCount: number
  qualityScore: number
  badges: string[]
  success: boolean
  error?: string
}

export async function prepareDocument(documentId: string): Promise<PreparationResult> {
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

    // Create chunks in database (without embeddings)
    await createChunks(documentId, chunks)

    // Analyze document quality
    const qualityAnalysis = await analyzeDocumentQuality(documentId)

    // Update document with quality metrics
    await prisma.document.update({
      where: { id: documentId },
      data: {
        qualityScore: qualityAnalysis.qualityScore,
        contentAnalysis: qualityAnalysis.analysis,
        badges: qualityAnalysis.badges,
        status: "INDEXED", // Mark as ready for question generation
      },
    })

    return {
      documentId,
      chunkCount: chunks.length,
      qualityScore: qualityAnalysis.qualityScore,
      badges: qualityAnalysis.badges,
      success: true,
    }
  } catch (error) {
    console.error(`[PREPARATION_ERROR] Failed to prepare document ${documentId}:`, error)

    // Update status to failed
    await updateDocumentStatus(documentId, "FAILED")

    return {
      documentId,
      chunkCount: 0,
      qualityScore: 0,
      badges: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
