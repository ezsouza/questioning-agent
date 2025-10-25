/**
 * Application configuration
 * Centralizes environment variables and app settings
 */

export const config = {
  // AI Provider Configuration
  ai: {
    provider: (process.env.AI_PROVIDER || "openai") as "openai" | "google",
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY || "",
      model: process.env.GOOGLE_MODEL || "gemini-2.0-flash-exp",
      embeddingModel: process.env.GOOGLE_EMBEDDING_MODEL || "text-embedding-004",
    },
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || "",
  },

  // Storage Configuration
  storage: {
    provider: "r2" as const,
    r2: {
      accountId: process.env.R2_ACCOUNT_ID || "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      bucketName: process.env.R2_BUCKET_NAME || "questioning-agent-storage",
      publicUrl: process.env.R2_PUBLIC_URL || "",
      endpoint: process.env.R2_ENDPOINT || "",
      region: process.env.R2_REGION || "auto",
    },
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxAvatarSize: 5 * 1024 * 1024, // 5MB
      userStorageLimit: 300 * 1024 * 1024, // 300MB
    },
  },

  // Better Auth Configuration
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || "",
    url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  },

  // RAG Configuration
  rag: {
    chunkSize: Number.parseInt(process.env.CHUNK_SIZE || "1000", 10),
    chunkOverlap: Number.parseInt(process.env.CHUNK_OVERLAP || "200", 10),
    topK: Number.parseInt(process.env.TOP_K || "5", 10),
    similarityThreshold: Number.parseFloat(process.env.SIMILARITY_THRESHOLD || "0.7"),
  },

  // Question Generation Configuration
  generation: {
    questionsPerLevel: Number.parseInt(process.env.QUESTIONS_PER_LEVEL || "3", 10),
    maxRetries: Number.parseInt(process.env.MAX_RETRIES || "3", 10),
    temperature: Number.parseFloat(process.env.TEMPERATURE || "0.7"),
  },

  // Application Settings
  app: {
    name: "Questioning Agent",
    description: "RAG-powered question generation system",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [".pdf", ".docx", ".txt", ".md"],
  },
} as const

// Validation helper
export function validateConfig() {
  const errors: string[] = []

  if (!config.database.url) {
    errors.push("DATABASE_URL is required")
  }

  if (config.ai.provider === "openai" && !config.ai.openai.apiKey) {
    errors.push("OPENAI_API_KEY is required when using OpenAI provider")
  }

  if (config.ai.provider === "google" && !config.ai.google.apiKey) {
    errors.push("GOOGLE_API_KEY is required when using Google provider")
  }

  if (!config.auth.secret) {
    errors.push("BETTER_AUTH_SECRET is required")
  }

  // R2 Storage validation
  if (config.storage.provider === "r2") {
    if (!config.storage.r2.accountId) {
      errors.push("R2_ACCOUNT_ID is required for Cloudflare R2")
    }
    if (!config.storage.r2.accessKeyId) {
      errors.push("R2_ACCESS_KEY_ID is required for Cloudflare R2")
    }
    if (!config.storage.r2.secretAccessKey) {
      errors.push("R2_SECRET_ACCESS_KEY is required for Cloudflare R2")
    }
    if (!config.storage.r2.bucketName) {
      errors.push("R2_BUCKET_NAME is required for Cloudflare R2")
    }
    if (!config.storage.r2.endpoint) {
      errors.push("R2_ENDPOINT is required for Cloudflare R2")
    }
  }

  return { valid: errors.length === 0, errors }
}
