import { auth } from "./lib/auth/auth"

/**
 * Script to generate Better Auth database schema
 * Run: tsx scripts/generate-auth-schema.ts
 */

async function generateSchema() {
  try {
    console.log("🔧 Generating Better Auth database schema...")
    
    // Better Auth can generate its own schema
    console.log("\n📋 Tables needed for Better Auth:")
    console.log("- users (already exists, needs email_verified and image columns)")
    console.log("- account (for OAuth providers)")
    console.log("- session (for session management)")
    console.log("- verification (for email verification)")
    
    console.log("\n✅ Run the migration script:")
    console.log("psql $DATABASE_URL -f scripts/better-auth-migration.sql")
    
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

generateSchema()
