import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { matches } from '../src/db/schema'
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
          // Get single match by ID
          const match = await db.select().from(matches).where(eq(matches.id, req.query.id as string))
          if (match.length === 0) {
            return res.status(404).json({ success: false, error: 'Match not found' })
          }
          return res.status(200).json({ success: true, data: match[0] })
        } else {
          // Get all matches
          const allMatches = await db.select().from(matches)
          return res.status(200).json({ success: true, data: allMatches })
        }

      case 'POST':
        // Create new match
        const newMatch = req.body
        if (!newMatch.id || !newMatch.tournamentId || !newMatch.team1Id || !newMatch.team2Id) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdMatch] = await db.insert(matches).values({
          id: newMatch.id,
          tournamentId: newMatch.tournamentId,
          team1Id: newMatch.team1Id,
          team2Id: newMatch.team2Id,
          courtId: newMatch.courtId,
          stage: newMatch.stage,
          status: newMatch.status || 'scheduled',
          currentPlayerSet: newMatch.currentPlayerSet || 1,
          scores: newMatch.scores,
          winnerId: newMatch.winnerId,
          overtime: newMatch.overtime,
          scheduledAt: newMatch.scheduledAt,
          startedAt: newMatch.startedAt,
          completedAt: newMatch.completedAt,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdMatch })

      case 'PUT':
        // Update match
        const matchId = req.query.id as string
        const updateData = req.body
        
        if (!matchId) {
          return res.status(400).json({ success: false, error: 'Match ID required' })
        }

        const [updatedMatch] = await db
          .update(matches)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(matches.id, matchId))
          .returning()

        if (!updatedMatch) {
          return res.status(404).json({ success: false, error: 'Match not found' })
        }

        return res.status(200).json({ success: true, data: updatedMatch })

      case 'DELETE':
        // Delete match
        const deleteMatchId = req.query.id as string
        
        if (!deleteMatchId) {
          return res.status(400).json({ success: false, error: 'Match ID required' })
        }

        await db.delete(matches).where(eq(matches.id, deleteMatchId))
        return res.status(200).json({ success: true, message: 'Match deleted successfully' })

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