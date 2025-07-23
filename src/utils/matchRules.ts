import { PlayerSetResult, Team, User } from '../types'

/**
 * Utility functions for handling kendo team match rules
 * Implements forfeit and draw logic based on player availability
 */

/**
 * Determines the result of a player set based on availability
 * Rules:
 * - If one team has a player and the other doesn't: forfeit win
 * - If both teams have no player in that position: draw
 * - If both teams have players: normal match (to be decided by scoring)
 */
export const determineSetResult = (
  team1PlayerId?: string,
  team2PlayerId?: string,
  winnerId?: string
): 'win' | 'loss' | 'draw' | 'forfeit' => {
  // Both teams missing players in this position = draw
  if (!team1PlayerId && !team2PlayerId) {
    return 'draw'
  }
  
  // Team 1 has player, Team 2 doesn't = forfeit win for Team 1
  if (team1PlayerId && !team2PlayerId) {
    return 'forfeit'
  }
  
  // Team 2 has player, Team 1 doesn't = forfeit loss for Team 1
  if (!team1PlayerId && team2PlayerId) {
    return 'forfeit'
  }
  
  // Both teams have players - normal match result
  if (winnerId === team1PlayerId) {
    return 'win'
  } else if (winnerId === team2PlayerId) {
    return 'loss'
  }
  
  // Match in progress or tied
  return 'draw'
}

/**
 * Create a player set result for a forfeit scenario
 */
export const createForfeitSet = (
  setNumber: number,
  team1PlayerId?: string,
  team2PlayerId?: string
): PlayerSetResult => {
  const result = determineSetResult(team1PlayerId, team2PlayerId)
  
  return {
    setNumber,
    team1PlayerId,
    team2PlayerId,
    winnerId: result === 'forfeit' && team1PlayerId ? team1PlayerId : 
              result === 'forfeit' && team2PlayerId ? team2PlayerId : undefined,
    result,
    actions: [],
    team1Points: 0,
    team2Points: 0,
    timeLimit: 180,
    timeRemaining: 180,
    completedAt: new Date().toISOString()
  }
}

/**
 * Generate all 7 player sets for a team match
 * Handles cases where teams have fewer than 7 players
 */
export const generatePlayerSets = (
  team1Players: string[],
  team2Players: string[]
): PlayerSetResult[] => {
  const playerSets: PlayerSetResult[] = []
  
  for (let i = 0; i < 7; i++) {
    const team1PlayerId = team1Players[i] || undefined
    const team2PlayerId = team2Players[i] || undefined
    
    const playerSet = createForfeitSet(i + 1, team1PlayerId, team2PlayerId)
    playerSets.push(playerSet)
  }
  
  return playerSets
}

/**
 * Calculate team match score based on individual set results
 * Returns the number of sets won by each team
 */
export const calculateMatchScore = (playerSets: PlayerSetResult[]): {
  team1Wins: number
  team2Wins: number
  draws: number
} => {
  let team1Wins = 0
  let team2Wins = 0
  let draws = 0
  
  playerSets.forEach(set => {
    switch (set.result) {
      case 'win':
        team1Wins++
        break
      case 'loss':
        team2Wins++
        break
      case 'draw':
        draws++
        break
      case 'forfeit':
        // Forfeit wins go to the team with a player
        if (set.team1PlayerId && !set.team2PlayerId) {
          team1Wins++
        } else if (set.team2PlayerId && !set.team1PlayerId) {
          team2Wins++
        } else {
          draws++ // Both teams forfeit = draw
        }
        break
    }
  })
  
  return { team1Wins, team2Wins, draws }
}

/**
 * Determine the overall winner of a team match
 */
export const determineMatchWinner = (
  team1Id: string,
  team2Id: string,
  playerSets: PlayerSetResult[]
): string | undefined => {
  const { team1Wins, team2Wins } = calculateMatchScore(playerSets)
  
  if (team1Wins > team2Wins) {
    return team1Id
  } else if (team2Wins > team1Wins) {
    return team2Id
  }
  
  // Tie - no winner
  return undefined
}

/**
 * Get a human-readable description of a set result
 */
export const getSetResultDescription = (set: PlayerSetResult, team1Name: string, team2Name: string): string => {
  switch (set.result) {
    case 'draw':
      if (!set.team1PlayerId && !set.team2PlayerId) {
        return `Set ${set.setNumber}: Both teams forfeit - Draw`
      }
      return `Set ${set.setNumber}: Draw`
    
    case 'forfeit':
      if (set.team1PlayerId && !set.team2PlayerId) {
        return `Set ${set.setNumber}: ${team1Name} wins by forfeit`
      } else if (set.team2PlayerId && !set.team1PlayerId) {
        return `Set ${set.setNumber}: ${team2Name} wins by forfeit`
      }
      return `Set ${set.setNumber}: Double forfeit - Draw`
    
    case 'win':
      return `Set ${set.setNumber}: ${team1Name} wins`
    
    case 'loss':
      return `Set ${set.setNumber}: ${team2Name} wins`
    
    default:
      return `Set ${set.setNumber}: In progress`
  }
}

/**
 * Check if a team match is complete
 */
export const isMatchComplete = (playerSets: PlayerSetResult[]): boolean => {
  return playerSets.every(set => 
    set.result !== undefined && 
    (set.completedAt !== undefined || set.result === 'draw' || set.result === 'forfeit')
  )
}

/**
 * Get the next set that needs to be played
 */
export const getNextSet = (playerSets: PlayerSetResult[]): PlayerSetResult | undefined => {
  return playerSets.find(set => 
    !set.completedAt && 
    set.result !== 'draw' && 
    set.result !== 'forfeit' &&
    set.team1PlayerId && 
    set.team2PlayerId
  )
}

/**
 * Validate team roster for match participation
 */
export const validateTeamRoster = (team: Team, users: User[]): {
  isValid: boolean
  playerCount: number
  missingPositions: number[]
  warnings: string[]
} => {
  const warnings: string[] = []
  const playerCount = team.players.length
  const missingPositions: number[] = []
  
  // Check for missing positions (1-7)
  for (let i = 0; i < 7; i++) {
    if (!team.players[i]) {
      missingPositions.push(i + 1)
    }
  }
  
  if (playerCount === 0) {
    warnings.push('Team has no registered players')
  } else if (playerCount < 7) {
    warnings.push(`Team only has ${playerCount} players. Positions ${missingPositions.join(', ')} will be forfeited.`)
  }
  
  return {
    isValid: playerCount > 0,
    playerCount,
    missingPositions,
    warnings
  }
}