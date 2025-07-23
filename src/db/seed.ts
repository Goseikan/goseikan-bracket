import { config } from 'dotenv'
import { db } from './connection'
import { users, dojos, teams, tournaments, courts, matches } from './schema'
import { generateSampleTournamentData } from '../utils/sampleData'

// Load environment variables from .env file
config()

/**
 * Database seeding script for initial tournament data
 * Seeds the database with sample tournament data
 */

async function seedDatabase() {
  console.log('🌱 Seeding database with sample tournament data...')
  
  try {
    // Generate sample data
    const sampleData = generateSampleTournamentData()
    
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...')
    await db.delete(matches)
    await db.delete(users)
    await db.delete(teams)
    await db.delete(courts)
    await db.delete(tournaments)
    await db.delete(dojos)
    
    // Insert data in correct order (respecting foreign key constraints)
    console.log('📥 Inserting sample data...')
    
    // Insert dojos first
    if (sampleData.dojos.length > 0) {
      const dojoData = sampleData.dojos.map(dojo => ({
        id: dojo.id,
        name: dojo.name,
        location: dojo.location || null,
        logo: dojo.logo || null,
        createdAt: new Date(dojo.createdAt),
        updatedAt: new Date(dojo.updatedAt)
      }))
      await db.insert(dojos).values(dojoData)
      console.log(`✅ Inserted ${dojoData.length} dojos`)
    }
    
    // Insert teams (depends on dojos)
    if (sampleData.teams.length > 0) {
      const teamData = sampleData.teams.map(team => ({
        id: team.id,
        name: team.name,
        dojoId: team.dojoId,
        logo: team.logo || null,
        seedRanking: team.seedRanking || null,
        finalRanking: team.finalRanking || null,
        createdAt: new Date(team.createdAt),
        updatedAt: new Date(team.updatedAt)
      }))
      await db.insert(teams).values(teamData)
      console.log(`✅ Inserted ${teamData.length} teams`)
    }
    
    // Insert users (depends on dojos and teams)
    if (sampleData.users.length > 0) {
      const userData = sampleData.users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        dateOfBirth: user.dateOfBirth,
        dojoId: user.dojoId,
        teamId: user.teamId || null,
        role: user.role,
        kendoRank: user.kendoRank,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }))
      await db.insert(users).values(userData)
      console.log(`✅ Inserted ${userData.length} users`)
    }
    
    // Insert courts
    if (sampleData.courts.length > 0) {
      const courtData = sampleData.courts.map(court => ({
        id: court.id,
        name: court.name,
        isActive: court.isActive,
        currentMatchId: court.currentMatchId || null,
        createdAt: new Date(court.createdAt),
        updatedAt: new Date(court.updatedAt)
      }))
      await db.insert(courts).values(courtData)
      console.log(`✅ Inserted ${courtData.length} courts`)
    }
    
    // Insert tournaments
    if (sampleData.tournaments.length > 0) {
      const tournamentData = sampleData.tournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        description: tournament.description || null,
        status: tournament.status,
        isActive: tournament.isActive,
        maxParticipants: tournament.maxParticipants,
        seedGroups: tournament.seedGroups || [],
        mainBracket: tournament.mainBracket || null,
        createdAt: new Date(tournament.createdAt),
        completedAt: tournament.completedAt ? new Date(tournament.completedAt) : null,
        updatedAt: new Date(tournament.updatedAt)
      }))
      await db.insert(tournaments).values(tournamentData)
      console.log(`✅ Inserted ${tournamentData.length} tournaments`)
    }
    
    // Insert matches (depends on tournaments, teams, courts)
    if (sampleData.matches.length > 0) {
      const matchData = sampleData.matches.map(match => ({
        id: match.id,
        tournamentId: match.tournamentId,
        team1Id: match.team1Id,
        team2Id: match.team2Id,
        courtId: match.courtId || null,
        stage: match.stage,
        status: match.status,
        currentPlayerSet: match.currentPlayerSet,
        scores: match.scores,
        winnerId: match.winnerId || null,
        overtime: match.overtime || null,
        scheduledAt: match.scheduledAt ? new Date(match.scheduledAt) : null,
        startedAt: match.startedAt ? new Date(match.startedAt) : null,
        completedAt: match.completedAt ? new Date(match.completedAt) : null,
        createdAt: new Date(match.createdAt),
        updatedAt: new Date(match.updatedAt)
      }))
      await db.insert(matches).values(matchData)
      console.log(`✅ Inserted ${matchData.length} matches`)
    }
    
    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Dojos: ${sampleData.dojos.length}`)
    console.log(`   - Teams: ${sampleData.teams.length}`)
    console.log(`   - Users: ${sampleData.users.length}`)
    console.log(`   - Courts: ${sampleData.courts.length}`)
    console.log(`   - Tournaments: ${sampleData.tournaments.length}`)
    console.log(`   - Matches: ${sampleData.matches.length}`)
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seedDatabase }