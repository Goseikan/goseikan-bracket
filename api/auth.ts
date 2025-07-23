import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { users } from '../src/db/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'POST') {
      const { action, email, password, userData } = req.body

      switch (action) {
        case 'login':
          if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' })
          }

          // Find user by email
          const user = await db.select().from(users).where(eq(users.email, email))
          
          if (user.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' })
          }

          // In a real app, you would hash and compare passwords
          // For demo purposes, we're doing a simple comparison
          if (user[0].password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' })
          }

          // Return user data (excluding password)
          const { password: _, ...userWithoutPassword } = user[0]
          return res.status(200).json({ 
            success: true, 
            data: userWithoutPassword,
            message: 'Login successful'
          })

        case 'register':
          if (!userData || !userData.email || !userData.password || !userData.fullName) {
            return res.status(400).json({ success: false, error: 'Missing required fields' })
          }

          // Check if user already exists
          const existingUser = await db.select().from(users).where(eq(users.email, userData.email))
          
          if (existingUser.length > 0) {
            return res.status(409).json({ success: false, error: 'User already exists' })
          }

          // Create new user
          const [newUser] = await db.insert(users).values({
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            password: userData.password, // In real app, hash this
            dateOfBirth: userData.dateOfBirth,
            dojoId: userData.dojoId,
            teamId: userData.teamId,
            role: userData.role || 'participant',
            kendoRank: userData.kendoRank,
            updatedAt: new Date()
          }).returning()

          // Return user data (excluding password)
          const { password: __, ...newUserWithoutPassword } = newUser
          return res.status(201).json({ 
            success: true, 
            data: newUserWithoutPassword,
            message: 'Registration successful'
          })

        default:
          return res.status(400).json({ success: false, error: 'Invalid action' })
      }
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Auth API Error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}