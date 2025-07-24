import React, { useState, useEffect } from 'react'
import { Match, Team, PlayerSetResult, ScoringAction, OvertimeData } from '../types'
import { useTournament } from '../contexts/TournamentContext'
import { X, Trophy, Users, CheckCircle, Clock, AlertTriangle, Target, Swords, Undo2, RotateCcw } from 'lucide-react'

/**
 * Helper functions for kendo scoring calculations
 */
// Calculate points from actions (includes hansoku points awarded)
const calculateDirectPoints = (actions: ScoringAction[]): number => {
  return actions.filter(action => 
    ['men', 'kote', 'tsuki', 'do', 'hansoku_point'].includes(action.type) && action.confirmed
  ).length
}

// Calculate hansoku count for a player
const calculateHansokuCount = (actions: ScoringAction[]): number => {
  return actions.filter(action => 
    action.type === 'hansoku' && action.confirmed
  ).length
}

// Calculate total points including opponent's hansoku penalties
const calculateTotalPoints = (playerActions: ScoringAction[], opponentActions: ScoringAction[]): number => {
  const directPoints = calculateDirectPoints(playerActions)
  const opponentHansokuCount = calculateHansokuCount(opponentActions)
  return directPoints + Math.floor(opponentHansokuCount / 2) // 2 hansoku from opponent = 1 point for this player
}

/**
 * MatchResultModal component for reporting detailed kendo match results
 * Shows 7 individual player matches with complete scoring system
 */

interface MatchResultModalProps {
  match: Match
  team1: Team
  team2: Team
  isOpen: boolean
  onClose: () => void
  onSave: (matchId: string, winnerId: string, scores: { team1Wins: number, team2Wins: number, team1TotalPoints?: number, team2TotalPoints?: number, playerSets?: any[], status?: string, overtime?: OvertimeData | null }) => void
}

interface IndividualMatchState {
  setNumber: number
  team1PlayerId: string
  team2PlayerId: string
  team1Actions: ScoringAction[]
  team2Actions: ScoringAction[]
  result: 'pending' | 'team1_win' | 'team2_win' | 'draw' | 'forfeit_team1' | 'forfeit_team2'
  timeLimit: number
  timeRemaining: number
  isCompleted: boolean
}

const MatchResultModal: React.FC<MatchResultModalProps> = ({
  match,
  team1,
  team2,
  isOpen,
  onClose,
  onSave
}) => {
  const { teams } = useTournament()
  const [individualMatches, setIndividualMatches] = useState<IndividualMatchState[]>([])
  const [needsOvertime, setNeedsOvertime] = useState(false)
  const [overtimeData, setOvertimeData] = useState<OvertimeData | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialize individual matches when modal opens or load existing match data
  useEffect(() => {
    if (isOpen) {
      // Always create fresh match data - only load existing data if it has complete individual match details
      const hasDetailedData = match.scores && 
                             match.scores.playerSets && 
                             match.scores.playerSets.length === 7 && 
                             match.scores.playerSets.every(set => set.actions && set.team1PlayerId && set.team2PlayerId)

      if (hasDetailedData) {
        // Load existing detailed match data
        const existingMatches: IndividualMatchState[] = []
        for (let i = 0; i < 7; i++) {
          const existingSet = match.scores.playerSets.find(set => set.setNumber === i + 1)!
          
          existingMatches.push({
            setNumber: i + 1,
            team1PlayerId: existingSet.team1PlayerId,
            team2PlayerId: existingSet.team2PlayerId,
            team1Actions: existingSet.actions.filter(a => a.playerId === existingSet.team1PlayerId),
            team2Actions: existingSet.actions.filter(a => a.playerId === existingSet.team2PlayerId),
            result: existingSet.result === 'win' ? 
              (existingSet.winnerId === existingSet.team1PlayerId ? 'team1_win' : 'team2_win') :
              existingSet.result === 'draw' ? 'draw' :
              existingSet.result === 'forfeit' ? 
                (existingSet.winnerId === existingSet.team1PlayerId ? 'forfeit_team2' : 'forfeit_team1') :
              'pending',
            timeLimit: 180,
            timeRemaining: existingSet.timeRemaining || 180,
            isCompleted: existingSet.result && existingSet.result !== 'pending'
          })
        }
        setIndividualMatches(existingMatches)
        
        // Load existing overtime data if present
        if (match.overtime) {
          setOvertimeData(match.overtime)
          setNeedsOvertime(true)
        } else if (match.status === 'overtime') {
          // Match is in overtime state but no overtime data saved yet
          setNeedsOvertime(true)
          setOvertimeData(null)
        } else {
          setNeedsOvertime(false)
          setOvertimeData(null)
        }
      } else {
        // Create fresh match data (for new matches or legacy completed matches without detailed data)
        const matches: IndividualMatchState[] = []
        for (let i = 0; i < 7; i++) {
          // Only assign players to positions within their team size, otherwise use missing player
          const team1Player = i < team1.players.length ? team1.players[i] : null
          const team2Player = i < team2.players.length ? team2.players[i] : null
          const team1PlayerId = team1Player?.id || `missing_team1_${i + 1}` // Use placeholder ID for missing players
          const team2PlayerId = team2Player?.id || `missing_team2_${i + 1}` // Use placeholder ID for missing players
          
          matches.push({
            setNumber: i + 1,
            team1PlayerId,
            team2PlayerId,
            team1Actions: [],
            team2Actions: [],
            result: 'pending', // All matches start as pending, require manual input
            timeLimit: 180,
            timeRemaining: 180,
            isCompleted: false
          })
        }
        setIndividualMatches(matches)
        
        // Handle overtime state for fresh matches
        if (match.overtime) {
          setOvertimeData(match.overtime)
          setNeedsOvertime(true)
        } else if (match.status === 'overtime') {
          setNeedsOvertime(true)
          setOvertimeData(null)
        } else {
          setNeedsOvertime(false)
          setOvertimeData(null)
        }
      }
      setIsInitialLoad(true) // Reset initial load flag when modal opens
      setWasCompletedOnOpen(match.status === 'completed') // Track if match was completed when opened
    }
  }, [isOpen, team1.players, team2.players, match.scores])

  if (!isOpen) return null

  // Get player by ID (returns null for missing players with placeholder IDs)
  const getPlayerById = (playerId: string) => {
    // Check if this is a placeholder ID for a missing player
    if (playerId.startsWith('missing_')) {
      return null
    }
    const allPlayers = [...team1.players, ...team2.players]
    return allPlayers.find(p => p.id === playerId)
  }


  // Add scoring action to individual match
  const addScoringAction = (
    matchIndex: number, 
    playerId: string, 
    actionType: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku'
  ) => {
    const updatedMatches = [...individualMatches]
    const targetMatch = updatedMatches[matchIndex]
    
    const newAction: ScoringAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: actionType,
      playerId,
      timestamp: new Date().toISOString(),
      confirmed: true
    }

    // Add action to appropriate team
    if (playerId === targetMatch.team1PlayerId) {
      targetMatch.team1Actions.push(newAction)
    } else {
      targetMatch.team2Actions.push(newAction)
    }

    // Reset hansoku counts if points were awarded
    resetHansokuAfterPoint(targetMatch)
    
    // Check if match should end
    checkMatchCompletion(targetMatch)
    setIndividualMatches(updatedMatches)
  }

  // Check if individual match should end and reset hansoku counts when points are awarded
  const checkMatchCompletion = (matchState: IndividualMatchState) => {
    const team1FinalPoints = calculateTotalPoints(matchState.team1Actions, matchState.team2Actions)
    const team2FinalPoints = calculateTotalPoints(matchState.team2Actions, matchState.team1Actions)

    // First to 2 points wins
    if (team1FinalPoints >= 2) {
      matchState.result = 'team1_win'
      matchState.isCompleted = true
    } else if (team2FinalPoints >= 2) {
      matchState.result = 'team2_win'
      matchState.isCompleted = true
    }
    // Time expired logic would go here if implementing real-time timing
  }

  // Reset hansoku counts when a point is awarded due to 2 hansoku and award hansoku point to opponent
  const resetHansokuAfterPoint = (matchState: IndividualMatchState) => {
    const team1HansokuCount = calculateHansokuCount(matchState.team1Actions)
    const team2HansokuCount = calculateHansokuCount(matchState.team2Actions)
    
    // Reset team1 hansoku if they gave opponent a point and award hansoku point to team2
    if (team1HansokuCount >= 2) {
      const hansokuPointsToAward = Math.floor(team1HansokuCount / 2)
      
      // Award hansoku points to team2 player
      for (let i = 0; i < hansokuPointsToAward; i++) {
        const hansokuPointAction: ScoringAction = {
          id: `hansoku_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'hansoku_point' as any, // Special type to track hansoku points awarded
          playerId: matchState.team2PlayerId,
          timestamp: new Date().toISOString(),
          confirmed: true
        }
        matchState.team2Actions.push(hansokuPointAction)
      }
      
      // Remove the hansoku that caused the point
      const hansokuToRemove = hansokuPointsToAward * 2
      for (let i = 0; i < hansokuToRemove; i++) {
        const hansokuIndex = matchState.team1Actions.findIndex(a => a.type === 'hansoku')
        if (hansokuIndex !== -1) {
          matchState.team1Actions.splice(hansokuIndex, 1)
        }
      }
    }
    
    // Reset team2 hansoku if they gave opponent a point and award hansoku point to team1
    if (team2HansokuCount >= 2) {
      const hansokuPointsToAward = Math.floor(team2HansokuCount / 2)
      
      // Award hansoku points to team1 player
      for (let i = 0; i < hansokuPointsToAward; i++) {
        const hansokuPointAction: ScoringAction = {
          id: `hansoku_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'hansoku_point' as any, // Special type to track hansoku points awarded
          playerId: matchState.team1PlayerId,
          timestamp: new Date().toISOString(),
          confirmed: true
        }
        matchState.team1Actions.push(hansokuPointAction)
      }
      
      // Remove the hansoku that caused the point
      const hansokuToRemove = hansokuPointsToAward * 2
      for (let i = 0; i < hansokuToRemove; i++) {
        const hansokuIndex = matchState.team2Actions.findIndex(a => a.type === 'hansoku')
        if (hansokuIndex !== -1) {
          matchState.team2Actions.splice(hansokuIndex, 1)
        }
      }
    }
  }

  // Set match result manually
  const setMatchResult = (matchIndex: number, result: IndividualMatchState['result']) => {
    const updatedMatches = [...individualMatches]
    updatedMatches[matchIndex].result = result
    updatedMatches[matchIndex].isCompleted = true
    setIndividualMatches(updatedMatches)
  }

  // Undo last scoring action for a player
  const undoLastAction = (matchIndex: number, playerId: string) => {
    const updatedMatches = [...individualMatches]
    const targetMatch = updatedMatches[matchIndex]
    
    if (playerId === targetMatch.team1PlayerId && targetMatch.team1Actions.length > 0) {
      targetMatch.team1Actions.pop()
    } else if (playerId === targetMatch.team2PlayerId && targetMatch.team2Actions.length > 0) {
      targetMatch.team2Actions.pop()
    }
    
    // Reset completion status and check if match should still be completed
    targetMatch.result = 'pending'
    targetMatch.isCompleted = false
    checkMatchCompletion(targetMatch)
    setIndividualMatches(updatedMatches)
  }

  // Reset entire individual match
  const resetMatch = (matchIndex: number) => {
    const updatedMatches = [...individualMatches]
    updatedMatches[matchIndex] = {
      ...updatedMatches[matchIndex],
      team1Actions: [],
      team2Actions: [],
      result: 'pending',
      isCompleted: false,
      timeRemaining: updatedMatches[matchIndex].timeLimit
    }
    setIndividualMatches(updatedMatches)
  }

  // Calculate team match winner
  const calculateTeamWinner = (): { winnerId?: string, needsOvertime: boolean } => {
    let team1Wins = 0
    let team2Wins = 0
    let team1TotalPoints = 0
    let team2TotalPoints = 0

    individualMatches.forEach(match => {
      if (match.result === 'team1_win' || match.result === 'forfeit_team2') {
        team1Wins++
      } else if (match.result === 'team2_win' || match.result === 'forfeit_team1') {
        team2Wins++
      }

      // Calculate total points using new hansoku logic
      team1TotalPoints += calculateTotalPoints(match.team1Actions, match.team2Actions)
      team2TotalPoints += calculateTotalPoints(match.team2Actions, match.team1Actions)
    })

    // Primary: Most individual match wins
    if (team1Wins > team2Wins) {
      return { winnerId: team1.id, needsOvertime: false }
    } else if (team2Wins > team1Wins) {
      return { winnerId: team2.id, needsOvertime: false }
    }

    // Tiebreaker 1: Most total points
    if (team1TotalPoints > team2TotalPoints) {
      return { winnerId: team1.id, needsOvertime: false }
    } else if (team2TotalPoints > team1TotalPoints) {
      return { winnerId: team2.id, needsOvertime: false }
    }

    // Tiebreaker 2: Overtime needed
    return { winnerId: undefined, needsOvertime: true }
  }

  // Track if this is initial load to prevent auto-close on completed matches
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [wasCompletedOnOpen, setWasCompletedOnOpen] = useState(false)

  // Auto-save individual match progress
  useEffect(() => {
    // Skip auto-save on initial load to prevent immediate closing of completed matches
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    // Don't auto-save if this is a completed match that was just loaded
    if (match.status === 'completed' && individualMatches.length > 0) {
      const hasChanges = individualMatches.some(m => 
        !m.isCompleted || m.team1Actions.length === 0 || m.team2Actions.length === 0
      )
      if (!hasChanges) {
        return // Skip saving if no actual changes were made to a completed match
      }
    }

    const saveProgress = async () => {
      // Always save current progress, even if not all matches are complete
      try {
        const team1Wins = individualMatches.filter(m => 
          m.result === 'team1_win' || m.result === 'forfeit_team2'
        ).length
        const team2Wins = individualMatches.filter(m => 
          m.result === 'team2_win' || m.result === 'forfeit_team1'
        ).length

        // Create detailed player set results for saving
        const playerSets: any[] = individualMatches.map(m => ({
          setNumber: m.setNumber,
          team1PlayerId: m.team1PlayerId,
          team2PlayerId: m.team2PlayerId,
          winnerId: m.result === 'team1_win' || m.result === 'forfeit_team2' ? m.team1PlayerId :
                   m.result === 'team2_win' || m.result === 'forfeit_team1' ? m.team2PlayerId : 
                   undefined,
          result: m.result === 'team1_win' || m.result === 'team2_win' ? 'win' :
                 m.result === 'draw' ? 'draw' :
                 m.result === 'forfeit_team1' || m.result === 'forfeit_team2' ? 'forfeit' :
                 'pending',
          actions: [...m.team1Actions, ...m.team2Actions],
          team1Points: calculateDirectPoints(m.team1Actions),
          team2Points: calculateDirectPoints(m.team2Actions),
          timeLimit: m.timeLimit,
          timeRemaining: m.timeRemaining,
          startedAt: new Date().toISOString(),
          completedAt: m.isCompleted ? new Date().toISOString() : undefined
        }))
        
        // Calculate total individual points across all matches
        const team1TotalPoints = individualMatches.reduce((total, m) => 
          total + calculateDirectPoints(m.team1Actions), 0
        )
        const team2TotalPoints = individualMatches.reduce((total, m) => 
          total + calculateDirectPoints(m.team2Actions), 0
        )

        // Check if all matches are complete
        const allCompleted = individualMatches.every(match => match.isCompleted)
        const result = calculateTeamWinner()
        
        if (allCompleted) {
          if (result.needsOvertime && !overtimeData?.winnerId) {
            setNeedsOvertime(true)
            // Save progress but don't close modal yet - mark as overtime status
            await onSave(match.id, '', { team1Wins, team2Wins, team1TotalPoints, team2TotalPoints, playerSets, status: 'overtime', overtime: overtimeData })
            return
          }

          if (result.winnerId || overtimeData?.winnerId) {
            const winnerId = result.winnerId || overtimeData?.winnerId || ''
            await onSave(match.id, winnerId, { team1Wins, team2Wins, team1TotalPoints, team2TotalPoints, playerSets, status: 'completed', overtime: overtimeData })
            // Don't auto-close modal - let user manually close to review results
            return
          }
        }

        // Save progress for incomplete matches (without winner and without closing modal) - mark as in_progress
        await onSave(match.id, '', { team1Wins, team2Wins, team1TotalPoints, team2TotalPoints, playerSets, status: 'in_progress' })
        
      } catch (error) {
        console.error('Failed to save match progress:', error)
      }
    }

    // Only save if there are individual matches and some actual scoring changes have been made
    if (individualMatches.length > 0) {
      // Check if there are any scoring actions or completed matches
      const hasActualChanges = individualMatches.some(m => 
        m.team1Actions.length > 0 || m.team2Actions.length > 0 || m.isCompleted
      )
      
      if (hasActualChanges) {
        saveProgress()
      }
    }
  }, [individualMatches, overtimeData, match.id, onSave])

  const completedMatches = individualMatches.filter(m => m.isCompleted).length
  const result = calculateTeamWinner()

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h3 className="text-title-large font-semibold text-gray-900">
                Report Team Match Result
              </h3>
              <p className="text-body-medium text-gray-600">
                {team1.name} vs {team2.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Progress Summary */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-title-medium font-semibold">Progress: {completedMatches}/7 matches completed</span>
                {/* Show current team score */}
                <div className="text-body-medium text-gray-600 mt-1">
                  {(() => {
                    const team1Wins = individualMatches.filter(m => 
                      m.result === 'team1_win' || m.result === 'forfeit_team2'
                    ).length
                    const team2Wins = individualMatches.filter(m => 
                      m.result === 'team2_win' || m.result === 'forfeit_team1'
                    ).length
                    const team1Points = individualMatches.reduce((total, m) => 
                      total + calculateDirectPoints(m.team1Actions), 0
                    )
                    const team2Points = individualMatches.reduce((total, m) => 
                      total + calculateDirectPoints(m.team2Actions), 0
                    )
                    return (
                      <>
                        <div>{team1.name} vs {team2.name}</div>
                        <div>{team1Wins} - {team2Wins} ({team1Points} - {team2Points} pts)</div>
                      </>
                    )
                  })()}
                </div>
              </div>
              {completedMatches === 7 ? (
                <>
                  {(result.winnerId || overtimeData?.winnerId) && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {(() => {
                          const finalWinnerId = result.winnerId || overtimeData?.winnerId
                          const winnerTeamName = finalWinnerId === team1.id ? team1.name : team2.name
                          const overtimeNote = overtimeData?.winnerId ? ' (Overtime)' : ''
                          return `${winnerTeamName} Wins${overtimeNote}`
                        })()}
                      </span>
                    </div>
                  )}
                  {result.needsOvertime && !result.winnerId && !overtimeData?.winnerId && (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {overtimeData && !overtimeData.winnerId ? 'Overtime In Progress' : 'Overtime Required'}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center text-blue-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium">Match Ongoing</span>
                </div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedMatches / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Individual Matches */}
          <div className="space-y-4">
            <h4 className="text-title-medium font-semibold text-gray-900">Individual Matches</h4>
            {individualMatches.map((individualMatch, index) => (
              <IndividualMatchCard
                key={individualMatch.setNumber}
                matchState={individualMatch}
                matchIndex={index}
                team1={team1}
                team2={team2}
                getPlayerById={getPlayerById}
                addScoringAction={addScoringAction}
                setMatchResult={setMatchResult}
                undoLastAction={undoLastAction}
                resetMatch={resetMatch}
              />
            ))}
          </div>

          {/* Overtime Section */}
          {needsOvertime && completedMatches === 7 && (
            <OvertimeSection
              team1={team1}
              team2={team2}
              overtimeData={overtimeData}
              setOvertimeData={setOvertimeData}
            />
          )}

          {/* Close button */}
          <div className="flex justify-center pt-4 border-t">
            <button
              onClick={onClose}
              className="btn-outlined"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Individual Match Card Component
interface IndividualMatchCardProps {
  matchState: IndividualMatchState
  matchIndex: number
  team1: Team
  team2: Team
  getPlayerById: (id: string) => any
  addScoringAction: (index: number, playerId: string, actionType: any) => void
  setMatchResult: (index: number, result: any) => void
  undoLastAction: (index: number, playerId: string) => void
  resetMatch: (index: number) => void
}

const IndividualMatchCard: React.FC<IndividualMatchCardProps> = ({
  matchState,
  matchIndex,
  team1,
  team2,
  getPlayerById,
  addScoringAction,
  setMatchResult,
  undoLastAction,
  resetMatch
}) => {
  const team1Player = getPlayerById(matchState.team1PlayerId)
  const team2Player = getPlayerById(matchState.team2PlayerId)
  const team1FinalPoints = calculateTotalPoints(matchState.team1Actions, matchState.team2Actions)
  const team2FinalPoints = calculateTotalPoints(matchState.team2Actions, matchState.team1Actions)
  const team1HansokuCount = calculateHansokuCount(matchState.team1Actions)
  const team2HansokuCount = calculateHansokuCount(matchState.team2Actions)

  // Determine match card styling based on result
  const getMatchCardStyle = () => {
    if (!matchState.isCompleted) return 'border-gray-200 bg-white'
    
    switch (matchState.result) {
      case 'draw':
        return 'border-yellow-300 bg-yellow-50'
      case 'team1_win':
      case 'team2_win':
      case 'forfeit_team1':
      case 'forfeit_team2':
        return 'border-green-300 bg-green-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  // Get winner display info
  const getWinnerInfo = () => {
    if (!matchState.isCompleted) return null
    
    switch (matchState.result) {
      case 'team1_win':
        return { name: team1Player?.fullName, team: team1.name, color: 'text-green-700' }
      case 'team2_win':
        return { name: team2Player?.fullName, team: team2.name, color: 'text-green-700' }
      case 'forfeit_team1':
        return { name: team2Player?.fullName, team: team2.name, color: 'text-green-700', note: '(forfeit)' }
      case 'forfeit_team2':
        return { name: team1Player?.fullName, team: team1.name, color: 'text-green-700', note: '(forfeit)' }
      case 'draw':
        return { name: 'Draw', team: '', color: 'text-yellow-700' }
      default:
        return null
    }
  }

  const winnerInfo = getWinnerInfo()

  return (
    <div className={`card p-4 ${getMatchCardStyle()}`}>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-title-small font-semibold">Match {matchState.setNumber}</h5>
        <div className="flex items-center space-x-2">
          {matchState.isCompleted && winnerInfo && (
            <div className={`flex items-center px-3 py-1 rounded-full ${
              matchState.result === 'draw' ? 'bg-yellow-200' : 'bg-green-200'
            }`}>
              <CheckCircle className={`w-4 h-4 mr-1 ${winnerInfo.color}`} />
              <span className={`text-body-small font-bold ${winnerInfo.color}`}>
                {winnerInfo.name} {winnerInfo.note && winnerInfo.note}
                {matchState.result !== 'draw' && (
                  <span className="ml-2 text-xs">
                    {matchState.result === 'team1_win' || matchState.result === 'forfeit_team2' 
                      ? `${team1FinalPoints}-${team2FinalPoints}`
                      : `${team2FinalPoints}-${team1FinalPoints}`
                    }
                  </span>
                )}
              </span>
            </div>
          )}
          {/* Reset Match Button */}
          {(matchState.team1Actions.length > 0 || matchState.team2Actions.length > 0 || matchState.isCompleted) && (
            <button
              onClick={() => resetMatch(matchIndex)}
              className="btn-text text-red-600 text-xs flex items-center"
              title="Reset entire match"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-9 gap-1 items-center">
          {/* Team 1 Player */}
          <div className="md:col-span-4">
            <PlayerMatchCard
              player={team1Player}
              teamName={team1.name}
              points={team1FinalPoints}
              actions={matchState.team1Actions}
              opponentActions={matchState.team2Actions}
              hansokuCount={team1HansokuCount}
              isWinner={matchState.result === 'team1_win'}
              isCompleted={matchState.isCompleted}
              onScoreAction={(actionType) => addScoringAction(matchIndex, matchState.team1PlayerId, actionType)}
              onUndoAction={() => undoLastAction(matchIndex, matchState.team1PlayerId)}
            />
          </div>

          {/* Cross-Swords Icon */}
          <div className="flex justify-center px-1">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm border border-gray-300">
              <Swords className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Team 2 Player */}
          <div className="md:col-span-4">
            <PlayerMatchCard
              player={team2Player}
              teamName={team2.name}
              points={team2FinalPoints}
              actions={matchState.team2Actions}
              opponentActions={matchState.team1Actions}
              hansokuCount={team2HansokuCount}
              isWinner={matchState.result === 'team2_win'}
              isCompleted={matchState.isCompleted}
              onScoreAction={(actionType) => addScoringAction(matchIndex, matchState.team2PlayerId, actionType)}
              onUndoAction={() => undoLastAction(matchIndex, matchState.team2PlayerId)}
            />
          </div>
        </div>
      </div>

      {/* Match Result Controls - available for all matches */}
      {!matchState.isCompleted && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="text-body-small font-medium text-gray-700 mb-2">Set Match Result:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setMatchResult(matchIndex, 'team1_win')}
              className="btn-outlined text-sm"
            >
              {team1Player?.fullName || 'Missing Player'} Wins
            </button>
            <button
              onClick={() => setMatchResult(matchIndex, 'team2_win')}
              className="btn-outlined text-sm"
            >
              {team2Player?.fullName || 'Missing Player'} Wins
            </button>
            <button
              onClick={() => setMatchResult(matchIndex, 'draw')}
              className="btn-outlined text-sm"
            >
              Draw
            </button>
            <button
              onClick={() => setMatchResult(matchIndex, 'forfeit_team1')}
              className="btn-outlined text-sm text-red-600"
            >
              {team1Player?.fullName || 'Missing Player'} Forfeit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Player Match Card Component
interface PlayerMatchCardProps {
  player: any
  teamName: string
  points: number
  actions: ScoringAction[]
  opponentActions: ScoringAction[]
  hansokuCount: number
  isWinner: boolean
  isCompleted: boolean
  onScoreAction: (actionType: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku') => void
  onUndoAction: () => void
}

const PlayerMatchCard: React.FC<PlayerMatchCardProps> = ({
  player,
  teamName,
  points,
  actions,
  opponentActions,
  hansokuCount,
  isWinner,
  isCompleted,
  onScoreAction,
  onUndoAction
}) => {
  const validPointActions = actions.filter(a => ['men', 'kote', 'tsuki', 'do'].includes(a.type))
  const hansokuPointActions = actions.filter(a => a.type === 'hansoku_point')
  const hansokuActions = actions.filter(a => a.type === 'hansoku')
  const currentHansokuCount = hansokuActions.length

  const isPlayerMissing = !player?.id
  
  return (
    <div className={`p-4 rounded-lg border flex flex-col ${
      isWinner ? 'border-green-300 bg-green-50' : 
      isPlayerMissing ? 'border-amber-200 bg-amber-50' :
      'border-gray-200 bg-gray-50'
    }`}>
      <div className={`text-center ${validPointActions.length === 0 && isCompleted ? 'flex-1 flex flex-col justify-center' : 'mb-3'}`}>
        <div className="text-body-medium font-semibold text-gray-900">
          {player?.fullName || 'Missing Player'}
        </div>
        <div className="text-body-small text-gray-600">
          {isPlayerMissing ? `${teamName} • Available for scoring` : `${player?.kendoRank} • ${teamName}`}
        </div>
        {/* Show specific scoring actions */}
        {(validPointActions.length > 0 || hansokuPointActions.length > 0) && (
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {/* Regular scoring actions */}
            {validPointActions.map((action, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 text-xs font-bold rounded-full"
              >
                {action.type === 'men' ? 'M' : 
                 action.type === 'kote' ? 'K' : 
                 action.type === 'do' ? 'D' : 
                 action.type === 'tsuki' ? 'T' : action.type.charAt(0).toUpperCase()}
              </span>
            ))}
            {/* Hansoku points earned from opponent */}
            {hansokuPointActions.map((action, idx) => (
              <span 
                key={`hansoku-${idx}`} 
                className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 text-xs font-bold rounded-full"
              >
                H
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Scoring Actions - show for all players (including missing ones) */}
      {!isCompleted && (
        <div className="space-y-2 mb-3">
          <div className="text-body-small font-medium text-gray-700">Add Score:</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => onScoreAction('men')}
              className="btn-outlined text-xs py-1"
            >
              Men
            </button>
            <button
              onClick={() => onScoreAction('kote')}
              className="btn-outlined text-xs py-1"
            >
              Kote
            </button>
            <button
              onClick={() => onScoreAction('do')}
              className="btn-outlined text-xs py-1"
            >
              Do
            </button>
            <button
              onClick={() => onScoreAction('tsuki')}
              className="btn-outlined text-xs py-1"
            >
              Tsuki
            </button>
          </div>
          <button
            onClick={() => onScoreAction('hansoku')}
            className="btn-outlined text-xs py-1 w-full text-red-600 border-red-200"
          >
            Hansoku ({currentHansokuCount})
          </button>
          {/* Undo Button */}
          {actions.length > 0 && (
            <button
              onClick={onUndoAction}
              className="btn-text text-xs py-1 w-full text-gray-500 flex items-center justify-center"
              title="Undo last action"
            >
              <Undo2 className="w-3 h-3 mr-1" />
              Undo Last
            </button>
          )}
        </div>
      )}

    </div>
  )
}

// Overtime Section Component
interface OvertimeSectionProps {
  team1: Team
  team2: Team
  overtimeData: OvertimeData | null
  setOvertimeData: (data: OvertimeData | null) => void
}

const OvertimeSection: React.FC<OvertimeSectionProps> = ({
  team1,
  team2,
  overtimeData,
  setOvertimeData
}) => {
  const [selectedTeam1Player, setSelectedTeam1Player] = useState('')
  const [selectedTeam2Player, setSelectedTeam2Player] = useState('')

  const handleStartOvertime = () => {
    if (!selectedTeam1Player || !selectedTeam2Player) return

    setOvertimeData({
      team1PlayerId: selectedTeam1Player,
      team2PlayerId: selectedTeam2Player,
      actions: [],
      startedAt: new Date().toISOString()
    })
  }

  const addOvertimeAction = (playerId: string, actionType: 'men' | 'kote' | 'tsuki' | 'do') => {
    if (!overtimeData) return

    const newAction: ScoringAction = {
      id: `overtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: actionType,
      playerId,
      timestamp: new Date().toISOString(),
      confirmed: true
    }

    const updatedData = {
      ...overtimeData,
      actions: [...overtimeData.actions, newAction],
      winnerId: playerId,
      completedAt: new Date().toISOString()
    }

    setOvertimeData(updatedData)
  }

  return (
    <div className="card p-6 border-yellow-200 bg-yellow-50">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
        <h4 className="text-title-medium font-semibold text-gray-900">Overtime Required</h4>
      </div>
      
      <p className="text-body-medium text-gray-600 mb-4">
        The match is tied. Select one representative from each team for overtime. First to score wins the entire match.
      </p>

      {!overtimeData ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-body-small font-medium text-gray-700 mb-2 block">
              {team1.name} Representative:
            </label>
            <select
              value={selectedTeam1Player}
              onChange={(e) => setSelectedTeam1Player(e.target.value)}
              className="input-outlined w-full"
            >
              <option value="">Select player</option>
              {team1.players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.fullName} ({player.kendoRank})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-body-small font-medium text-gray-700 mb-2 block">
              {team2.name} Representative:
            </label>
            <select
              value={selectedTeam2Player}
              onChange={(e) => setSelectedTeam2Player(e.target.value)}
              className="input-outlined w-full"
            >
              <option value="">Select player</option>
              {team2.players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.fullName} ({player.kendoRank})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <button
              onClick={handleStartOvertime}
              disabled={!selectedTeam1Player || !selectedTeam2Player}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                !selectedTeam1Player || !selectedTeam2Player
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
              }`}
            >
              {!selectedTeam1Player || !selectedTeam2Player 
                ? 'Select representatives to start overtime'
                : 'Start Overtime'
              }
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {overtimeData.winnerId ? (
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-title-medium font-semibold text-green-800">
                Overtime Complete!
              </div>
              <div className="text-body-medium text-green-700 mt-2 mb-4">
                {(() => {
                  const winnerPlayer = overtimeData.winnerId === overtimeData.team1PlayerId 
                    ? team1.players.find(p => p.id === overtimeData.team1PlayerId)
                    : team2.players.find(p => p.id === overtimeData.team2PlayerId)
                  const winnerTeam = overtimeData.winnerId === overtimeData.team1PlayerId ? team1 : team2
                  const winningAction = overtimeData.actions.find(a => a.playerId === overtimeData.winnerId)
                  const actionName = winningAction ? 
                    (winningAction.type === 'men' ? 'Men' :
                     winningAction.type === 'kote' ? 'Kote' : 
                     winningAction.type === 'do' ? 'Do' : 
                     winningAction.type === 'tsuki' ? 'Tsuki' : winningAction.type) : 'Point'
                  
                  return (
                    <>
                      <div className="font-medium">{winnerPlayer?.fullName} ({winnerTeam.name})</div>
                      <div className="text-sm">Won with {actionName}</div>
                    </>
                  )
                })()}
              </div>
              <button
                onClick={() => {
                  setOvertimeData(null)
                  // Overtime will automatically restart since needsOvertime should still be true
                }}
                className="btn-outlined text-sm text-red-600 border-red-200 hover:bg-red-50"
              >
                Reset Overtime
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Team 1 Player Overtime Controls */}
              <div className="text-center p-4 border rounded-lg">
                <div className="text-body-medium font-semibold mb-2">
                  {team1.players.find(p => p.id === overtimeData.team1PlayerId)?.fullName}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team1PlayerId, 'men')}
                    className="btn-outlined text-sm"
                  >
                    Men
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team1PlayerId, 'kote')}
                    className="btn-outlined text-sm"
                  >
                    Kote
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team1PlayerId, 'do')}
                    className="btn-outlined text-sm"
                  >
                    Do
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team1PlayerId, 'tsuki')}
                    className="btn-outlined text-sm"
                  >
                    Tsuki
                  </button>
                </div>
              </div>

              {/* Team 2 Player Overtime Controls */}
              <div className="text-center p-4 border rounded-lg">
                <div className="text-body-medium font-semibold mb-2">
                  {team2.players.find(p => p.id === overtimeData.team2PlayerId)?.fullName}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team2PlayerId, 'men')}
                    className="btn-outlined text-sm"
                  >
                    Men
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team2PlayerId, 'kote')}
                    className="btn-outlined text-sm"
                  >
                    Kote
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team2PlayerId, 'do')}
                    className="btn-outlined text-sm"
                  >
                    Do
                  </button>
                  <button
                    onClick={() => addOvertimeAction(overtimeData.team2PlayerId, 'tsuki')}
                    className="btn-outlined text-sm"
                  >
                    Tsuki
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MatchResultModal