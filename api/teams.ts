import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { teams } from '../src/db/schema'
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
          // Get single team by ID
          const team = await db.select().from(teams).where(eq(teams.id, req.query.id as string))
          if (team.length === 0) {
            return res.status(404).json({ success: false, error: 'Team not found' })
          }
          return res.status(200).json({ success: true, data: team[0] })
        } else {
          // Get all teams
          const allTeams = await db.select().from(teams)
          return res.status(200).json({ success: true, data: allTeams })
        }

      case 'POST':
        // Create new team
        const newTeam = req.body
        if (!newTeam.id || !newTeam.name || !newTeam.dojoId) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdTeam] = await db.insert(teams).values({
          id: newTeam.id,
          name: newTeam.name,
          dojoId: newTeam.dojoId,
          logo: newTeam.logo,
          seedRanking: newTeam.seedRanking,
          finalRanking: newTeam.finalRanking,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdTeam })

      case 'PUT':
        // Update team
        const teamId = req.query.id as string
        const updateData = req.body
        
        if (!teamId) {
          return res.status(400).json({ success: false, error: 'Team ID required' })
        }

        const [updatedTeam] = await db
          .update(teams)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(teams.id, teamId))
          .returning()

        if (!updatedTeam) {
          return res.status(404).json({ success: false, error: 'Team not found' })
        }

        return res.status(200).json({ success: true, data: updatedTeam })

      case 'DELETE':
        // Delete team
        const deleteTeamId = req.query.id as string
        
        if (!deleteTeamId) {
          return res.status(400).json({ success: false, error: 'Team ID required' })
        }

        await db.delete(teams).where(eq(teams.id, deleteTeamId))
        return res.status(200).json({ success: true, message: 'Team deleted successfully' })

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