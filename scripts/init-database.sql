-- Initialize database schema for Questioning Agent
-- Run this script to set up all tables and extensions

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  image TEXT,
  password TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document status enum
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('UPLOADING', 'PROCESSING', 'INDEXED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  blob_url TEXT NOT NULL,
  status document_status DEFAULT 'UPLOADING',
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, version)
);

-- Chunks table
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_position ON chunks(position);

-- Embeddings table with vector support
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chunk_id TEXT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  vector vector(1536),
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chunk_id, model)
);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);

-- Cognitive level enum
DO $$ BEGIN
  CREATE TYPE cognitive_level AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Question difficulty enum
DO $$ BEGIN
  CREATE TYPE question_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  level cognitive_level NOT NULL,
  difficulty question_difficulty NOT NULL,
  evidence TEXT[] NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_document_id ON questions(document_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- Query logs table
CREATE TABLE IF NOT EXISTS query_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  top_k INTEGER NOT NULL,
  results JSONB NOT NULL,
  latency INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_logs_document_id ON query_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON query_logs(created_at);

-- Generation logs table
CREATE TABLE IF NOT EXISTS generation_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  levels TEXT[] NOT NULL,
  questions_count INTEGER NOT NULL,
  tokens_used INTEGER,
  latency INTEGER NOT NULL,
  estimated_cost DECIMAL(10, 6),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_document_id ON generation_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_provider ON generation_logs(provider);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at);
