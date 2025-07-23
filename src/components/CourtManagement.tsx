import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTournament } from '../contexts/TournamentContext'
import { Match, Court, ScoringAction } from '../types'
import { Monitor, Play, Pause, Users, Clock, Trophy, Plus, Settings, ExternalLink } from 'lucide-react'

/**
 * CourtManagement component for admin tournament control
 * Manages court assignments, match scheduling, and real-time scoring
 */

interface CourtManagementProps {
  onMatchAssign?: (matchId: string, courtId: string) => void
  onMatchStart?: (matchId: string) => void
  onMatchComplete?: (matchId: string, winnerId: string) => void
}

const CourtManagement: React.FC<CourtManagementProps> = ({
  onMatchAssign,
  onMatchStart,
  onMatchComplete
}) => {
  const navigate = useNavigate()
  const { tournament, updateTournament } = useTournament()
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [newCourtName, setNewCourtName] = useState('')
  const [showAddCourt, setShowAddCourt] = useState(false)

  if (!tournament) {
    return (
      <div className="card p-8 text-center">
        <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
          No Active Tournament
        </h3>
        <p className="text-body-large text-gray-600">
          Create a tournament to manage courts and matches.
        </p>
      </div>
    )
  }

  // Get all ready matches that need court assignment
  const readyMatches = getAllReadyMatches(tournament)
  const assignedMatches = getAllAssignedMatches(tournament)
  const activeMatches = assignedMatches.filter(match => match.status === 'in_progress')

  // Handle court creation
  const handleAddCourt = () => {
    if (!newCourtName.trim()) return

    const newCourt: Court = {
      id: `court_${Date.now()}`,
      name: newCourtName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTournament = {
      ...tournament,
      courts: [...tournament.courts, newCourt],
      updatedAt: new Date().toISOString()
    }

    updateTournament(updatedTournament)
    setNewCourtName('')
    setShowAddCourt(false)
  }

  // Handle match assignment to court
  const handleAssignMatch = (matchId: string, courtId: string) => {
    const match = findMatchById(tournament, matchId)
    const court = tournament.courts.find(c => c.id === courtId)
    
    if (!match || !court) return

    // Update match with court assignment
    const updatedMatch = {
      ...match,
      courtId,
      status: 'scheduled' as const,
      scheduledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update court with current match
    const updatedCourt = {
      ...court,
      currentMatchId: matchId,
      updatedAt: new Date().toISOString()
    }

    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updatedTournament.courts = updatedTournament.courts.map(c => 
      c.id === courtId ? updatedCourt : c
    )

    updateTournament(updatedTournament)
    onMatchAssign?.(matchId, courtId)
  }

  // Handle match start
  const handleStartMatch = (matchId: string) => {
    const match = findMatchById(tournament, matchId)
    if (!match) return

    const updatedMatch = {
      ...match,
      status: 'in_progress' as const,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updateTournament(updatedTournament)
    onMatchStart?.(matchId)
  }

  return (
    <div className="space-y-8">
      {/* Court Management Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Monitor className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-title-large font-semibold text-gray-900">
              Court Management
            </h2>
            <p className="text-body-medium text-gray-600">
              Assign matches to courts and monitor progress
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddCourt(!showAddCourt)}
          className="btn-outlined flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Court
        </button>
      </div>

      {/* Add Court Form */}
      {showAddCourt && (
        <div className="card p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Court name (e.g., Court 1, Main Court)"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              className="flex-1 input-outlined"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCourt()}
            />
            <button
              onClick={handleAddCourt}
              disabled={!newCourtName.trim()}
              className="btn-filled"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCourt(false)
                setNewCourtName('')
              }}
              className="btn-outlined"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Court Status Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Monitor className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-title-large font-bold text-gray-900">{tournament.courts.length}</div>
          <div className="text-body-small text-gray-600">Total Courts</div>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Play className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-title-large font-bold text-gray-900">{activeMatches.length}</div>
          <div className="text-body-small text-gray-600">Active Matches</div>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-title-large font-bold text-gray-900">{readyMatches.length}</div>
          <div className="text-body-small text-gray-600">Pending Matches</div>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-title-large font-bold text-gray-900">{assignedMatches.length}</div>
          <div className="text-body-small text-gray-600">Scheduled Matches</div>
        </div>
      </div>

      {/* Court Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournament.courts.map((court) => {
          const currentMatch = court.currentMatchId ? findMatchById(tournament, court.currentMatchId) : null
          const isActive = currentMatch?.status === 'in_progress'
          const isScheduled = currentMatch?.status === 'scheduled'

          return (
            <div key={court.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-medium font-semibold text-gray-900">
                  {court.name}
                </h3>
                <div className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-green-500' :
                  isScheduled ? 'bg-yellow-500' :
                  'bg-gray-300'
                }`} />
              </div>

              {currentMatch ? (
                <div className="space-y-3">
                  <CourtMatchDisplay match={currentMatch} />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {currentMatch.status === 'scheduled' && (
                        <button
                          onClick={() => handleStartMatch(currentMatch.id)}
                          className="btn-filled flex items-center text-sm flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/court/${court.id}`)}
                        className="btn-outlined flex items-center text-sm flex-1"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </button>
                    </div>
                    <button
                      onClick={() => window.open(`/court/${court.id}/public`, '_blank')}
                      className="btn-text flex items-center text-sm w-full justify-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Public Display
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-body-small text-gray-500 mb-4">
                    No match assigned
                  </p>
                  {readyMatches.length > 0 && (
                    <select
                      onChange={(e) => e.target.value && handleAssignMatch(e.target.value, court.id)}
                      className="input-outlined text-sm"
                      defaultValue=""
                    >
                      <option value="">Select match to assign</option>
                      {readyMatches.map((match) => (
                        <option key={match.id} value={match.id}>
                          {getMatchDisplayName(match, tournament)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pending Matches */}
      {readyMatches.length > 0 && (
        <div className="card p-6">
          <h3 className="text-title-large font-semibold text-gray-900 mb-4">
            Pending Match Assignment
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyMatches.map((match) => (
              <div key={match.id} className="bg-gray-50 rounded-lg p-4">
                <div className="text-title-small font-medium text-gray-900 mb-2">
                  {getMatchDisplayName(match, tournament)}
                </div>
                <div className="text-body-small text-gray-600 mb-3">
                  {match.stage === 'seed' ? 'Seed Stage' : 'Main Bracket'}
                </div>
                <select
                  onChange={(e) => e.target.value && handleAssignMatch(match.id, e.target.value)}
                  className="input-outlined text-sm w-full"
                  defaultValue=""
                >
                  <option value="">Assign to court</option>
                  {tournament.courts
                    .filter(court => !court.currentMatchId)
                    .map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for displaying match info on court
const CourtMatchDisplay: React.FC<{ match: Match }> = ({ match }) => {
  const { teams } = useTournament()
  
  const team1 = teams.find(t => t.id === match.team1Id)
  const team2 = teams.find(t => t.id === match.team2Id)

  return (
    <div className="space-y-2">
      <div className="text-body-small text-gray-600">
        {match.stage === 'seed' ? 'Seed Stage' : 'Main Bracket'}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-body-small font-medium">{team1?.name || 'TBD'}</span>
          <span className="text-body-small font-bold">{match.scores.team1Wins}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-small font-medium">{team2?.name || 'TBD'}</span>
          <span className="text-body-small font-bold">{match.scores.team2Wins}</span>
        </div>
      </div>
      <div className="text-body-small text-gray-500">
        Set {match.currentPlayerSet}/7
      </div>
    </div>
  )
}

// Helper functions
const getAllReadyMatches = (tournament: any): Match[] => {
  const matches: Match[] = []
  
  // Get seed group matches
  tournament.seedGroups.forEach((group: any) => {
    matches.push(...group.matches.filter((match: Match) => 
      match.status === 'scheduled' && !match.courtId
    ))
  })
  
  // TODO: Add main bracket matches when implemented
  return matches
}

const getAllAssignedMatches = (tournament: any): Match[] => {
  const matches: Match[] = []
  
  // Get seed group matches
  tournament.seedGroups.forEach((group: any) => {
    matches.push(...group.matches.filter((match: Match) => match.courtId))
  })
  
  return matches
}

const findMatchById = (tournament: any, matchId: string): Match | undefined => {
  // Search in seed groups
  for (const group of tournament.seedGroups) {
    const match = group.matches.find((m: Match) => m.id === matchId)
    if (match) return match
  }
  
  // TODO: Search in main bracket when implemented
  return undefined
}

const updateMatchInTournament = (tournament: any, updatedMatch: Match) => {
  const newTournament = { ...tournament }
  
  // Update in seed groups
  newTournament.seedGroups = newTournament.seedGroups.map((group: any) => ({
    ...group,
    matches: group.matches.map((match: Match) =>
      match.id === updatedMatch.id ? updatedMatch : match
    )
  }))
  
  return newTournament
}

const getMatchDisplayName = (match: Match, tournament: any): string => {
  const { teams } = useTournament()
  const team1 = teams.find(t => t.id === match.team1Id)
  const team2 = teams.find(t => t.id === match.team2Id)
  
  return `${team1?.name || 'TBD'} vs ${team2?.name || 'TBD'}`
}

export default CourtManagement