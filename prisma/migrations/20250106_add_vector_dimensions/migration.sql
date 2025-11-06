-- Add dimensions column to embeddings table
-- This allows different providers to use different vector dimensions
-- OpenAI: 1536, Google: 768

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

-- Update dimensions for existing embeddings based on provider
UPDATE embeddings 
SET dimensions = 1536 
WHERE provider = 'openai' AND dimensions IS NULL;

UPDATE embeddings 
SET dimensions = 768 
WHERE provider = 'google' AND dimensions IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_provider ON embeddings(provider);

-- Add comment
COMMENT ON COLUMN embeddings.dimensions IS 'Vector dimensions (OpenAI: 1536, Google: 768)';
