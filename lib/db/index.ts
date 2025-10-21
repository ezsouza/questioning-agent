import { neon } from "@neondatabase/serverless"

/**
 * Neon SQL client singleton
 * Uses the Neon serverless driver for direct SQL queries
 */

const globalForNeon = globalThis as unknown as {
  sql: ReturnType<typeof neon> | undefined
}

// Use DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Database connection string not found. Please set DATABASE_URL or NEON_DATABASE_URL environment variable.'
  )
}

export const sql = globalForNeon.sql ?? neon(connectionString)

if (process.env.NODE_ENV !== "production") globalForNeon.sql = sql

export default sql
