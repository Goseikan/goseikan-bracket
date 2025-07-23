import type { Match, MatchScore, PlayerSetResult, ScoringAction } from '../types'

/**
 * Kendo match logic utilities
 * Handles proper kendo scoring rules and match winner determination
 */

/**
 * Calculate individual set winner based on points and time
 * Rules:
 * 1. First to 2 points wins immediately
 * 2. If time expires, player with more points wins
 * 3. If time expires with equal points, it's a draw
 */
export const calculateSetWinner = (
  team1Points: number,
  team2Points: number,
  timeRemaining: number
): { winnerId?: string, result: 'win' | 'draw' | 'time_expired' } => {
  // First to 2 points wins
  if (team1Points >= 2) {
    return { winnerId: 'team1', result: 'win' }
  }
  if (team2Points >= 2) {
    return { winnerId: 'team2', result: 'win' }
  }

  // If time expired, check who has more points
  if (timeRemaining <= 0) {
    if (team1Points > team2Points) {
      return { winnerId: 'team1', result: 'time_expired' }
    } else if (team2Points > team1Points) {
      return { winnerId: 'team2', result: 'time_expired' }
    } else {
      return { result: 'draw' }
    }
  }

  // Match still in progress
  return { result: 'win' } // This shouldn't be used for incomplete sets
}

/**
 * Count valid scoring points from actions
 * Only men, kote, tsuki, do count as points (hansoku doesn't)
 */
export const countPointsFromActions = (actions: ScoringAction[]): number => {
  return actions.filter(action => 
    ['men', 'kote', 'tsuki', 'do'].includes(action.type) && action.confirmed
  ).length
}

/**
 * Calculate total points for a team across all completed sets
 */
export const calculateTotalPoints = (playerSets: PlayerSetResult[], teamSide: 'team1' | 'team2'): number => {
  return playerSets.reduce((total, set) => {
    return total + (teamSide === 'team1' ? set.team1Points : set.team2Points)
  }, 0)
}

/**
 * Determine match winner based on kendo hierarchy:
 * 1. Most set wins
 * 2. If equal wins, most total points
 * 3. If equal points, go to overtime
 */
export const determineMatchWinner = (matchScore: MatchScore): {
  winnerId?: string
  needsOvertime: boolean
  reason: 'sets' | 'points' | 'tied'
} => {
  const { team1Wins, team2Wins, team1TotalPoints, team2TotalPoints } = matchScore

  // First check: Most set wins
  if (team1Wins > team2Wins) {
    return { winnerId: 'team1', needsOvertime: false, reason: 'sets' }
  }
  if (team2Wins > team1Wins) {
    return { winnerId: 'team2', needsOvertime: false, reason: 'sets' }
  }

  // Second check: If wins are equal, check total points
  if (team1TotalPoints > team2TotalPoints) {
    return { winnerId: 'team1', needsOvertime: false, reason: 'points' }
  }
  if (team2TotalPoints > team1TotalPoints) {
    return { winnerId: 'team2', needsOvertime: false, reason: 'points' }
  }

  // Third: If both wins and points are equal, need overtime
  return { winnerId: undefined, needsOvertime: true, reason: 'tied' }
}

/**
 * Update match score when a set is completed
 */
export const updateMatchScoreAfterSet = (
  currentScore: MatchScore,
  setResult: PlayerSetResult
): MatchScore => {
  const updatedScore = { ...currentScore }

  // Update set wins
  if (setResult.result === 'win' || setResult.result === 'time_expired' || setResult.result === 'forfeit') {
    if (setResult.winnerId === 'team1') {
      updatedScore.team1Wins += 1
    } else if (setResult.winnerId === 'team2') {
      updatedScore.team2Wins += 1
    }
  }

  // Update total points
  updatedScore.team1TotalPoints += setResult.team1Points
  updatedScore.team2TotalPoints += setResult.team2Points

  // Update player sets array
  updatedScore.playerSets[setResult.setNumber - 1] = setResult

  return updatedScore
}

/**
 * Get formatted time display (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Get match status text based on winner determination
 */
export const getMatchStatusText = (
  team1Name: string,
  team2Name: string,
  winnerId?: string,
  reason?: 'sets' | 'points' | 'tied'
): string => {
  if (!winnerId) return 'Match in progress'

  const winnerName = winnerId === 'team1' ? team1Name : team2Name
  
  switch (reason) {
    case 'sets':
      return `${winnerName} wins by set count`
    case 'points':
      return `${winnerName} wins by total points`
    case 'tied':
      return 'Match tied - overtime required'
    default:
      return `${winnerName} wins`
  }
}

/**
 * Initialize empty match score
 */
export const createEmptyMatchScore = (): MatchScore => ({
  team1Wins: 0,
  team2Wins: 0,
  team1TotalPoints: 0,
  team2TotalPoints: 0,
  playerSets: Array(7).fill(null).map((_, index) => ({
    setNumber: index + 1,
    result: 'draw' as const,
    actions: [],
    team1Points: 0,
    team2Points: 0,
    timeLimit: 180, // 3 minutes default
    timeRemaining: 180
  }))
})

/**
 * Check if a set should end due to scoring
 */
export const shouldEndSet = (team1Points: number, team2Points: number, timeRemaining: number): boolean => {
  // End if someone reaches 2 points or time expired
  return team1Points >= 2 || team2Points >= 2 || timeRemaining <= 0
}