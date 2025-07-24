/**
 * Core data types for the Kendo Tournament application
 * These interfaces define the structure of our data models
 */

/**
 * Kendo rank system types
 * Kyu ranks (beginner to intermediate) - descending order (higher number = lower rank)
 * Dan ranks (advanced) - ascending order (higher number = higher rank)
 * Mudansha - no formal rank
 */
export type KendoRank = 
  | 'Mudansha'
  | '10 Kyu' | '9 Kyu' | '8 Kyu' | '7 Kyu' | '6 Kyu' | '5 Kyu' | '4 Kyu' | '3 Kyu' | '2 Kyu' | '1 Kyu'
  | '1 Dan' | '2 Dan' | '3 Dan' | '4 Dan' | '5 Dan' | '6 Dan' | '7 Dan' | '8 Dan'

export interface User {
  id: string
  fullName: string
  dateOfBirth: string
  dojoId: string
  dojoName?: string
  teamId?: string
  teamName?: string
  role: 'participant' | 'admin' | 'super_admin'
  email: string
  password: string // hashed
  kendoRank: KendoRank
  createdAt: string
  updatedAt: string
}

export interface Dojo {
  id: string
  name: string
  location?: string
  logo?: string // Base64 encoded image or URL
  teams: Team[]
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  dojoId: string
  logo?: string // Base64 encoded image or URL
  players: User[]
  seedRanking?: number
  groupRanking?: number // Ranking within seed group (1st, 2nd, 3rd in group)
  finalRanking?: number
  createdAt: string
  updatedAt: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  status: 'registration' | 'seed' | 'main' | 'completed'
  isActive: boolean
  maxParticipants: number
  seedGroups: Group[]
  mainBracket: Bracket
  courts: Court[]
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  teams: Team[]
  matches: Match[]
  standings: TeamStanding[]
}

export interface TeamStanding {
  teamId: string
  wins: number
  losses: number
  points: number
  ranking: number
}

export interface Bracket {
  id: string
  type: 'single_elimination' | 'double_elimination'
  rounds: BracketRound[]
}

export interface BracketRound {
  id: string
  roundNumber: number
  matches: Match[]
  isWinnersBracket: boolean
}

export interface Match {
  id: string
  tournamentId: string
  team1Id: string
  team2Id: string
  courtId?: string
  stage: 'seed' | 'main'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overtime'
  currentPlayerSet: number // 1-7
  scores: MatchScore
  winnerId?: string
  overtime?: OvertimeData
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MatchScore {
  team1Wins: number
  team2Wins: number
  team1TotalPoints: number // Total points across all sets
  team2TotalPoints: number // Total points across all sets
  playerSets: PlayerSetResult[]
  currentBattle?: CurrentBattle
}

export interface PlayerSetResult {
  setNumber: number // 1-7
  team1PlayerId?: string // Optional - can be empty for forfeits
  team2PlayerId?: string // Optional - can be empty for forfeits
  winnerId?: string
  result: 'win' | 'loss' | 'draw' | 'forfeit' | 'time_expired' // Explicit result tracking
  actions: ScoringAction[]
  team1Points: number // Points scored by team1 player
  team2Points: number // Points scored by team2 player
  timeLimit: number // Time limit in seconds (e.g., 180 for 3 minutes)
  timeRemaining: number // Time remaining when set ended
  startedAt?: string
  completedAt?: string
}

export interface CurrentBattle {
  setNumber: number
  team1PlayerId: string
  team2PlayerId: string
  team1Actions: ScoringAction[]
  team2Actions: ScoringAction[]
  startedAt: string
}

export interface ScoringAction {
  id: string
  type: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku'
  playerId: string
  timestamp: string
  confirmed: boolean
}

export interface OvertimeData {
  team1PlayerId: string
  team2PlayerId: string
  actions: ScoringAction[]
  winnerId?: string
  startedAt: string
  completedAt?: string
}

export interface Court {
  id: string
  name: string
  isActive: boolean
  currentMatchId?: string
  createdAt: string
  updatedAt: string
}

/**
 * Authentication and session management types
 */
export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: 'participant' | 'admin' | 'super_admin'
  dojoId: string
  teamId: string
  teamName?: string
  dateOfBirth: string
  kendoRank: KendoRank
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  dateOfBirth: string
  dojoName: string
  teamName: string
  kendoRank: KendoRank
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Form validation types
 */
export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string
}

/**
 * Tournament statistics and analytics types
 */
export interface TournamentStats {
  totalParticipants: number
  totalTeams: number
  totalDojos: number
  matchesCompleted: number
  matchesRemaining: number
  currentStage: Tournament['status']
}

export interface PlayerStats {
  playerId: string
  matchesPlayed: number
  matchesWon: number
  totalPoints: number
  menHits: number
  koteHits: number
  tsukiHits: number
  doHits: number
  hansokuReceived: number
}

/**
 * UI State types
 */
export interface UIState {
  loading: boolean
  error: string | null
  success: string | null
}

export interface NavigationItem {
  label: string
  path: string
  icon?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  requiresSuperAdmin?: boolean
}