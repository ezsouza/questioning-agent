/**
 * Script to fix vector dimensions compatibility
 * Removes dimension constraint from vector column and adds dimensions tracking
 */

import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

// Load environment variables
config()

async function fixVectorDimensions() {
  // Use direct URL for migration (not pooled)
  const sql = neon(process.env.DIRECT_URL!)
  
  try {
    console.log("[MIGRATION] Step 1: Dropping existing vector column...")
    
    // Drop the vector column with dimension constraint
    await sql`
      ALTER TABLE embeddings DROP COLUMN IF EXISTS vector
    `
    
    console.log("[MIGRATION] Step 2: Recreating vector column without dimension constraint...")
    
    // Add vector column back without dimension specification
    await sql`
      ALTER TABLE embeddings ADD COLUMN vector vector
    `
    
    console.log("[MIGRATION] Step 3: Adding dimensions column...")

    // Add dimensions column if it doesn't exist
    await sql`
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
    `

    console.log("[MIGRATION] Step 4: Creating index on provider column...")
    
    // Add index for provider lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_embeddings_provider ON embeddings(provider)
    `

    console.log("[MIGRATION] Migration completed successfully!")
    console.log("[MIGRATION] The vector column now accepts any dimension (768 or 1536)")
    console.log("[MIGRATION] Note: Vector similarity index will be created per embedding model")

  } catch (error) {
    console.error("[MIGRATION] Error:", error)
    throw error
  } finally {
    process.exit(0)
  }
}

fixVectorDimensions()
