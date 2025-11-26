-- Add Question Feedback System
-- This migration adds support for user feedback on generated questions

-- CreateEnum for FeedbackRating
DO $$ BEGIN
    CREATE TYPE "feedback_rating" AS ENUM ('LIKE', 'DISLIKE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for FeedbackReason
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

-- CreateTable QuestionFeedback
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
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "question_feedback_question_id_user_id_key" 
    ON "question_feedback"("question_id", "user_id");

CREATE INDEX IF NOT EXISTS "question_feedback_question_id_idx" 
    ON "question_feedback"("question_id");

CREATE INDEX IF NOT EXISTS "question_feedback_user_id_idx" 
    ON "question_feedback"("user_id");

CREATE INDEX IF NOT EXISTS "question_feedback_rating_idx" 
    ON "question_feedback"("rating");

CREATE INDEX IF NOT EXISTS "question_feedback_created_at_idx" 
    ON "question_feedback"("created_at");

-- AddForeignKey
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

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_question_feedback_updated_at 
        BEFORE UPDATE ON question_feedback 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
