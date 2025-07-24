/**
 * API utility functions for making HTTP requests to the backend
 * Provides a consistent interface for all API calls
 */

import type { User, Dojo, Team, Tournament, Court, Match, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-vercel-app.vercel.app/api' 
  : '/api'

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// User API functions
export const userAPI = {
  getAll: () => apiRequest<User[]>('/users'),
  getById: (id: string) => apiRequest<User>(`/users?id=${id}`),
  create: (user: User) => apiRequest<User>('/users', {
    method: 'POST',
    body: JSON.stringify(user)
  }),
  update: (id: string, user: Partial<User>) => apiRequest<User>(`/users?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  }),
  delete: (id: string) => apiRequest<void>(`/users?id=${id}`, {
    method: 'DELETE'
  })
}

// Dojo API functions
export const dojoAPI = {
  getAll: () => apiRequest<Dojo[]>('/dojos'),
  getById: (id: string) => apiRequest<Dojo>(`/dojos?id=${id}`),
  create: (dojo: Dojo) => apiRequest<Dojo>('/dojos', {
    method: 'POST',
    body: JSON.stringify(dojo)
  }),
  update: (id: string, dojo: Partial<Dojo>) => apiRequest<Dojo>(`/dojos?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(dojo)
  }),
  delete: (id: string) => apiRequest<void>(`/dojos?id=${id}`, {
    method: 'DELETE'
  })
}

// Team API functions
export const teamAPI = {
  getAll: () => apiRequest<Team[]>('/teams'),
  getById: (id: string) => apiRequest<Team>(`/teams?id=${id}`),
  create: (team: Team) => apiRequest<Team>('/teams', {
    method: 'POST',
    body: JSON.stringify(team)
  }),
  update: (id: string, team: Partial<Team>) => apiRequest<Team>(`/teams?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(team)
  }),
  delete: (id: string) => apiRequest<void>(`/teams?id=${id}`, {
    method: 'DELETE'
  })
}

// Tournament API functions
export const tournamentAPI = {
  getAll: () => apiRequest<Tournament[]>('/tournaments'),
  getById: (id: string) => apiRequest<Tournament>(`/tournaments?id=${id}`),
  create: (tournament: Tournament) => apiRequest<Tournament>('/tournaments', {
    method: 'POST',
    body: JSON.stringify(tournament)
  }),
  update: (id: string, tournament: Partial<Tournament>) => apiRequest<Tournament>(`/tournaments?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(tournament)
  }),
  delete: (id: string) => apiRequest<void>(`/tournaments?id=${id}`, {
    method: 'DELETE'
  })
}

// Court API functions
export const courtAPI = {
  getAll: () => apiRequest<Court[]>('/courts'),
  getById: (id: string) => apiRequest<Court>(`/courts?id=${id}`),
  create: (court: Court) => apiRequest<Court>('/courts', {
    method: 'POST',
    body: JSON.stringify(court)
  }),
  update: (id: string, court: Partial<Court>) => apiRequest<Court>(`/courts?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(court)
  }),
  delete: (id: string) => apiRequest<void>(`/courts?id=${id}`, {
    method: 'DELETE'
  })
}

// Match API functions
export const matchAPI = {
  getAll: () => apiRequest<Match[]>('/matches'),
  getById: (id: string) => apiRequest<Match>(`/matches?id=${id}`),
  create: (match: Match) => apiRequest<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify(match)
  }),
  update: (id: string, match: Partial<Match>) => apiRequest<Match>(`/matches?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(match)
  }),
  delete: (id: string) => apiRequest<void>(`/matches?id=${id}`, {
    method: 'DELETE'
  })
}

// Auth API functions
export const authAPI = {
  login: (email: string, password: string) => apiRequest<User>('/auth', {
    method: 'POST',
    body: JSON.stringify({ action: 'login', email, password })
  }),
  register: (userData: User) => apiRequest<User>('/auth', {
    method: 'POST',
    body: JSON.stringify({ action: 'register', userData })
  })
}