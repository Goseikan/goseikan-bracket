import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Tournament, Match, Court, Dojo, Team, User } from '../types'
import { userAPI, dojoAPI, teamAPI, tournamentAPI, courtAPI, matchAPI } from '../utils/api'
import { generateDojoLogo, generateTeamLogo } from '../utils/logoGenerator'

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
  | { type: 'UPDATE_DOJO'; payload: Dojo }
  | { type: 'DELETE_DOJO'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'CLEAR_ERROR' }

interface TournamentContextType extends TournamentState {
  loadTournamentData: () => Promise<void>
  updateTournament: (tournament: Tournament) => void
  updateMatch: (match: Match) => void
  addDojo: (name: string, location: string) => Promise<Dojo>
  updateDojo: (dojoId: string, updates: Partial<Dojo>) => Promise<void>
  deleteDojo: (dojoId: string) => Promise<void>
  addTeam: (name: string, dojoId: string) => Promise<Team>
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>
  deleteTeam: (teamId: string) => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
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
    
    case 'UPDATE_DOJO':
      return {
        ...state,
        dojos: state.dojos.map(dojo =>
          dojo.id === action.payload.id ? action.payload : dojo
        )
      }
    
    case 'DELETE_DOJO':
      return {
        ...state,
        dojos: state.dojos.filter(dojo => dojo.id !== action.payload),
        teams: state.teams.filter(team => team.dojoId !== action.payload),
        users: state.users.filter(user => user.dojoId !== action.payload)
      }
    
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] }
    
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.id ? action.payload : team
        )
      }
    
    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter(team => team.id !== action.payload),
        users: state.users.map(user => 
          user.teamId === action.payload ? { ...user, teamId: undefined, teamName: undefined } : user
        )
      }
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      }
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      }
    
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
   * Load all tournament-related data from API
   */
  const loadTournamentData = async (): Promise<void> => {
    dispatch({ type: 'LOAD_START' })
    
    try {
      // Check if we're in development mode and fallback to localStorage
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Fallback to localStorage for development without database
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
        return
      }
      
      // Load data from API
      const [tournamentsRes, dojosRes, teamsRes, usersRes, matchesRes, courtsRes] = await Promise.all([
        tournamentAPI.getAll(),
        dojoAPI.getAll(),
        teamAPI.getAll(),
        userAPI.getAll(),
        matchAPI.getAll(),
        courtAPI.getAll()
      ])
      
      // Check for API errors
      if (!tournamentsRes.success || !dojosRes.success || !teamsRes.success || 
          !usersRes.success || !matchesRes.success || !courtsRes.success) {
        throw new Error('Failed to load tournament data from API')
      }
      
      const activeTournament = tournamentsRes.data?.find((t: Tournament) => t.isActive) || null
      
      // Enrich teams with player data
      const enrichedTeams = teamsRes.data?.map(team => ({
        ...team,
        players: usersRes.data?.filter(user => user.teamId === team.id) || []
      })) || []
      
      // Enrich dojos with team data
      const enrichedDojos = dojosRes.data?.map(dojo => ({
        ...dojo,
        teams: enrichedTeams.filter(team => team.dojoId === dojo.id)
      })) || []

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: {
          tournament: activeTournament,
          dojos: enrichedDojos,
          teams: enrichedTeams,
          users: usersRes.data || [],
          matches: matchesRes.data || [],
          courts: courtsRes.data || []
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
  const updateMatch = async (match: Match): Promise<void> => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage for development
        const matches = state.matches.map(m => m.id === match.id ? match : m)
        localStorage.setItem('matches', JSON.stringify(matches))
      } else {
        // Update via API
        const result = await matchAPI.update(match.id, match)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update match')
        }
      }
      
      dispatch({ type: 'UPDATE_MATCH', payload: match })
    } catch (error) {
      console.error('Failed to update match:', error)
      throw error
    }
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
   * Add a new dojo with automatically generated logo
   */
  const addDojo = async (name: string, location: string): Promise<Dojo> => {
    const newDojo: Dojo = {
      id: `dojo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      location,
      logo: generateDojoLogo(name), // Automatically generate logo
      teams: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage for development
        const updatedDojos = [...state.dojos, newDojo]
        localStorage.setItem('dojos', JSON.stringify(updatedDojos))
      } else {
        // Create via API
        const result = await dojoAPI.create(newDojo)
        if (!result.success) {
          throw new Error(result.error || 'Failed to create dojo')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'ADD_DOJO', payload: newDojo })
      
      return newDojo
    } catch (error) {
      console.error('Failed to add dojo:', error)
      throw error
    }
  }

  /**
   * Add a new team with automatically generated logo
   */
  const addTeam = async (name: string, dojoId: string): Promise<Team> => {
    const dojo = getDojoById(dojoId)
    const dojoName = dojo?.name || 'Unknown Dojo'
    
    const newTeam: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      dojoId,
      logo: generateTeamLogo(name, dojoName), // Automatically generate logo
      players: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage for development
        const updatedTeams = [...state.teams, newTeam]
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
      } else {
        // Create via API
        const result = await teamAPI.create(newTeam)
        if (!result.success) {
          throw new Error(result.error || 'Failed to create team')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'ADD_TEAM', payload: newTeam })
      
      return newTeam
    } catch (error) {
      console.error('Failed to add team:', error)
      throw error
    }
  }

  /**
   * Update dojo
   */
  const updateDojo = async (dojoId: string, updates: Partial<Dojo>): Promise<void> => {
    const dojo = getDojoById(dojoId)
    if (!dojo) throw new Error('Dojo not found')
    
    const updatedDojo: Dojo = { ...dojo, ...updates, updatedAt: new Date().toISOString() }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage for development
        const updatedDojos = state.dojos.map(d => d.id === dojoId ? updatedDojo : d)
        localStorage.setItem('dojos', JSON.stringify(updatedDojos))
      } else {
        // Update via API
        const result = await dojoAPI.update(dojoId, updates)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update dojo')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'UPDATE_DOJO', payload: updatedDojo })
    } catch (error) {
      console.error('Failed to update dojo:', error)
      throw error
    }
  }

  /**
   * Delete dojo (cascades to teams and users)
   */
  const deleteDojo = async (dojoId: string): Promise<void> => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage - remove dojo, teams, and users
        const updatedDojos = state.dojos.filter(d => d.id !== dojoId)
        const updatedTeams = state.teams.filter(t => t.dojoId !== dojoId)
        const updatedUsers = state.users.filter(u => u.dojoId !== dojoId)
        
        localStorage.setItem('dojos', JSON.stringify(updatedDojos))
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      } else {
        // Delete via API - cascade deletes should be handled by database constraints
        const result = await dojoAPI.delete(dojoId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete dojo')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'DELETE_DOJO', payload: dojoId })
    } catch (error) {
      console.error('Failed to delete dojo:', error)
      throw error
    }
  }

  /**
   * Update team
   */
  const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<void> => {
    const team = getTeamById(teamId)
    if (!team) throw new Error('Team not found')
    
    const updatedTeam: Team = { ...team, ...updates, updatedAt: new Date().toISOString() }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage for development
        const updatedTeams = state.teams.map(t => t.id === teamId ? updatedTeam : t)
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
      } else {
        // Update via API
        const result = await teamAPI.update(teamId, updates)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update team')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam })
    } catch (error) {
      console.error('Failed to update team:', error)
      throw error
    }
  }

  /**
   * Delete team (updates users to remove team assignment)
   */
  const deleteTeam = async (teamId: string): Promise<void> => {
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Update localStorage - remove team and update users
        const updatedTeams = state.teams.filter(t => t.id !== teamId)
        const updatedUsers = state.users.map(u => 
          u.teamId === teamId ? { ...u, teamId: undefined, teamName: undefined } : u
        )
        
        localStorage.setItem('teams', JSON.stringify(updatedTeams))
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      } else {
        // Delete via API
        const result = await teamAPI.delete(teamId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete team')
        }
        
        // Update users to remove team assignment
        const usersToUpdate = state.users.filter(u => u.teamId === teamId)
        await Promise.all(
          usersToUpdate.map(user => 
            userAPI.update(user.id, { teamId: undefined })
          )
        )
      }
      
      // Dispatch to state
      dispatch({ type: 'DELETE_TEAM', payload: teamId })
    } catch (error) {
      console.error('Failed to delete team:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const user = getUserById(userId)
    if (!user) throw new Error('User not found')
    
    const updatedUser: User = { ...user, ...updates, updatedAt: new Date().toISOString() }
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // If team is changing, update team player lists
        if (updates.teamId && updates.teamId !== user.teamId) {
          // Remove from old team
          if (user.teamId) {
            const oldTeam = getTeamById(user.teamId)
            if (oldTeam) {
              const updatedOldTeam = {
                ...oldTeam,
                players: oldTeam.players.filter(p => p.id !== userId)
              }
              const updatedTeams = state.teams.map(t => t.id === oldTeam.id ? updatedOldTeam : t)
              localStorage.setItem('teams', JSON.stringify(updatedTeams))
              dispatch({ type: 'UPDATE_TEAM', payload: updatedOldTeam })
            }
          }
          
          // Add to new team
          const newTeam = getTeamById(updates.teamId)
          if (newTeam) {
            const updatedNewTeam = {
              ...newTeam,
              players: [...newTeam.players.filter(p => p.id !== userId), updatedUser]
            }
            const updatedTeams = state.teams.map(t => t.id === newTeam.id ? updatedNewTeam : t)
            localStorage.setItem('teams', JSON.stringify(updatedTeams))
            dispatch({ type: 'UPDATE_TEAM', payload: updatedNewTeam })
          }
        }
        
        // Update localStorage
        const updatedUsers = state.users.map(u => u.id === userId ? updatedUser : u)
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      } else {
        // Update via API
        const result = await userAPI.update(userId, updates)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update user')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  /**
   * Delete user (removes from team)
   */
  const deleteUser = async (userId: string): Promise<void> => {
    const user = getUserById(userId)
    if (!user) throw new Error('User not found')
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL
      
      if (isDevelopment) {
        // Remove from team if assigned
        if (user.teamId) {
          const team = getTeamById(user.teamId)
          if (team) {
            const updatedTeam = {
              ...team,
              players: team.players.filter(p => p.id !== userId)
            }
            const updatedTeams = state.teams.map(t => t.id === team.id ? updatedTeam : t)
            localStorage.setItem('teams', JSON.stringify(updatedTeams))
            dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam })
          }
        }
        
        // Update localStorage
        const updatedUsers = state.users.filter(u => u.id !== userId)
        localStorage.setItem('users', JSON.stringify(updatedUsers))
      } else {
        // Delete via API
        const result = await userAPI.delete(userId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete user')
        }
      }
      
      // Dispatch to state
      dispatch({ type: 'DELETE_USER', payload: userId })
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
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
    addDojo,
    updateDojo,
    deleteDojo,
    addTeam,
    updateTeam,
    deleteTeam,
    updateUser,
    deleteUser,
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