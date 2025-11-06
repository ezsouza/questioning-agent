-- Migration: Add Cloudflare R2 Storage Support
-- Date: 2025-01-24
-- Description: Adds R2 storage fields, storage quota tracking, and audit table

-- Add storage fields to users table
ALTER TABLE users 
ADD COLUMN storage_used BIGINT NOT NULL DEFAULT 0,
ADD COLUMN storage_limit BIGINT NOT NULL DEFAULT 314572800, -- 300MB in bytes
ADD COLUMN image_key TEXT;

-- Add R2 fields to documents table
ALTER TABLE documents 
ADD COLUMN r2_key TEXT,
ADD COLUMN r2_bucket TEXT,
ADD COLUMN content_type TEXT,
ADD COLUMN checksum TEXT,
ADD COLUMN metadata JSONB,
ADD COLUMN deleted_at TIMESTAMP;

-- Make blobUrl nullable (for transition period)
ALTER TABLE documents 
ALTER COLUMN blob_url DROP NOT NULL;

-- Create indices for new fields
CREATE INDEX idx_documents_r2_key ON documents(r2_key);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);

-- Create storage_audit table
CREATE TABLE storage_audit (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  document_id TEXT,
  file_name TEXT,
  file_size BIGINT NOT NULL,
  previous_usage BIGINT NOT NULL,
  new_usage BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indices for storage_audit
CREATE INDEX idx_storage_audit_user_id ON storage_audit(user_id);
CREATE INDEX idx_storage_audit_created_at ON storage_audit(created_at);

-- Calculate current storage usage for existing users
UPDATE users u
SET storage_used = COALESCE(
  (SELECT SUM(size)::BIGINT FROM documents WHERE user_id = u.id AND deleted_at IS NULL),
  0
);

-- Add comment for documentation
COMMENT ON COLUMN users.storage_used IS 'Total storage used by user in bytes';
COMMENT ON COLUMN users.storage_limit IS 'Maximum storage allowed for user in bytes (default: 300MB)';
COMMENT ON COLUMN users.image_key IS 'Cloudflare R2 object key for profile image';
COMMENT ON COLUMN documents.r2_key IS 'Cloudflare R2 object key';
COMMENT ON COLUMN documents.r2_bucket IS 'Cloudflare R2 bucket name';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp';
COMMENT ON TABLE storage_audit IS 'Audit log for storage operations';
