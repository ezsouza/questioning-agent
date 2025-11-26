/**
 * Script to apply the question feedback migration
 * Run with: tsx scripts/apply-feedback-migration.ts
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { neon } from '@neondatabase/serverless'

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL or DIRECT_URL not found in environment')
    process.exit(1)
  }

  const sql = neon(connectionString)

  try {
    console.log('🚀 Applying migration...')

    // Step 1: Create feedback_rating enum
    console.log('1. Creating feedback_rating enum...')
    await sql`
      DO $$ BEGIN
          CREATE TYPE "feedback_rating" AS ENUM ('LIKE', 'DISLIKE');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `

    // Step 2: Create feedback_reason enum
    console.log('2. Creating feedback_reason enum...')
    await sql`
      DO $$ BEGIN
          CREATE TYPE "feedback_reason" AS ENUM (
              'OUT_OF_CONTEXT',
              'INCORRECT_ANSWER',
              'POORLY_FORMULATED',
              'WRONG_COGNITIVE_LEVEL',
              'DUPLICATE',
              'OTHER'
          );
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `

    // Step 3: Create question_feedback table
    console.log('3. Creating question_feedback table...')
    await sql`
      CREATE TABLE IF NOT EXISTS "question_feedback" (
          "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
          "question_id" TEXT NOT NULL,
          "user_id" TEXT NOT NULL,
          "rating" "feedback_rating" NOT NULL,
          "reasons" "feedback_reason"[] DEFAULT ARRAY[]::"feedback_reason"[],
          "comment" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "question_feedback_pkey" PRIMARY KEY ("id")
      )
    `

    // Step 4: Create indexes
    console.log('4. Creating indexes...')
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "question_feedback_question_id_user_id_key" ON "question_feedback"("question_id", "user_id")`
    await sql`CREATE INDEX IF NOT EXISTS "question_feedback_question_id_idx" ON "question_feedback"("question_id")`
    await sql`CREATE INDEX IF NOT EXISTS "question_feedback_user_id_idx" ON "question_feedback"("user_id")`
    await sql`CREATE INDEX IF NOT EXISTS "question_feedback_rating_idx" ON "question_feedback"("rating")`
    await sql`CREATE INDEX IF NOT EXISTS "question_feedback_created_at_idx" ON "question_feedback"("created_at")`

    // Step 5: Add foreign key
    console.log('5. Adding foreign key constraint...')
    await sql`
      DO $$ BEGIN
          ALTER TABLE "question_feedback" 
              ADD CONSTRAINT "question_feedback_question_id_fkey" 
              FOREIGN KEY ("question_id") 
              REFERENCES "questions"("id") 
              ON DELETE CASCADE 
              ON UPDATE CASCADE;
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `

    // Step 6: Create trigger function
    console.log('6. Creating trigger function...')
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    // Step 7: Create trigger
    console.log('7. Creating trigger...')
    await sql`
      DO $$ BEGIN
          CREATE TRIGGER update_question_feedback_updated_at 
              BEFORE UPDATE ON question_feedback 
              FOR EACH ROW 
              EXECUTE FUNCTION update_updated_at_column();
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `

    console.log('\n✅ Migration applied successfully!')
    console.log('\nNew tables created:')
    console.log('  - question_feedback')
    console.log('\nNew enums created:')
    console.log('  - feedback_rating (LIKE, DISLIKE)')
    console.log('  - feedback_reason (OUT_OF_CONTEXT, INCORRECT_ANSWER, etc.)')

    // Verify the table exists
    const verifyResult = await sql`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'question_feedback'
    `
    
    if (verifyResult[0]?.count > 0) {
      console.log('\n✓ Verified: question_feedback table exists')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration()
