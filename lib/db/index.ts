import { neon } from "@neondatabase/serverless"

/**
 * Neon SQL client singleton
 * Uses the Neon serverless driver for direct SQL queries
 */

const globalForNeon = globalThis as unknown as {
  sql: ReturnType<typeof neon> | undefined
}

export const sql = globalForNeon.sql ?? neon(process.env.NEON_NEON_DATABASE_URL!)

if (process.env.NODE_ENV !== "production") globalForNeon.sql = sql

export default sql
