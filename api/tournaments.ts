import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { tournaments } from '../src/db/schema'
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
          // Get single tournament by ID
          const tournament = await db.select().from(tournaments).where(eq(tournaments.id, req.query.id as string))
          if (tournament.length === 0) {
            return res.status(404).json({ success: false, error: 'Tournament not found' })
          }
          return res.status(200).json({ success: true, data: tournament[0] })
        } else {
          // Get all tournaments
          const allTournaments = await db.select().from(tournaments)
          return res.status(200).json({ success: true, data: allTournaments })
        }

      case 'POST':
        // Create new tournament
        const newTournament = req.body
        if (!newTournament.id || !newTournament.name) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdTournament] = await db.insert(tournaments).values({
          id: newTournament.id,
          name: newTournament.name,
          description: newTournament.description,
          status: newTournament.status || 'registration',
          isActive: newTournament.isActive ?? true,
          maxParticipants: newTournament.maxParticipants,
          seedGroups: newTournament.seedGroups || [],
          mainBracket: newTournament.mainBracket,
          completedAt: newTournament.completedAt,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdTournament })

      case 'PUT':
        // Update tournament
        const tournamentId = req.query.id as string
        const updateData = req.body
        
        if (!tournamentId) {
          return res.status(400).json({ success: false, error: 'Tournament ID required' })
        }

        const [updatedTournament] = await db
          .update(tournaments)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(tournaments.id, tournamentId))
          .returning()

        if (!updatedTournament) {
          return res.status(404).json({ success: false, error: 'Tournament not found' })
        }

        return res.status(200).json({ success: true, data: updatedTournament })

      case 'DELETE':
        // Delete tournament
        const deleteTournamentId = req.query.id as string
        
        if (!deleteTournamentId) {
          return res.status(400).json({ success: false, error: 'Tournament ID required' })
        }

        await db.delete(tournaments).where(eq(tournaments.id, deleteTournamentId))
        return res.status(200).json({ success: true, message: 'Tournament deleted successfully' })

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