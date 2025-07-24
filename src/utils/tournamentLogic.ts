import type { Team, Group, TeamStanding, Match, Tournament } from '../types'
import { createEmptyMatchScore } from './kendoMatchLogic'

/**
 * Tournament logic utilities for seed stage and bracket generation
 * Implements round-robin seeding and double elimination brackets
 */

/**
 * Generate seed groups for round-robin stage
 * Ensures even distribution with max 3 teams per group while avoiding same-dojo conflicts
 */
export const generateSeedGroups = (teams: Team[], requestedGroups: number = 4): Group[] => {
  const maxTeamsPerGroup = 3
  const minGroupsNeeded = Math.ceil(teams.length / maxTeamsPerGroup)
  const actualGroupCount = Math.max(requestedGroups, minGroupsNeeded)
  
  const groups: Group[] = []
  
  // Initialize empty groups
  for (let i = 0; i < actualGroupCount; i++) {
    groups.push({
      id: `group_${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, D, etc.
      teams: [],
      matches: [],
      standings: []
    })
  }
  
  // Sort teams by dojo to distribute evenly
  const teamsByDojo = new Map<string, Team[]>()
  teams.forEach(team => {
    if (!teamsByDojo.has(team.dojoId)) {
      teamsByDojo.set(team.dojoId, [])
    }
    teamsByDojo.get(team.dojoId)!.push(team)
  })
  
  // Create a queue of all teams, sorted by dojo size (larger dojos first)
  const dojoEntries = Array.from(teamsByDojo.entries())
    .sort(([, teamsA], [, teamsB]) => teamsB.length - teamsA.length)
  
  const teamQueue: Team[] = []
  dojoEntries.forEach(([, dojoTeams]) => {
    teamQueue.push(...dojoTeams)
  })
  
  // Distribute teams using round-robin with group size balancing
  let currentGroupIndex = 0
  
  for (const team of teamQueue) {
    // Find the best group that:
    // 1. Has room (less than maxTeamsPerGroup)
    // 2. Has the fewest teams from this dojo
    // 3. Has the fewest total teams (for balance)
    
    const availableGroups = groups.filter(group => group.teams.length < maxTeamsPerGroup)
    
    if (availableGroups.length === 0) {
      // If all groups are full, create a new group
      const newGroup = {
        id: `group_${groups.length + 1}`,
        name: `Group ${String.fromCharCode(65 + groups.length)}`,
        teams: [team],
        matches: [],
        standings: []
      }
      groups.push(newGroup)
      continue
    }
    
    // Find the best available group
    const bestGroup = availableGroups.reduce((best, current) => {
      const bestDojoCount = best.teams.filter(t => t.dojoId === team.dojoId).length
      const currentDojoCount = current.teams.filter(t => t.dojoId === team.dojoId).length
      
      // Prioritize groups with fewer teams from the same dojo
      if (currentDojoCount < bestDojoCount) {
        return current
      } else if (currentDojoCount > bestDojoCount) {
        return best
      }
      
      // If dojo count is equal, prefer group with fewer total teams
      return current.teams.length < best.teams.length ? current : best
    })
    
    bestGroup.teams.push(team)
  }
  
  // Generate round-robin matches for each group
  groups.forEach(group => {
    group.matches = generateRoundRobinMatches(group.teams, group.id)
    group.standings = initializeStandings(group.teams)
  })
  
  return groups
}

/**
 * Generate round-robin matches for a group of teams
 */
export const generateRoundRobinMatches = (teams: Team[], groupId: string): Match[] => {
  const matches: Match[] = []
  const numTeams = teams.length
  
  // Generate all possible pairings
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      const match: Match = {
        id: `match_${groupId}_${i}_${j}`,
        tournamentId: 'tournament_2024_michigan_cup',
        team1Id: teams[i].id,
        team2Id: teams[j].id,
        stage: 'seed',
        status: 'scheduled',
        currentPlayerSet: 1,
        scores: createEmptyMatchScore(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      matches.push(match)
    }
  }
  
  return matches
}

/**
 * Initialize team standings for a group
 */
export const initializeStandings = (teams: Team[]): TeamStanding[] => {
  return teams.map(team => ({
    teamId: team.id,
    wins: 0,
    losses: 0,
    points: 0,
    ranking: 0
  }))
}

/**
 * Update standings based on match results
 */
export const updateStandings = (standings: TeamStanding[], match: Match): TeamStanding[] => {
  if (match.status !== 'completed' || !match.winnerId) {
    return standings
  }
  
  const updatedStandings = [...standings]
  const team1Standing = updatedStandings.find(s => s.teamId === match.team1Id)
  const team2Standing = updatedStandings.find(s => s.teamId === match.team2Id)
  
  if (!team1Standing || !team2Standing) {
    return standings
  }
  
  if (match.winnerId === match.team1Id) {
    // Team 1 wins
    team1Standing.wins += 1
    team1Standing.points += 2
    team2Standing.losses += 1
  } else if (match.winnerId === match.team2Id) {
    // Team 2 wins
    team2Standing.wins += 1
    team2Standing.points += 2
    team1Standing.losses += 1
  } else {
    // Draw (both teams get 1 point)
    team1Standing.points += 1
    team2Standing.points += 1
  }
  
  // Recalculate rankings
  return calculateRankings(updatedStandings)
}

/**
 * Calculate team rankings based on points and wins
 */
export const calculateRankings = (standings: TeamStanding[]): TeamStanding[] => {
  const sorted = [...standings].sort((a, b) => {
    // Sort by points first, then by wins, then by losses (ascending)
    if (a.points !== b.points) {
      return b.points - a.points
    }
    if (a.wins !== b.wins) {
      return b.wins - a.wins
    }
    return a.losses - b.losses
  })
  
  // Assign rankings
  sorted.forEach((standing, index) => {
    standing.ranking = index + 1
  })
  
  return sorted
}

/**
 * Check if all matches in a group are complete
 */
export const isGroupComplete = (group: Group): boolean => {
  return group.matches.every(match => match.status === 'completed')
}

/**
 * Get the top teams from each group for main bracket
 */
export const getTopTeamsFromGroups = (groups: Group[], teamsPerGroup: number = 2): Team[] => {
  const topTeams: Team[] = []
  
  groups.forEach(group => {
    const sortedStandings = calculateRankings(group.standings)
    const topStandings = sortedStandings.slice(0, teamsPerGroup)
    
    topStandings.forEach(standing => {
      const team = group.teams.find(t => t.id === standing.teamId)
      if (team) {
        // Update team's seed ranking
        team.seedRanking = standing.ranking
        topTeams.push(team)
      }
    })
  })
  
  return topTeams
}

/**
 * Generate main bracket structure for double elimination
 */
export const generateMainBracket = (teams: Team[]) => {
  // Sort teams by their seed ranking (best from each group first)
  const sortedTeams = [...teams].sort((a, b) => {
    return (a.seedRanking || 999) - (b.seedRanking || 999)
  })
  
  return {
    id: 'main_bracket',
    type: 'double_elimination' as const,
    rounds: generateDoubleEliminationRounds(sortedTeams)
  }
}

/**
 * Generate double elimination bracket rounds
 */
export const generateDoubleEliminationRounds = (teams: Team[]) => {
  const rounds = []
  const numTeams = teams.length
  
  // Calculate number of rounds needed
  const winnerRounds = Math.ceil(Math.log2(numTeams))
  const loserRounds = (winnerRounds - 1) * 2
  
  // Generate winner bracket rounds
  for (let i = 0; i < winnerRounds; i++) {
    rounds.push({
      id: `winner_round_${i + 1}`,
      roundNumber: i + 1,
      matches: [],
      isWinnersBracket: true
    })
  }
  
  // Generate loser bracket rounds
  for (let i = 0; i < loserRounds; i++) {
    rounds.push({
      id: `loser_round_${i + 1}`,
      roundNumber: i + 1,
      matches: [],
      isWinnersBracket: false
    })
  }
  
  // Add grand final
  rounds.push({
    id: 'grand_final',
    roundNumber: winnerRounds + 1,
    matches: [],
    isWinnersBracket: true
  })
  
  return rounds
}

/**
 * Advance tournament from seed stage to main stage
 */
export const advanceToMainStage = (tournament: Tournament, groups: Group[]): Tournament => {
  // Check if all groups are complete
  const allGroupsComplete = groups.every(isGroupComplete)
  if (!allGroupsComplete) {
    throw new Error('All seed groups must be complete before advancing to main stage')
  }
  
  // Get top teams from each group
  const qualifiedTeams = getTopTeamsFromGroups(groups, 2) // Top 2 from each group
  
  // Generate main bracket
  const mainBracket = generateMainBracket(qualifiedTeams)
  
  return {
    ...tournament,
    status: 'main',
    seedGroups: groups,
    mainBracket,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get tournament progress statistics
 */
export const getTournamentProgress = (tournament: Tournament) => {
  let totalMatches = 0
  let completedMatches = 0
  
  // Count seed stage matches
  tournament.seedGroups.forEach(group => {
    totalMatches += group.matches.length
    completedMatches += group.matches.filter(m => m.status === 'completed').length
  })
  
  // Count main bracket matches
  tournament.mainBracket.rounds.forEach(round => {
    totalMatches += round.matches.length
    completedMatches += round.matches.filter(m => m.status === 'completed').length
  })
  
  const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0
  
  return {
    totalMatches,
    completedMatches,
    remainingMatches: totalMatches - completedMatches,
    progressPercentage: Math.round(progressPercentage)
  }
}