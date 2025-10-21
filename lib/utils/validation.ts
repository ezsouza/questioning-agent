import { z } from "zod"
import { COGNITIVE_LEVELS, DIFFICULTY_LEVELS } from "@/lib/constants"

/**
 * Validation schemas using Zod
 */

export const cognitiveLevelSchema = z.enum(COGNITIVE_LEVELS)

export const difficultySchema = z.enum(DIFFICULTY_LEVELS)

export const documentUploadSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string(),
  size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024), // 10MB
})

export const generationRequestSchema = z.object({
  documentId: z.string().uuid(),
  levels: z.array(cognitiveLevelSchema).min(1).max(6),
  questionsPerLevel: z.number().int().positive().max(10).default(3),
  provider: z.enum(["openai", "google"]).optional(),
})

export const queryRequestSchema = z.object({
  documentId: z.string().uuid(),
  query: z.string().min(1).max(1000),
  topK: z.number().int().positive().max(20).default(5),
})

export const exportRequestSchema = z.object({
  documentId: z.string().uuid().optional(),
  format: z.enum(["json", "csv"]),
  filters: z
    .object({
      levels: z.array(cognitiveLevelSchema).optional(),
      difficulty: z.array(difficultySchema).optional(),
    })
    .optional(),
})
