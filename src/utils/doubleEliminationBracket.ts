import { Team, Match, BracketRound } from '../types'

/**
 * Double elimination bracket generation utilities
 * Creates winners and losers brackets with proper seeding
 */

export interface BracketMatch {
  id: string
  position: number
  round: number
  isWinnersBracket: boolean
  team1?: Team
  team2?: Team
  winner?: Team
  loser?: Team
  status: 'pending' | 'ready' | 'in_progress' | 'completed'
  nextWinnerMatch?: string
  nextLoserMatch?: string
}

/**
 * Generate double elimination bracket structure
 */
export const generateDoubleEliminationBracket = (qualifiedTeams: Team[]) => {
  const numTeams = qualifiedTeams.length
  
  // Sort teams by seed ranking (1st place teams first, then 2nd place teams)
  const sortedTeams = [...qualifiedTeams].sort((a, b) => {
    // Primary sort: seed ranking (1st place vs 2nd place from groups)
    const aRank = a.seedRanking || 999
    const bRank = b.seedRanking || 999
    return aRank - bRank
  })
  
  // Calculate bracket rounds needed
  const winnersRounds = Math.ceil(Math.log2(numTeams))
  const losersRounds = winnersRounds * 2 - 1
  
  const bracket = {
    teams: sortedTeams,
    winnersMatches: generateWinnersBracket(sortedTeams),
    losersMatches: generateLosersBracket(numTeams),
    grandFinal: generateGrandFinal(),
    totalRounds: winnersRounds + losersRounds + 1
  }
  
  return bracket
}

/**
 * Generate winners bracket matches
 */
export const generateWinnersBracket = (teams: Team[]): BracketMatch[] => {
  const matches: BracketMatch[] = []
  const numTeams = teams.length
  const rounds = Math.ceil(Math.log2(numTeams))
  
  // First round - initial pairings with seeding
  const firstRoundMatches = Math.floor(numTeams / 2)
  
  for (let i = 0; i < firstRoundMatches; i++) {
    // Standard tournament seeding: 1vs8, 2vs7, 3vs6, 4vs5, etc.
    const team1Index = i
    const team2Index = numTeams - 1 - i
    
    matches.push({
      id: `winners_r1_m${i + 1}`,
      position: i + 1,
      round: 1,
      isWinnersBracket: true,
      team1: teams[team1Index],
      team2: team2Index < numTeams ? teams[team2Index] : undefined,
      status: 'ready',
      nextWinnerMatch: `winners_r2_m${Math.floor(i / 2) + 1}`,
      nextLoserMatch: `losers_r1_m${i + 1}`
    })
  }
  
  // Handle byes for odd number of teams
  if (numTeams % 2 === 1) {
    const byeTeam = teams[numTeams - 1]
    matches.push({
      id: `winners_r1_bye`,
      position: firstRoundMatches + 1,
      round: 1,
      isWinnersBracket: true,
      team1: byeTeam,
      winner: byeTeam,
      status: 'completed',
      nextWinnerMatch: `winners_r2_m${Math.floor(firstRoundMatches / 2) + 1}`
    })
  }
  
  // Generate subsequent winners bracket rounds
  for (let round = 2; round <= rounds; round++) {
    const prevRoundMatches = matches.filter(m => m.round === round - 1 && m.isWinnersBracket)
    const thisRoundMatches = Math.ceil(prevRoundMatches.length / 2)
    
    for (let i = 0; i < thisRoundMatches; i++) {
      matches.push({
        id: `winners_r${round}_m${i + 1}`,
        position: i + 1,
        round,
        isWinnersBracket: true,
        status: 'pending',
        nextWinnerMatch: round < rounds ? `winners_r${round + 1}_m${Math.floor(i / 2) + 1}` : 'grand_final',
        nextLoserMatch: `losers_r${(round - 1) * 2}_m${i + 1}`
      })
    }
  }
  
  return matches
}

/**
 * Generate losers bracket matches
 */
export const generateLosersBracket = (numTeams: number): BracketMatch[] => {
  const matches: BracketMatch[] = []
  const winnersRounds = Math.ceil(Math.log2(numTeams))
  const losersRounds = winnersRounds * 2 - 1
  
  // Losers bracket is more complex - alternates between elimination and consolidation rounds
  for (let round = 1; round <= losersRounds; round++) {
    const isEliminationRound = round % 2 === 1
    const matchesInRound = Math.floor(numTeams / Math.pow(2, Math.ceil(round / 2)))
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `losers_r${round}_m${i + 1}`,
        position: i + 1,
        round,
        isWinnersBracket: false,
        status: 'pending',
        nextWinnerMatch: round === losersRounds ? 'grand_final' : `losers_r${round + 1}_m${Math.floor(i / 2) + 1}`
      })
    }
  }
  
  return matches
}

/**
 * Generate grand final match
 */
export const generateGrandFinal = (): BracketMatch => {
  return {
    id: 'grand_final',
    position: 1,
    round: 999, // Special round number for final
    isWinnersBracket: true,
    status: 'pending'
  }
}

/**
 * Update bracket after match completion
 */
export const updateBracketAfterMatch = (
  bracket: ReturnType<typeof generateDoubleEliminationBracket>,
  completedMatch: BracketMatch,
  winner: Team,
  loser: Team
) => {
  // Update the completed match
  completedMatch.winner = winner
  completedMatch.loser = loser
  completedMatch.status = 'completed'
  
  // Advance winner to next match
  if (completedMatch.nextWinnerMatch) {
    const nextMatch = findMatchById(bracket, completedMatch.nextWinnerMatch)
    if (nextMatch) {
      if (!nextMatch.team1) {
        nextMatch.team1 = winner
      } else if (!nextMatch.team2) {
        nextMatch.team2 = winner
        nextMatch.status = 'ready'
      }
    }
  }
  
  // Send loser to losers bracket (if from winners bracket)
  if (completedMatch.isWinnersBracket && completedMatch.nextLoserMatch) {
    const loserMatch = findMatchById(bracket, completedMatch.nextLoserMatch)
    if (loserMatch) {
      if (!loserMatch.team1) {
        loserMatch.team1 = loser
      } else if (!loserMatch.team2) {
        loserMatch.team2 = loser
        loserMatch.status = 'ready'
      }
    }
  }
  
  return bracket
}

/**
 * Find match by ID in bracket
 */
export const findMatchById = (
  bracket: ReturnType<typeof generateDoubleEliminationBracket>,
  matchId: string
): BracketMatch | undefined => {
  const allMatches = [
    ...bracket.winnersMatches,
    ...bracket.losersMatches,
    bracket.grandFinal
  ]
  return allMatches.find(match => match.id === matchId)
}

/**
 * Get current round matches that are ready to play
 */
export const getReadyMatches = (bracket: ReturnType<typeof generateDoubleEliminationBracket>): BracketMatch[] => {
  const allMatches = [
    ...bracket.winnersMatches,
    ...bracket.losersMatches
  ]
  return allMatches.filter(match => match.status === 'ready')
}

/**
 * Get bracket visualization data for rendering
 */
export const getBracketVisualizationData = (bracket: ReturnType<typeof generateDoubleEliminationBracket>) => {
  const winnersRounds = Math.ceil(Math.log2(bracket.teams.length))
  const losersRounds = winnersRounds * 2 - 1
  
  // Group matches by round for visualization
  const winnersByRound: BracketMatch[][] = []
  const losersByRound: BracketMatch[][] = []
  
  for (let round = 1; round <= winnersRounds; round++) {
    winnersByRound.push(
      bracket.winnersMatches.filter(match => match.round === round)
    )
  }
  
  for (let round = 1; round <= losersRounds; round++) {
    losersByRound.push(
      bracket.losersMatches.filter(match => match.round === round)
    )
  }
  
  return {
    winnersRounds: winnersByRound,
    losersRounds: losersByRound,
    grandFinal: bracket.grandFinal,
    totalRounds: winnersRounds + losersRounds + 1,
    teamsRemaining: bracket.teams.filter(team => 
      !bracket.winnersMatches.some(match => match.loser?.id === team.id) &&
      !bracket.losersMatches.some(match => match.loser?.id === team.id)
    ).length
  }
}

/**
 * Calculate team placement based on elimination round
 */
export const calculateTeamPlacement = (
  team: Team,
  bracket: ReturnType<typeof generateDoubleEliminationBracket>
): number => {
  // Check if team won the tournament
  if (bracket.grandFinal.winner?.id === team.id) {
    return 1
  }
  
  // Check if team was runner-up
  if (bracket.grandFinal.loser?.id === team.id) {
    return 2
  }
  
  // Find elimination round for other placements
  const eliminationMatch = [
    ...bracket.winnersMatches,
    ...bracket.losersMatches
  ].find(match => match.loser?.id === team.id)
  
  if (!eliminationMatch) {
    return 999 // Still in tournament
  }
  
  // Calculate placement based on elimination round
  // This is a simplified calculation - in reality, placement depends on bracket structure
  const roundPlacements: Record<number, number> = {
    1: 8, // Eliminated in first round
    2: 4, // Eliminated in second round
    3: 3, // Eliminated in semifinals
    // Add more as needed
  }
  
  return roundPlacements[eliminationMatch.round] || 999
}