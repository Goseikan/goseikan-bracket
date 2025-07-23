import { KendoRank } from '../types'

/**
 * Utility functions for handling Kendo ranks
 * Provides sorting, display, and validation functionality for rank system
 */

// All available ranks in proper order for dropdowns
export const KENDO_RANKS: KendoRank[] = [
  'Mudansha',
  '10 Kyu', '9 Kyu', '8 Kyu', '7 Kyu', '6 Kyu', '5 Kyu', '4 Kyu', '3 Kyu', '2 Kyu', '1 Kyu',
  '1 Dan', '2 Dan', '3 Dan', '4 Dan', '5 Dan', '6 Dan', '7 Dan', '8 Dan'
]

/**
 * Get the display order value for sorting ranks
 * Lower numbers = lower ranks, higher numbers = higher ranks
 */
export const getRankOrder = (rank: KendoRank): number => {
  const rankIndex = KENDO_RANKS.indexOf(rank)
  return rankIndex === -1 ? 0 : rankIndex
}

/**
 * Sort users by rank (lowest to highest)
 */
export const sortByRank = <T extends { kendoRank: KendoRank }>(users: T[]): T[] => {
  return [...users].sort((a, b) => getRankOrder(a.kendoRank) - getRankOrder(b.kendoRank))
}

/**
 * Sort users by rank (highest to lowest) - primary function for dojo member lists
 */
export const sortByRankDescending = <T extends { kendoRank: KendoRank }>(users: T[]): T[] => {
  return [...users].sort((a, b) => getRankOrder(b.kendoRank) - getRankOrder(a.kendoRank))
}

/**
 * Alias for sortByRankDescending - more descriptive name for dojo member sorting
 */
export const sortDojoMembersByRank = <T extends { kendoRank: KendoRank }>(users: T[]): T[] => {
  return sortByRankDescending(users)
}

/**
 * Get rank category for grouping/styling purposes
 */
export const getRankCategory = (rank: KendoRank | undefined | null): 'mudansha' | 'kyu' | 'dan' => {
  if (!rank) return 'mudansha' // Default fallback for undefined/null ranks
  if (rank === 'Mudansha') return 'mudansha'
  if (rank.includes('Kyu')) return 'kyu'
  return 'dan'
}

/**
 * Get CSS class for rank badge styling
 */
export const getRankBadgeClass = (rank: KendoRank | undefined | null): string => {
  if (!rank) {
    // Fallback for undefined/null ranks
    return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
  }
  
  const category = getRankCategory(rank)
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  switch (category) {
    case 'mudansha':
      return `${baseClasses} bg-gray-100 text-gray-800`
    case 'kyu':
      return `${baseClasses} bg-accent-100 text-accent-800`
    case 'dan':
      return `${baseClasses} bg-primary-100 text-primary-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

/**
 * Format rank for display with proper spacing
 */
export const formatRankDisplay = (rank: KendoRank): string => {
  return rank
}

/**
 * Check if a rank is higher than another rank
 */
export const isRankHigher = (rank1: KendoRank, rank2: KendoRank): boolean => {
  return getRankOrder(rank1) > getRankOrder(rank2)
}

/**
 * Get rank level for seeding purposes (higher number = higher skill)
 */
export const getRankLevel = (rank: KendoRank): number => {
  return getRankOrder(rank)
}

/**
 * Group ranks by category for display in forms
 */
export const GROUPED_RANKS = {
  mudansha: ['Mudansha'] as KendoRank[],
  kyu: [
    '10 Kyu', '9 Kyu', '8 Kyu', '7 Kyu', '6 Kyu', 
    '5 Kyu', '4 Kyu', '3 Kyu', '2 Kyu', '1 Kyu'
  ] as KendoRank[],
  dan: [
    '1 Dan', '2 Dan', '3 Dan', '4 Dan', '5 Dan', 
    '6 Dan', '7 Dan', '8 Dan'
  ] as KendoRank[]
}