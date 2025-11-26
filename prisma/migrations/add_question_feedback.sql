-- CreateEnum for FeedbackRating
CREATE TYPE "feedback_rating" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum for FeedbackReason
CREATE TYPE "feedback_reason" AS ENUM ('OUT_OF_CONTEXT', 'INCORRECT_ANSWER', 'POORLY_FORMULATED', 'WRONG_COGNITIVE_LEVEL', 'DUPLICATE', 'OTHER');

-- CreateTable QuestionFeedback
CREATE TABLE "question_feedback" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" "feedback_rating" NOT NULL,
    "reasons" "feedback_reason"[] DEFAULT ARRAY[]::"feedback_reason"[],
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_feedback_question_id_user_id_key" ON "question_feedback"("question_id", "user_id");

-- CreateIndex
CREATE INDEX "question_feedback_question_id_idx" ON "question_feedback"("question_id");

-- CreateIndex
CREATE INDEX "question_feedback_user_id_idx" ON "question_feedback"("user_id");

-- CreateIndex
CREATE INDEX "question_feedback_rating_idx" ON "question_feedback"("rating");

-- CreateIndex
CREATE INDEX "question_feedback_created_at_idx" ON "question_feedback"("created_at");

-- AddForeignKey
ALTER TABLE "question_feedback" ADD CONSTRAINT "question_feedback_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
