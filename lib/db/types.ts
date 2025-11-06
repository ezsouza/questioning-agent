/**
 * Database type definitions for SQL queries
 */

// Enums
export type DocumentStatus = "UPLOADING" | "PROCESSING" | "INDEXED" | "FAILED"
export type CognitiveLevel = "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE"
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD"
export type QuestionPurpose = "CREATION" | "EVALUATION"

// Base models
export interface User {
  id: string
  name: string | null
  email: string
  email_verified: Date | null
  image: string | null
  password: string | null
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  session_token: string
  user_id: string
  expires: Date
  created_at: Date
  updated_at: Date
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  blob_url: string
  r2_key?: string | null
  r2_bucket?: string | null
  content_type?: string | null
  checksum?: string | null
  metadata?: Record<string, unknown> | null
  status: DocumentStatus
  quality_score?: number | null
  content_analysis?: Record<string, unknown> | null
  badges?: string[]
  user_id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export interface DocumentVersion {
  id: string
  document_id: string
  version: number
  content: string
  metadata: Record<string, unknown> | null
  created_at: Date
}

export interface Chunk {
  id: string
  document_id: string
  content: string
  position: number
  metadata: Record<string, unknown> | null
  created_at: Date
}

export interface Embedding {
  id: string
  chunk_id: string
  vector: number[]
  model: string
  provider: string
  created_at: Date
}

export interface Question {
  id: string
  document_id: string
  user_id: string
  text: string
  level: CognitiveLevel
  difficulty: QuestionDifficulty
  purpose: QuestionPurpose
  answer?: string | null
  evidence: string[]
  metadata: Record<string, unknown> | null
  created_at: Date
  updated_at: Date
}

export interface QueryLog {
  id: string
  document_id: string
  query: string
  top_k: number
  results: Record<string, unknown>
  latency: number
  created_at: Date
}

export interface GenerationLog {
  id: string
  document_id: string
  provider: string
  model: string
  levels: string[]
  questions_count: number
  tokens_used: number | null
  latency: number
  estimated_cost: number | null
  success: boolean
  error_message: string | null
  created_at: Date
}

// Extended types with relations
export interface DocumentWithRelations extends Omit<Document, 'user_id' | 'created_at' | 'updated_at'> {
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: Pick<User, "id" | "name" | "email">
  chunk_count?: number
  question_count?: number
  _count?: {
    chunks: number
    questions: number
  }
}

export interface ChunkWithEmbeddings extends Chunk {
  embeddings: Embedding[]
}

export interface QuestionWithDocument extends Question {
  document: Document
}

// Search result type
export interface SearchResult {
  id: string
  content: string
  position: number
  similarity: number
  metadata: Record<string, unknown> | null
}
