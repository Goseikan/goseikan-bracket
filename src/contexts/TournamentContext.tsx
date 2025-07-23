import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Tournament, Match, Court, Dojo, Team, User } from '../types'
import { migrateTournamentData, isDataMigrationNeeded } from '../utils/dataMigration'

/**
 * Tournament Context for managing tournament state and data
 * Provides tournament information and methods throughout the app
 */

interface TournamentState {
  tournament: Tournament | null
  dojos: Dojo[]
  teams: Team[]
  users: User[]
  matches: Match[]
  courts: Court[]
  loading: boolean
  error: string | null
}

type TournamentAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Partial<TournamentState> }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_MATCH'; payload: Match }
  | { type: 'ADD_DOJO'; payload: Dojo }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }

interface TournamentContextType extends TournamentState {
  loadTournamentData: () => Promise<void>
  updateTournament: (tournament: Tournament) => void
  updateMatch: (match: Match) => void
  getUsersByDojoId: (dojoId: string) => User[]
  getTeamsByDojoId: (dojoId: string) => Team[]
  getUserById: (userId: string) => User | null
  getTeamById: (teamId: string) => Team | null
  getDojoById: (dojoId: string) => Dojo | null
  clearError: () => void
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined)

// Tournament reducer for managing tournament state
const tournamentReducer = (state: TournamentState, action: TournamentAction): TournamentState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null }
    
    case 'LOAD_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        error: null,
        ...action.payload
      }
    
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload }
    
    case 'UPDATE_TOURNAMENT':
      return { ...state, tournament: action.payload }
    
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(match =>
          match.id === action.payload.id ? action.payload : match
        )
      }
    
    case 'ADD_DOJO':
      return { ...state, dojos: [...state.dojos, action.payload] }
    
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] }
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Initial tournament state
const initialState: TournamentState = {
  tournament: null,
  dojos: [],
  teams: [],
  users: [],
  matches: [],
  courts: [],
  loading: false,
  error: null
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, initialState)

  // Load tournament data on app start
  useEffect(() => {
    loadTournamentData()
  }, [])

  /**
   * Load all tournament-related data from localStorage
   */
  const loadTournamentData = async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    
    try {
      // Check if data migration is needed and perform it
      if (isDataMigrationNeeded()) {
        console.log('Migrating tournament data to new structure...')
        migrateTournamentData()
      }
      
      // Load data from localStorage (simulating API calls)
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const activeTournament = tournaments.find((t: Tournament) => t.isActive) || null
      
      const dojos = JSON.parse(localStorage.getItem('dojos') || '[]')
      const teams = JSON.parse(localStorage.getItem('teams') || '[]')
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const matches = JSON.parse(localStorage.getItem('matches') || '[]')
      const courts = JSON.parse(localStorage.getItem('courts') || '[]')

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          tournament: activeTournament,
          dojos,
          teams,
          users,
          matches,
          courts
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tournament data'
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage })
    }
  }

  /**
   * Update tournament data
   */
  const updateTournament = (tournament: Tournament): void => {
    // Update localStorage
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
    const updatedTournaments = tournaments.map((t: Tournament) =>
      t.id === tournament.id ? tournament : t
    )
    localStorage.setItem('tournaments', JSON.stringify(updatedTournaments))
    
    dispatch({ type: 'UPDATE_TOURNAMENT', payload: tournament })
  }

  /**
   * Update match data
   */
  const updateMatch = (match: Match): void => {
    // Update localStorage
    const matches = state.matches.map(m => m.id === match.id ? match : m)
    localStorage.setItem('matches', JSON.stringify(matches))
    
    dispatch({ type: 'UPDATE_MATCH', payload: match })
  }

  /**
   * Get users by dojo ID
   */
  const getUsersByDojoId = (dojoId: string): User[] => {
    return state.users.filter(user => user.dojoId === dojoId)
  }

  /**
   * Get teams by dojo ID
   */
  const getTeamsByDojoId = (dojoId: string): Team[] => {
    return state.teams.filter(team => team.dojoId === dojoId)
  }

  /**
   * Get user by ID
   */
  const getUserById = (userId: string): User | null => {
    return state.users.find(user => user.id === userId) || null
  }

  /**
   * Get team by ID
   */
  const getTeamById = (teamId: string): Team | null => {
    return state.teams.find(team => team.id === teamId) || null
  }

  /**
   * Get dojo by ID
   */
  const getDojoById = (dojoId: string): Dojo | null => {
    return state.dojos.find(dojo => dojo.id === dojoId) || null
  }

  /**
   * Clear error function
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: TournamentContextType = {
    ...state,
    loadTournamentData,
    updateTournament,
    updateMatch,
    getUsersByDojoId,
    getTeamsByDojoId,
    getUserById,
    getTeamById,
    getDojoById,
    clearError
  }

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}

/**
 * Custom hook to use tournament context
 */
export const useTournament = (): TournamentContextType => {
  const context = useContext(TournamentContext)
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}