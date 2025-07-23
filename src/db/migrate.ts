import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import { neon } from '@neondatabase/serverless'

// Load environment variables from .env file
config()

/**
 * Database migration script for Neon PostgreSQL
 * Run this script to create the database schema
 */

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

async function runMigrations() {
  console.log('🚀 Running database migrations...')
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Database migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}

export { runMigrations }