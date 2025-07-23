import { Match, MatchScore } from '../types'
import { createEmptyMatchScore } from './kendoMatchLogic'

/**
 * Data migration utilities for updating existing match data
 * Ensures backward compatibility when match structure changes
 */

/**
 * Migrate match data to include new time and point tracking structure
 */
export const migrateMatchToTimeBasedScoring = (match: Match): Match => {
  // If match already has the new structure, return as-is
  if (match.scores.team1TotalPoints !== undefined && 
      match.scores.team2TotalPoints !== undefined &&
      match.scores.playerSets?.length > 0 &&
      match.scores.playerSets[0]?.timeLimit !== undefined) {
    return match
  }

  // Create new match score structure
  const newScore: MatchScore = {
    ...createEmptyMatchScore(),
    team1Wins: match.scores.team1Wins || 0,
    team2Wins: match.scores.team2Wins || 0,
    currentBattle: match.scores.currentBattle
  }

  // If there were existing player sets, try to preserve them
  if (match.scores.playerSets && match.scores.playerSets.length > 0) {
    newScore.playerSets = match.scores.playerSets.map((set, index) => ({
      setNumber: index + 1,
      team1PlayerId: set.team1PlayerId,
      team2PlayerId: set.team2PlayerId,
      winnerId: set.winnerId,
      result: set.result || 'win',
      actions: set.actions || [],
      team1Points: set.team1Points || 0,
      team2Points: set.team2Points || 0,
      timeLimit: set.timeLimit || 180,
      timeRemaining: set.timeRemaining || 180,
      startedAt: set.startedAt,
      completedAt: set.completedAt
    }))
    
    // Calculate total points from existing sets
    newScore.team1TotalPoints = newScore.playerSets
      .reduce((total, set) => total + (set.team1Points || 0), 0)
    newScore.team2TotalPoints = newScore.playerSets
      .reduce((total, set) => total + (set.team2Points || 0), 0)
  }

  return {
    ...match,
    scores: newScore
  }
}

/**
 * Migrate tournament data structure
 */
export const migrateTournamentData = () => {
  try {
    // Migrate tournament matches
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
    const updatedTournaments = tournaments.map((tournament: any) => {
      if (tournament.seedGroups) {
        tournament.seedGroups = tournament.seedGroups.map((group: any) => ({
          ...group,
          matches: group.matches.map(migrateMatchToTimeBasedScoring)
        }))
      }
      
      if (tournament.mainBracket?.rounds) {
        tournament.mainBracket.rounds = tournament.mainBracket.rounds.map((round: any) => ({
          ...round,
          matches: round.matches.map(migrateMatchToTimeBasedScoring)
        }))
      }
      
      return tournament
    })
    
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments))
    
    // Migrate standalone matches if they exist
    const matches = JSON.parse(localStorage.getItem('matches') || '[]')
    const updatedMatches = matches.map(migrateMatchToTimeBasedScoring)
    localStorage.setItem('matches', JSON.stringify(updatedMatches))
    
    console.log('Data migration completed successfully')
    return true
  } catch (error) {
    console.error('Failed to migrate tournament data:', error)
    return false
  }
}

/**
 * Check if data migration is needed
 */
export const isDataMigrationNeeded = (): boolean => {
  try {
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
    
    // Check if any tournament has matches without the new structure
    for (const tournament of tournaments) {
      if (tournament.seedGroups) {
        for (const group of tournament.seedGroups) {
          for (const match of group.matches) {
            if (match.scores.team1TotalPoints === undefined ||
                !match.scores.playerSets?.length ||
                match.scores.playerSets[0]?.timeLimit === undefined) {
              return true
            }
          }
        }
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking migration status:', error)
    return true // Assume migration is needed if we can't check
  }
}