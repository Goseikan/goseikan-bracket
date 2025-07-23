import { Dojo, Team, User } from '../types'

/**
 * Search utilities for tournament participants
 * Supports fuzzy matching across dojos, teams, participants, and ranks
 */

export interface SearchResult {
  dojo: Dojo
  teams: Team[]
  matchScore: number
  matchedFields: string[]
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 being exact match)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0
  
  // Check for substring match first (higher score)
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length)
    const shorter = Math.min(s1.length, s2.length)
    return 0.7 + (shorter / longer) * 0.3
  }
  
  // Levenshtein distance for fuzzy matching
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  return Math.max(0, 1 - distance / maxLength)
}

/**
 * Check if search query matches any part of a text with strict substring matching
 * Returns the best match score for the query
 */
const fuzzyMatch = (text: string, query: string): number => {
  if (!text || !query) return 0
  
  const normalizedText = text.toLowerCase().trim()
  const normalizedQuery = query.toLowerCase().trim()
  
  // Exact match
  if (normalizedText.includes(normalizedQuery)) return 1
  
  // Split query into words for multi-word matching
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1) // Ignore single chars
  if (queryWords.length === 0) return 0
  
  let matchedWords = 0
  
  // Check each query word - ALL words must have some match
  for (const queryWord of queryWords) {
    let wordMatched = false
    
    // ONLY allow substring matches - no fuzzy matching
    if (normalizedText.includes(queryWord)) {
      wordMatched = true
    }
    
    if (wordMatched) {
      matchedWords++
    }
  }
  
  // Only return a score if ALL query words matched
  if (matchedWords === queryWords.length) {
    return 1 // Perfect match since all words were found as substrings
  }
  
  return 0 // No match if not all words matched
}

/**
 * Search through dojos, teams, and participants
 */
export const searchParticipants = (
  dojos: Dojo[],
  teams: Team[],
  users: User[],
  query: string,
  minScore: number = 0.8
): SearchResult[] => {
  if (!query.trim()) {
    // Return all dojos if no query
    return dojos.map(dojo => ({
      dojo,
      teams: teams.filter(team => team.dojoId === dojo.id),
      matchScore: 1,
      matchedFields: []
    }))
  }
  
  const searchResults: SearchResult[] = []
  
  for (const dojo of dojos) {
    const dojoTeams = teams.filter(team => team.dojoId === dojo.id)
    let maxScore = 0
    const matchedFields: string[] = []
    const matchingTeams: Team[] = []
    
    // Check dojo name
    const dojoScore = fuzzyMatch(dojo.name, query)
    if (dojoScore >= minScore) {
      maxScore = Math.max(maxScore, dojoScore)
      matchedFields.push(`dojo: ${dojo.name}`)
    }
    
    // Check each team in the dojo
    for (const team of dojoTeams) {
      let teamMaxScore = 0
      const teamMatchedFields: string[] = []
      
      // Check team name
      const teamScore = fuzzyMatch(team.name, query)
      if (teamScore >= minScore) {
        teamMaxScore = Math.max(teamMaxScore, teamScore)
        teamMatchedFields.push(`team: ${team.name}`)
      }
      
      // Check team members
      const teamMembers = team.players
      for (const member of teamMembers) {
        // Check member name
        const nameScore = fuzzyMatch(member.fullName, query)
        if (nameScore >= minScore) {
          teamMaxScore = Math.max(teamMaxScore, nameScore)
          teamMatchedFields.push(`participant: ${member.fullName}`)
        }
        
        // Check member rank
        const rankScore = fuzzyMatch(member.kendoRank, query)
        if (rankScore >= minScore) {
          teamMaxScore = Math.max(teamMaxScore, rankScore)
          teamMatchedFields.push(`rank: ${member.kendoRank} (${member.fullName})`)
        }
      }
      
      // If team or its members match, include the team
      if (teamMaxScore >= minScore || dojoScore >= minScore) {
        matchingTeams.push(team)
        maxScore = Math.max(maxScore, teamMaxScore)
        matchedFields.push(...teamMatchedFields)
      }
    }
    
    // Include dojo if it or any of its teams/members match
    if (maxScore >= minScore) {
      searchResults.push({
        dojo,
        teams: matchingTeams.length > 0 ? matchingTeams : dojoTeams,
        matchScore: maxScore,
        matchedFields: [...new Set(matchedFields)] // Remove duplicates
      })
    }
  }
  
  // Sort by match score (highest first)
  return searchResults.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Highlight matching text in a string
 */
export const highlightMatch = (text: string, query: string): string => {
  if (!query.trim() || !text) return text
  
  const normalizedQuery = query.toLowerCase().trim()
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1)
  
  if (queryWords.length === 0) return text
  
  // Create a single regex pattern for all query words
  const escapedWords = queryWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = escapedWords.join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  
  // Simple replacement without nested logic
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

/**
 * Get search suggestions based on partial query
 */
export const getSearchSuggestions = (
  dojos: Dojo[],
  teams: Team[],
  users: User[],
  query: string,
  maxSuggestions: number = 5
): string[] => {
  if (!query.trim()) return []
  
  const suggestions = new Set<string>()
  const normalizedQuery = query.toLowerCase().trim()
  
  // Add dojo names
  for (const dojo of dojos) {
    if (dojo.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(dojo.name)
    }
  }
  
  // Add team names
  for (const team of teams) {
    if (team.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(team.name)
    }
  }
  
  // Add participant names
  for (const user of users) {
    if (user.fullName.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(user.fullName)
    }
  }
  
  // Add ranks
  const ranks = [...new Set(users.map(u => u.kendoRank))]
  for (const rank of ranks) {
    if (rank.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(rank)
    }
  }
  
  return Array.from(suggestions).slice(0, maxSuggestions)
}