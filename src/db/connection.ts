import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Load environment variables from .env file (only in non-production environments)
if (process.env.NODE_ENV !== 'production') {
  config()
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const sql = neon(process.env.DATABASE_URL)

// Create the database instance
export const db = drizzle(sql, { schema })

// Export the connection for raw SQL queries if needed
export { sql }