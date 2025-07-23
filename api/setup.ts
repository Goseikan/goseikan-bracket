import { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * One-time setup endpoint for initializing the database
 * This endpoint runs migrations and seeds the database with sample data
 * Should only be called once during initial deployment
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed - use POST' 
    })
  }

  // Basic security check - only allow setup in production with proper environment
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ 
      success: false, 
      error: 'DATABASE_URL not configured' 
    })
  }

  try {
    console.log('🚀 Starting database setup...')

    // Import migration and seeding functions
    const { runMigrations } = await import('../src/db/migrate')
    const { seedDatabase } = await import('../src/db/seed')

    // Run migrations first
    console.log('📋 Running database migrations...')
    await runMigrations()

    // Then seed the database
    console.log('🌱 Seeding database with sample data...')
    await seedDatabase()

    console.log('✅ Database setup completed successfully!')

    return res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}