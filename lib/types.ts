/**
 * Shared TypeScript types and interfaces
 */

// Bloom's Taxonomy Cognitive Levels
export type CognitiveLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"

// Question Difficulty
export type QuestionDifficulty = "easy" | "medium" | "hard"

// AI Provider
export type AIProvider = "openai" | "google"

// Document Status
export type DocumentStatus = "uploading" | "processing" | "indexed" | "failed"

// Question with metadata
export interface Question {
  id: string
  text: string
  level: CognitiveLevel
  difficulty: QuestionDifficulty
  evidence: string[]
  documentId: string
  createdAt: Date
  updatedAt: Date
}

// Document with metadata
export interface DocumentMetadata {
  id: string
  name: string
  type: string
  size: number
  status: DocumentStatus
  chunkCount?: number
  questionCount?: number
  uploadedAt: Date
}

// RAG Retrieval Result
export interface RetrievalResult {
  chunkId: string
  content: string
  similarity: number
  metadata: {
    documentId: string
    documentName: string
    position: number
  }
}

// Generation Request
export interface GenerationRequest {
  documentId: string
  levels: CognitiveLevel[]
  questionsPerLevel: number
  provider?: AIProvider
}

// Generation Response
export interface GenerationResponse {
  questions: Question[]
  metadata: {
    provider: AIProvider
    model: string
    latency: number
    tokensUsed?: number
  }
}

// Export Format
export type ExportFormat = "json" | "csv"

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
