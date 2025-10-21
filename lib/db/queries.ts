import sql from "./index"
import type {
  CognitiveLevel,
  QuestionDifficulty,
  DocumentStatus,
  Document,
  DocumentWithRelations,
  Chunk,
  Question,
  SearchResult,
} from "./types"

/**
 * Database query helpers using Neon SQL
 */

// User queries
export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `
  return result[0] || null
}

export async function createUser(data: { email: string; name: string; password: string }) {
  const result = await sql`
    INSERT INTO users (email, name, password)
    VALUES (${data.email}, ${data.name}, ${data.password})
    RETURNING id, email, name, created_at, updated_at
  `
  return result[0]
}

// Document queries
export async function getDocumentById(id: string): Promise<DocumentWithRelations | null> {
  const result = await sql`
    SELECT 
      d.*,
      json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
      (SELECT COUNT(*) FROM chunks WHERE document_id = d.id) as chunk_count,
      (SELECT COUNT(*) FROM questions WHERE document_id = d.id) as question_count
    FROM documents d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.id = ${id}
  `

  return result[0] || null
}

export async function getDocumentsByUserId(userId: string): Promise<DocumentWithRelations[]> {
  const result = await sql`
    SELECT 
      d.*,
      (SELECT COUNT(*) FROM chunks WHERE document_id = d.id) as chunk_count,
      (SELECT COUNT(*) FROM questions WHERE document_id = d.id) as question_count
    FROM documents d
    WHERE d.user_id = ${userId}
    ORDER BY d.created_at DESC
  `

  return result as DocumentWithRelations[]
}

export async function updateDocumentStatus(id: string, status: DocumentStatus) {
  await sql`
    UPDATE documents 
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function createDocument(data: {
  name: string
  type: string
  size: number
  blobUrl: string
  userId: string
}): Promise<Document> {
  const result = await sql`
    INSERT INTO documents (name, type, size, blob_url, user_id)
    VALUES (${data.name}, ${data.type}, ${data.size}, ${data.blobUrl}, ${data.userId})
    RETURNING *
  `

  return result[0] as Document
}

export async function deleteDocument(id: string) {
  await sql`DELETE FROM documents WHERE id = ${id}`
}

// Chunk queries
export async function getChunksByDocumentId(documentId: string): Promise<Chunk[]> {
  const result = await sql`
    SELECT * FROM chunks
    WHERE document_id = ${documentId}
    ORDER BY position ASC
  `

  return result as Chunk[]
}

export async function createChunks(
  documentId: string,
  chunks: Array<{ content: string; position: number; metadata?: Record<string, unknown> }>,
) {
  if (chunks.length === 0) return

  const values = chunks.map(
    (chunk) => sql`(${documentId}, ${chunk.content}, ${chunk.position}, ${JSON.stringify(chunk.metadata || null)})`,
  )

  await sql`
    INSERT INTO chunks (document_id, content, position, metadata)
    VALUES ${sql(values.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(","))}
  `.values(...chunks.flatMap((c) => [documentId, c.content, c.position, JSON.stringify(c.metadata || null)]))
}

// Embedding queries
export async function createEmbedding(chunkId: string, vector: number[], model: string, provider: string) {
  const vectorString = `[${vector.join(",")}]`

  await sql`
    INSERT INTO embeddings (chunk_id, vector, model, provider)
    VALUES (${chunkId}, ${vectorString}::vector, ${model}, ${provider})
    ON CONFLICT (chunk_id, model) DO UPDATE SET vector = EXCLUDED.vector
  `
}

export async function searchSimilarChunks(
  documentId: string,
  queryVector: number[],
  topK = 5,
): Promise<SearchResult[]> {
  const vectorString = `[${queryVector.join(",")}]`

  const results = await sql`
    SELECT 
      c.id,
      c.content,
      c.position,
      c.metadata,
      1 - (e.vector <=> ${vectorString}::vector) as similarity
    FROM chunks c
    INNER JOIN embeddings e ON e.chunk_id = c.id
    WHERE c.document_id = ${documentId}
    ORDER BY e.vector <=> ${vectorString}::vector
    LIMIT ${topK}
  `

  return results as SearchResult[]
}

// Question queries
export async function getQuestionsByDocumentId(
  documentId: string,
  filters?: {
    levels?: CognitiveLevel[]
    difficulty?: QuestionDifficulty[]
  },
): Promise<Question[]> {
  let query = sql`
    SELECT * FROM questions
    WHERE document_id = ${documentId}
  `

  if (filters?.levels && filters.levels.length > 0) {
    query = sql`${query} AND level = ANY(${filters.levels})`
  }

  if (filters?.difficulty && filters.difficulty.length > 0) {
    query = sql`${query} AND difficulty = ANY(${filters.difficulty})`
  }

  query = sql`${query} ORDER BY created_at DESC`

  const result = await query
  return result as Question[]
}

export async function createQuestion(data: {
  documentId: string
  userId: string
  text: string
  level: CognitiveLevel
  difficulty: QuestionDifficulty
  evidence: string[]
  metadata?: Record<string, unknown>
}): Promise<Question> {
  const result = await sql`
    INSERT INTO questions (document_id, user_id, text, level, difficulty, evidence, metadata)
    VALUES (
      ${data.documentId}, 
      ${data.userId}, 
      ${data.text}, 
      ${data.level}, 
      ${data.difficulty}, 
      ${data.evidence}, 
      ${JSON.stringify(data.metadata || null)}
    )
    RETURNING *
  `

  return result[0] as Question
}

export async function updateQuestion(
  id: string,
  data: { text?: string; difficulty?: QuestionDifficulty },
): Promise<Question> {
  const updates: string[] = []
  const values: any[] = []

  if (data.text !== undefined) {
    updates.push(`text = $${values.length + 1}`)
    values.push(data.text)
  }

  if (data.difficulty !== undefined) {
    updates.push(`difficulty = $${values.length + 1}`)
    values.push(data.difficulty)
  }

  updates.push("updated_at = NOW()")

  const result = await sql`
    UPDATE questions 
    SET ${sql(updates.join(", "))}
    WHERE id = ${id}
    RETURNING *
  `.values(...values, id)

  return result[0] as Question
}

export async function deleteQuestion(id: string) {
  await sql`DELETE FROM questions WHERE id = ${id}`
}

// Logging queries
export async function logQuery(data: {
  documentId: string
  query: string
  topK: number
  results: unknown
  latency: number
}) {
  await sql`
    INSERT INTO query_logs (document_id, query, top_k, results, latency)
    VALUES (${data.documentId}, ${data.query}, ${data.topK}, ${JSON.stringify(data.results)}, ${data.latency})
  `
}

export async function logGeneration(data: {
  documentId: string
  provider: string
  model: string
  levels: string[]
  questionsCount: number
  tokensUsed?: number
  latency: number
  estimatedCost?: number
  success?: boolean
  errorMessage?: string
}) {
  await sql`
    INSERT INTO generation_logs (
      document_id, provider, model, levels, questions_count, 
      tokens_used, latency, estimated_cost, success, error_message
    )
    VALUES (
      ${data.documentId}, 
      ${data.provider}, 
      ${data.model}, 
      ${data.levels}, 
      ${data.questionsCount},
      ${data.tokensUsed || null}, 
      ${data.latency}, 
      ${data.estimatedCost || null}, 
      ${data.success ?? true}, 
      ${data.errorMessage || null}
    )
  `
}

// Analytics queries
export async function getDocumentStats(documentId: string) {
  const result = await sql`
    SELECT 
      d.*,
      (SELECT COUNT(*) FROM chunks WHERE document_id = d.id) as chunk_count,
      (SELECT COUNT(*) FROM questions WHERE document_id = d.id) as question_count,
      (SELECT COUNT(*) FROM query_logs WHERE document_id = d.id) as query_count,
      (SELECT COUNT(*) FROM generation_logs WHERE document_id = d.id) as generation_count
    FROM documents d
    WHERE d.id = ${documentId}
  `

  return result[0] || null
}
