-- Fix vector column to remove dimension constraint
-- This allows vectors of any dimension (768 for Google, 1536 for OpenAI)

-- Step 1: Drop existing vector column with dimension constraint
ALTER TABLE embeddings DROP COLUMN IF EXISTS vector;

-- Step 2: Add vector column back without dimension specification
ALTER TABLE embeddings ADD COLUMN vector vector;

-- Step 3: Add dimensions tracking column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'embeddings' 
        AND column_name = 'dimensions'
    ) THEN
        ALTER TABLE embeddings ADD COLUMN dimensions INTEGER;
    END IF;
END $$;

-- Step 4: Create index on provider for faster lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_provider ON embeddings(provider);

-- Add comment
COMMENT ON COLUMN embeddings.dimensions IS 'Vector dimensions (OpenAI: 1536, Google: 768)';
COMMENT ON COLUMN embeddings.vector IS 'Embedding vector (dimension-agnostic)';
