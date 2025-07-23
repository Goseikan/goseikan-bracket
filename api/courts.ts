import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { courts } from '../src/db/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          // Get single court by ID
          const court = await db.select().from(courts).where(eq(courts.id, req.query.id as string))
          if (court.length === 0) {
            return res.status(404).json({ success: false, error: 'Court not found' })
          }
          return res.status(200).json({ success: true, data: court[0] })
        } else {
          // Get all courts
          const allCourts = await db.select().from(courts)
          return res.status(200).json({ success: true, data: allCourts })
        }

      case 'POST':
        // Create new court
        const newCourt = req.body
        if (!newCourt.id || !newCourt.name) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdCourt] = await db.insert(courts).values({
          id: newCourt.id,
          name: newCourt.name,
          isActive: newCourt.isActive ?? true,
          currentMatchId: newCourt.currentMatchId,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdCourt })

      case 'PUT':
        // Update court
        const courtId = req.query.id as string
        const updateData = req.body
        
        if (!courtId) {
          return res.status(400).json({ success: false, error: 'Court ID required' })
        }

        const [updatedCourt] = await db
          .update(courts)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(courts.id, courtId))
          .returning()

        if (!updatedCourt) {
          return res.status(404).json({ success: false, error: 'Court not found' })
        }

        return res.status(200).json({ success: true, data: updatedCourt })

      case 'DELETE':
        // Delete court
        const deleteCourtId = req.query.id as string
        
        if (!deleteCourtId) {
          return res.status(400).json({ success: false, error: 'Court ID required' })
        }

        await db.delete(courts).where(eq(courts.id, deleteCourtId))
        return res.status(200).json({ success: true, message: 'Court deleted successfully' })

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}