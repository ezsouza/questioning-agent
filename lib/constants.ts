/**
 * Application constants
 */

export const COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const

export const COGNITIVE_LEVEL_DESCRIPTIONS = {
  remember: "Recall facts and basic concepts",
  understand: "Explain ideas or concepts",
  apply: "Use information in new situations",
  analyze: "Draw connections among ideas",
  evaluate: "Justify a stand or decision",
  create: "Produce new or original work",
} as const

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const

export const DOCUMENT_STATUS = ["uploading", "processing", "indexed", "failed"] as const

export const SUPPORTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const API_ROUTES = {
  upload: "/api/upload",
  ingest: "/api/ingest",
  embed: "/api/embed",
  index: "/api/index",
  query: "/api/query",
  generate: "/api/generate",
  export: "/api/export",
  documents: "/api/documents",
  questions: "/api/questions",
} as const
