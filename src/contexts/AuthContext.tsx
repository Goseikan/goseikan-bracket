import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthUser, LoginCredentials, RegisterData } from '../types'

/**
 * Authentication Context for managing user login state
 * Provides authentication methods and user data throughout the app
 */

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: AuthUser }
  | { type: 'REGISTER_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth reducer for managing authentication state
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true, error: null }
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null }
    
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return { ...state, loading: false, error: action.payload }
    
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Initial auth state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as AuthUser
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('authUser')
      }
    }
  }, [])

  /**
   * Login function - authenticates user with email and password
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      // Get users from localStorage (simulating API call)
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find((u: any) => 
        u.email === credentials.email && u.password === credentials.password
      )

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Create AuthUser object (excluding password)
      const authUser: AuthUser = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        dojoId: user.dojoId,
        teamId: user.teamId,
        kendoRank: user.kendoRank
      }

      // Store in localStorage for persistence
      localStorage.setItem('authUser', JSON.stringify(authUser))
      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage })
      throw error
    }
  }

  /**
   * Register function - creates new user account
   */
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'REGISTER_START' })
    
    try {
      // Get existing users and dojos
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const dojos = JSON.parse(localStorage.getItem('dojos') || '[]')
      const teams = JSON.parse(localStorage.getItem('teams') || '[]')

      // Check if email already exists
      if (users.find((u: any) => u.email === data.email)) {
        throw new Error('Email already registered')
      }

      // Find or create dojo
      let dojo = dojos.find((d: any) => d.name.toLowerCase() === data.dojoName.toLowerCase())
      if (!dojo) {
        dojo = {
          id: `dojo_${Date.now()}`,
          name: data.dojoName,
          teams: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        dojos.push(dojo)
      }

      // Find or create team within the dojo
      let team = teams.find((t: any) => 
        t.name.toLowerCase() === data.teamName.toLowerCase() && t.dojoId === dojo.id
      )
      if (!team) {
        team = {
          id: `team_${Date.now()}`,
          name: data.teamName,
          dojoId: dojo.id,
          players: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        teams.push(team)
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        password: data.password, // In real app, this would be hashed
        dateOfBirth: data.dateOfBirth,
        dojoId: dojo.id,
        teamId: team.id,
        role: 'participant' as const,
        kendoRank: data.kendoRank,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Update team players array
      team.players.push(newUser.id)

      // Save to localStorage
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('dojos', JSON.stringify(dojos))
      localStorage.setItem('teams', JSON.stringify(teams))

      // Create AuthUser object
      const authUser: AuthUser = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        dojoId: newUser.dojoId,
        teamId: newUser.teamId,
        kendoRank: newUser.kendoRank
      }

      // Store in localStorage and update state
      localStorage.setItem('authUser', JSON.stringify(authUser))
      dispatch({ type: 'REGISTER_SUCCESS', payload: authUser })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'REGISTER_ERROR', payload: errorMessage })
      throw error
    }
  }

  /**
   * Logout function - clears user session
   */
  const logout = (): void => {
    localStorage.removeItem('authUser')
    dispatch({ type: 'LOGOUT' })
  }

  /**
   * Clear error function - resets error state
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}