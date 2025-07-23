import { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../src/db/connection'
import { dojos } from '../src/db/schema'
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
          // Get single dojo by ID
          const dojo = await db.select().from(dojos).where(eq(dojos.id, req.query.id as string))
          if (dojo.length === 0) {
            return res.status(404).json({ success: false, error: 'Dojo not found' })
          }
          return res.status(200).json({ success: true, data: dojo[0] })
        } else {
          // Get all dojos
          const allDojos = await db.select().from(dojos)
          return res.status(200).json({ success: true, data: allDojos })
        }

      case 'POST':
        // Create new dojo
        const newDojo = req.body
        if (!newDojo.id || !newDojo.name) {
          return res.status(400).json({ success: false, error: 'Missing required fields' })
        }

        const [createdDojo] = await db.insert(dojos).values({
          id: newDojo.id,
          name: newDojo.name,
          location: newDojo.location,
          logo: newDojo.logo,
          updatedAt: new Date()
        }).returning()

        return res.status(201).json({ success: true, data: createdDojo })

      case 'PUT':
        // Update dojo
        const dojoId = req.query.id as string
        const updateData = req.body
        
        if (!dojoId) {
          return res.status(400).json({ success: false, error: 'Dojo ID required' })
        }

        const [updatedDojo] = await db
          .update(dojos)
          .set({
            ...updateData,
            updatedAt: new Date()
          })
          .where(eq(dojos.id, dojoId))
          .returning()

        if (!updatedDojo) {
          return res.status(404).json({ success: false, error: 'Dojo not found' })
        }

        return res.status(200).json({ success: true, data: updatedDojo })

      case 'DELETE':
        // Delete dojo
        const deleteDojoId = req.query.id as string
        
        if (!deleteDojoId) {
          return res.status(400).json({ success: false, error: 'Dojo ID required' })
        }

        await db.delete(dojos).where(eq(dojos.id, deleteDojoId))
        return res.status(200).json({ success: true, message: 'Dojo deleted successfully' })

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