import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { users } from '../src/db/schema'
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
          // Get single user by ID
          const user = await db.select().from(users).where(eq(users.id, req.query.id as string))
          if (user.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' })
          }
          return res.status(200).json({ success: true, data: user[0] })
        } else {
          // Get all users
          const allUsers = await db.select().from(users)
          return res.status(200).json({ success: true, data: allUsers })
        }

      case 'POST':
        // Create new user
        const newUser = req.body
        if (!newUser.id || !newUser.fullName || !newUser.email) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdUser] = await db.insert(users).values({
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          password: newUser.password,
          dateOfBirth: newUser.dateOfBirth,
          dojoId: newUser.dojoId,
          teamId: newUser.teamId,
          role: newUser.role || 'participant',
          kendoRank: newUser.kendoRank,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdUser })

      case 'PUT':
        // Update user
        const userId = req.query.id as string
        const updateData = req.body
        
        if (!userId) {
          return res.status(400).json({ success: false, error: 'User ID required' })
        }

        const [updatedUser] = await db
          .update(users)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
          .returning()

        if (!updatedUser) {
          return res.status(404).json({ success: false, error: 'User not found' })
        }

        return res.status(200).json({ success: true, data: updatedUser })

      case 'DELETE':
        // Delete user
        const deleteUserId = req.query.id as string
        
        if (!deleteUserId) {
          return res.status(400).json({ success: false, error: 'User ID required' })
        }

        await db.delete(users).where(eq(users.id, deleteUserId))
        return res.status(200).json({ success: true, message: 'User deleted successfully' })

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