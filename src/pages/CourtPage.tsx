import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTournament } from '../contexts/TournamentContext'
import { useAuth } from '../contexts/AuthContext'
import { Match, ScoringAction, PlayerSetResult, User, OvertimeData } from '../types'
import { Monitor, Users, Clock, Trophy, ArrowLeft, Play, Pause, CheckCircle, AlertCircle, Zap, Timer } from 'lucide-react'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { 
  calculateSetWinner, 
  countPointsFromActions, 
  determineMatchWinner, 
  updateMatchScoreAfterSet,
  formatTime,
  shouldEndSet
} from '../utils/kendoMatchLogic'

/**
 * CourtPage component - Individual court management and real-time scoring
 * Allows admins to manage matches and track kendo scoring (men, kote, tsuki, do, hansoku)
 */

const CourtPage: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tournament, teams, users, updateTournament } = useTournament()
  
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [selectedAction, setSelectedAction] = useState<'men' | 'kote' | 'tsuki' | 'do' | 'hansoku' | null>(null)
  const [actionForPlayer, setActionForPlayer] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(180) // 3 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showOvertimeSelection, setShowOvertimeSelection] = useState(false)

  // Find the court and current match
  const court = tournament?.courts.find(c => c.id === courtId)
  const match = court?.currentMatchId ? findMatchById(tournament, court.currentMatchId) : null

  // Timer effect for set countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            // Auto-complete set when time expires
            handleTimeExpiry()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning, timeRemaining])

  useEffect(() => {
    if (match) {
      setCurrentMatch(match)
      // Initialize timer for current set if in progress
      if (match.status === 'in_progress') {
        const currentSetIndex = (match.currentPlayerSet || 1) - 1
        const currentSetData = match.scores.playerSets[currentSetIndex]
        if (currentSetData && !currentSetData.completedAt) {
          setTimeRemaining(currentSetData.timeRemaining || 180)
          setIsTimerRunning(true)
        }
      }
    }
  }, [match])

  // Redirect if not admin
  if (user?.role !== 'admin') {
    navigate('/dashboard')
    return null
  }

  if (!court) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
            Court Not Found
          </h3>
          <p className="text-body-large text-gray-600 mb-6">
            The requested court could not be found.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="btn-filled"
          >
            Return to Admin
          </button>
        </div>
      </div>
    )
  }

  const team1 = currentMatch ? teams.find(t => t.id === currentMatch.team1Id) : null
  const team2 = currentMatch ? teams.find(t => t.id === currentMatch.team2Id) : null
  const currentSet = currentMatch?.currentPlayerSet || 1

  // Get current players for the active set
  const getCurrentPlayers = () => {
    if (!currentMatch || !team1 || !team2) return { team1Player: null, team2Player: null }
    
    const setIndex = currentSet - 1
    const team1Player = team1.players[setIndex] || null
    const team2Player = team2.players[setIndex] || null
    
    return { team1Player, team2Player }
  }

  const { team1Player, team2Player } = getCurrentPlayers()

  // Handle scoring action selection
  const handleScoringActionSelect = (actionType: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku') => {
    setSelectedAction(actionType)
    setActionForPlayer(null)
  }

  // Handle scoring action assignment to player
  const handleScoringAction = (playerId: string, actionType: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku') => {
    if (!currentMatch || !tournament) return

    const action: ScoringAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      playerId,
      timestamp: new Date().toISOString(),
      confirmed: true // Auto-confirm admin actions
    }

    // Add action to current battle or create new battle
    const updatedMatch = { ...currentMatch }
    
    if (!updatedMatch.scores.currentBattle) {
      updatedMatch.scores.currentBattle = {
        setNumber: currentSet,
        team1PlayerId: team1Player?.id || '',
        team2PlayerId: team2Player?.id || '',
        team1Actions: [],
        team2Actions: [],
        startedAt: new Date().toISOString()
      }
    }

    // Add action to appropriate team
    if (team1Player && playerId === team1Player.id) {
      updatedMatch.scores.currentBattle.team1Actions.push(action)
    } else if (team2Player && playerId === team2Player.id) {
      updatedMatch.scores.currentBattle.team2Actions.push(action)
    }

    // Update current set with new points
    const currentSetIndex = currentSet - 1
    const currentSetData = updatedMatch.scores.playerSets[currentSetIndex] || {
      setNumber: currentSet,
      result: 'win' as const,
      actions: [],
      team1Points: 0,
      team2Points: 0,
      timeLimit: 180,
      timeRemaining: timeRemaining,
      startedAt: new Date().toISOString()
    }

    // Update actions and points
    currentSetData.actions = [
      ...(updatedMatch.scores.currentBattle.team1Actions || []),
      ...(updatedMatch.scores.currentBattle.team2Actions || [])
    ]
    
    currentSetData.team1Points = countPointsFromActions(updatedMatch.scores.currentBattle.team1Actions || [])
    currentSetData.team2Points = countPointsFromActions(updatedMatch.scores.currentBattle.team2Actions || [])
    currentSetData.timeRemaining = timeRemaining

    updatedMatch.scores.playerSets[currentSetIndex] = currentSetData

    // Check if set should end due to scoring (first to 2 points)
    if (shouldEndSet(currentSetData.team1Points, currentSetData.team2Points, timeRemaining)) {
      const setResult = calculateSetWinner(currentSetData.team1Points, currentSetData.team2Points, timeRemaining)
      
      if (setResult.winnerId) {
        // Auto-complete set if someone reached 2 points
        const winnerId = setResult.winnerId === 'team1' ? team1?.id : team2?.id
        handleCompleteSet(winnerId, setResult.result as 'win' | 'draw' | 'time_expired')
        return
      }
    }

    // Update tournament
    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updateTournament(updatedTournament)
    setCurrentMatch(updatedMatch)
    
    // Clear selection
    setSelectedAction(null)
    setActionForPlayer(null)
  }

  // Handle overtime player selection
  const handleOvertimePlayerSelection = (team1PlayerId: string, team2PlayerId: string) => {
    if (!currentMatch || !tournament) return

    const updatedMatch = { ...currentMatch }
    updatedMatch.overtime = {
      team1PlayerId,
      team2PlayerId,
      actions: [],
      startedAt: new Date().toISOString()
    }

    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updateTournament(updatedTournament)
    setCurrentMatch(updatedMatch)
    setShowOvertimeSelection(false)
  }

  // Handle overtime scoring (only men, kote, tsuki, do count - no hansoku in overtime)
  const handleOvertimeAction = (playerId: string, actionType: 'men' | 'kote' | 'tsuki' | 'do') => {
    if (!currentMatch || !tournament || !currentMatch.overtime) return

    const action: ScoringAction = {
      id: `overtime_action_${Date.now()}`,
      type: actionType,
      playerId,
      timestamp: new Date().toISOString(),
      confirmed: true
    }

    const updatedMatch = { ...currentMatch }
    updatedMatch.overtime.actions.push(action)
    
    // First scoring action wins in overtime
    const team1Player = teams.find(t => t.id === currentMatch.team1Id)?.players.find(p => p.id === currentMatch.overtime!.team1PlayerId)
    const team2Player = teams.find(t => t.id === currentMatch.team2Id)?.players.find(p => p.id === currentMatch.overtime!.team2PlayerId)
    
    if (playerId === currentMatch.overtime.team1PlayerId) {
      updatedMatch.winnerId = currentMatch.team1Id
    } else if (playerId === currentMatch.overtime.team2PlayerId) {
      updatedMatch.winnerId = currentMatch.team2Id
    }
    
    updatedMatch.overtime.winnerId = updatedMatch.winnerId
    updatedMatch.overtime.completedAt = new Date().toISOString()
    updatedMatch.status = 'completed'
    updatedMatch.completedAt = new Date().toISOString()

    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updateTournament(updatedTournament)
    setCurrentMatch(updatedMatch)
    setSelectedAction(null)
  }

  // Handle time expiry
  const handleTimeExpiry = () => {
    if (!currentMatch) return
    
    const currentSetIndex = currentSet - 1
    const currentSetData = currentMatch.scores.playerSets[currentSetIndex]
    
    if (currentSetData) {
      const setResult = calculateSetWinner(currentSetData.team1Points, currentSetData.team2Points, 0)
      const winnerId = setResult.winnerId === 'team1' ? team1?.id : 
                      setResult.winnerId === 'team2' ? team2?.id : undefined
      
      handleCompleteSet(winnerId, setResult.result as 'win' | 'draw' | 'time_expired')
    }
  }

  // Start set timer
  const startSetTimer = () => {
    setIsTimerRunning(true)
  }

  // Pause set timer
  const pauseSetTimer = () => {
    setIsTimerRunning(false)
  }

  // Handle set completion
  const handleCompleteSet = (winnerId?: string, resultType: 'win' | 'draw' | 'forfeit' | 'time_expired' = 'win') => {
    if (!currentMatch || !tournament) return

    const updatedMatch = { ...currentMatch }
    const currentSetIndex = currentSet - 1
    
    // Get existing set data or create new
    const existingSetData = updatedMatch.scores.playerSets[currentSetIndex]
    const setResult: PlayerSetResult = {
      setNumber: currentSet,
      team1PlayerId: team1Player?.id,
      team2PlayerId: team2Player?.id,
      winnerId,
      result: resultType,
      actions: existingSetData?.actions || [
        ...(updatedMatch.scores.currentBattle?.team1Actions || []),
        ...(updatedMatch.scores.currentBattle?.team2Actions || [])
      ],
      team1Points: existingSetData?.team1Points || countPointsFromActions(updatedMatch.scores.currentBattle?.team1Actions || []),
      team2Points: existingSetData?.team2Points || countPointsFromActions(updatedMatch.scores.currentBattle?.team2Actions || []),
      timeLimit: 180,
      timeRemaining: timeRemaining,
      startedAt: existingSetData?.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString()
    }

    // Update match scores using the new logic
    updatedMatch.scores = updateMatchScoreAfterSet(updatedMatch.scores, setResult)

    // Stop timer
    setIsTimerRunning(false)
    
    // Clear current battle
    updatedMatch.scores.currentBattle = undefined

    // Continue to next set or complete match after all 7 sets
    if (currentSet < 7) {
      updatedMatch.currentPlayerSet = currentSet + 1
      // Reset timer for next set
      setTimeRemaining(180)
    } else {
      // All 7 sets completed, use proper kendo win determination
      const matchResult = determineMatchWinner(updatedMatch.scores)
      
      if (matchResult.needsOvertime) {
        // Match is tied - go to overtime (encho-sen)
        updatedMatch.status = 'overtime'
        setShowOvertimeSelection(true)
      } else {
        // Match has a winner
        updatedMatch.winnerId = matchResult.winnerId === 'team1' ? team1?.id : team2?.id
        updatedMatch.status = 'completed'
        updatedMatch.completedAt = new Date().toISOString()
      }
    }

    // Update tournament
    const updatedTournament = updateMatchInTournament(tournament, updatedMatch)
    updateTournament(updatedTournament)
    setCurrentMatch(updatedMatch)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="btn-outlined mr-4 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </button>
            <div className="flex items-center">
              <Monitor className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h1 className="text-headline-large font-bold text-gray-900">
                  {court.name}
                </h1>
                <p className="text-body-medium text-gray-600">
                  Court Management & Scoring
                </p>
              </div>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-label-large font-medium ${
            currentMatch?.status === 'in_progress' ? 'bg-green-100 text-green-800' :
            currentMatch?.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
            currentMatch?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {currentMatch?.status === 'in_progress' ? 'Live' :
             currentMatch?.status === 'scheduled' ? 'Scheduled' :
             currentMatch?.status === 'completed' ? 'Completed' :
             'No Match'}
          </div>
        </div>

        {currentMatch && team1 && team2 ? (
          <div className="space-y-8">
            {/* Match Overview */}
            <div className="card p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <h3 className="text-title-large font-semibold text-gray-900">
                    {team1.name}
                  </h3>
                  <div className="text-display-small font-bold text-primary-600">
                    {currentMatch.scores.team1Wins}
                  </div>
                  <div className="text-body-small text-gray-600">Sets Won</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-title-medium text-gray-600">vs</div>
                  <div className="text-title-large font-semibold text-gray-900">
                    Set {currentSet}/7
                  </div>
                  <div className="text-body-small text-gray-600">
                    {currentMatch.stage === 'seed' ? 'Seed Stage' : 'Main Bracket'}
                  </div>
                  {/* Timer Display */}
                  {currentMatch.status === 'in_progress' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Timer className="w-5 h-5 text-blue-600" />
                        <span className="text-title-large font-mono font-bold text-blue-800">
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                      <div className="flex justify-center gap-2">
                        {isTimerRunning ? (
                          <button
                            onClick={pauseSetTimer}
                            className="btn-outlined text-sm py-1 px-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={startSetTimer}
                            className="btn-filled text-sm py-1 px-3 bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-title-large font-semibold text-gray-900">
                    {team2.name}
                  </h3>
                  <div className="text-display-small font-bold text-primary-600">
                    {currentMatch.scores.team2Wins}
                  </div>
                  <div className="text-body-small text-gray-600">Sets Won</div>
                </div>
              </div>
            </div>

            {/* Current Set Players */}
            {currentMatch.status === 'in_progress' && team1Player && team2Player && (
              <div className="card p-6">
                <div className="text-center mb-6">
                  <h3 className="text-title-large font-semibold text-gray-900 mb-2">
                    Current Battle - Set {currentSet}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Timer className="w-5 h-5 text-blue-600" />
                    <span className="text-title-medium font-mono font-bold text-blue-800">
                      {formatTime(timeRemaining)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isTimerRunning ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isTimerRunning ? 'Running' : 'Paused'}
                    </span>
                  </div>
                  
                  {/* Current Set Points */}
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-4">
                    <div className="text-center">
                      <div className="text-display-small font-bold text-primary-600">
                        {currentMatch.scores.playerSets[currentSet - 1]?.team1Points || 0}
                      </div>
                      <div className="text-body-small text-gray-600">Points</div>
                    </div>
                    <div className="text-center text-title-medium text-gray-400">
                      vs
                    </div>
                    <div className="text-center">
                      <div className="text-display-small font-bold text-primary-600">
                        {currentMatch.scores.playerSets[currentSet - 1]?.team2Points || 0}
                      </div>
                      <div className="text-body-small text-gray-600">Points</div>
                    </div>
                  </div>
                </div>

                {/* Action Selection Step */}
                {!selectedAction && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-title-medium font-semibold text-gray-900 mb-4">
                        Select Scoring Action
                      </h4>
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        <button
                          onClick={() => handleScoringActionSelect('men')}
                          className="btn-filled text-sm py-3 bg-blue-600 hover:bg-blue-700"
                        >
                          Men
                        </button>
                        <button
                          onClick={() => handleScoringActionSelect('kote')}
                          className="btn-filled text-sm py-3 bg-green-600 hover:bg-green-700"
                        >
                          Kote
                        </button>
                        <button
                          onClick={() => handleScoringActionSelect('tsuki')}
                          className="btn-filled text-sm py-3 bg-purple-600 hover:bg-purple-700"
                        >
                          Tsuki
                        </button>
                        <button
                          onClick={() => handleScoringActionSelect('do')}
                          className="btn-filled text-sm py-3 bg-orange-600 hover:bg-orange-700"
                        >
                          Do
                        </button>
                      </div>
                      <button
                        onClick={() => handleScoringActionSelect('hansoku')}
                        className="btn-filled text-sm py-3 bg-red-600 hover:bg-red-700 mt-4"
                      >
                        Hansoku (Penalty)
                      </button>
                    </div>
                  </div>
                )}

                {/* Player Selection Step */}
                {selectedAction && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-title-medium font-semibold text-gray-900 mb-2">
                        Who performed the <span className="capitalize font-bold text-primary-600">{selectedAction}</span>?
                      </h4>
                      <button
                        onClick={() => setSelectedAction(null)}
                        className="btn-text text-sm text-gray-600"
                      >
                        ← Change Action
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Team 1 Player Option */}
                      <button
                        onClick={() => handleScoringAction(team1Player.id, selectedAction)}
                        className="bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-400 rounded-xl p-6 transition-all"
                      >
                        <h4 className="text-title-medium font-semibold text-gray-900 mb-2">
                          {team1Player.fullName}
                        </h4>
                        <div className={`inline-block ${getRankBadgeClass(team1Player.kendoRank)} mb-2`}>
                          {team1Player.kendoRank}
                        </div>
                        <div className="text-body-small text-gray-600">
                          {team1.name}
                        </div>
                      </button>

                      {/* Team 2 Player Option */}
                      <button
                        onClick={() => handleScoringAction(team2Player.id, selectedAction)}
                        className="bg-accent-50 hover:bg-accent-100 border-2 border-accent-200 hover:border-accent-400 rounded-xl p-6 transition-all"
                      >
                        <h4 className="text-title-medium font-semibold text-gray-900 mb-2">
                          {team2Player.fullName}
                        </h4>
                        <div className={`inline-block ${getRankBadgeClass(team2Player.kendoRank)} mb-2`}>
                          {team2Player.kendoRank}
                        </div>
                        <div className="text-body-small text-gray-600">
                          {team2.name}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Actions Display */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-title-small font-semibold text-gray-900 mb-4 text-center">
                    Recent Actions
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-body-medium font-medium text-gray-700 mb-2">
                        {team1Player.fullName}
                      </div>
                      <div className="space-y-1">
                        {currentMatch.scores.currentBattle?.team1Actions.slice(-3).map((action) => (
                          <div key={action.id} className="bg-primary-50 rounded-lg py-2 px-3 text-body-small">
                            <span className="font-semibold capitalize text-primary-700">{action.type}</span>
                            <span className="text-gray-600 ml-2">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )) || (
                          <div className="text-gray-500 text-body-small italic">No actions yet</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-body-medium font-medium text-gray-700 mb-2">
                        {team2Player.fullName}
                      </div>
                      <div className="space-y-1">
                        {currentMatch.scores.currentBattle?.team2Actions.slice(-3).map((action) => (
                          <div key={action.id} className="bg-accent-50 rounded-lg py-2 px-3 text-body-small">
                            <span className="font-semibold capitalize text-accent-700">{action.type}</span>
                            <span className="text-gray-600 ml-2">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )) || (
                          <div className="text-gray-500 text-body-small italic">No actions yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Set Control */}
                <div className="space-y-4 mt-8">
                  <div className="text-center mb-4">
                    <div className="text-body-medium text-gray-600 mb-2">
                      Set ends when: First to 2 points OR time expires (winner = more points)
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleCompleteSet(team1.id, 'win')}
                      className="btn-filled flex items-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {team1.name} Wins
                    </button>
                    <button
                      onClick={() => handleCompleteSet(undefined, 'draw')}
                      className="btn-outlined flex items-center"
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => handleCompleteSet(team2.id, 'win')}
                      className="btn-filled flex items-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {team2.name} Wins
                    </button>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleCompleteSet(team2.id, 'forfeit')}
                      className="btn-text text-red-600 text-sm"
                    >
                      {team1.name} Forfeits
                    </button>
                    <button
                      onClick={() => handleCompleteSet(team1.id, 'forfeit')}
                      className="btn-text text-red-600 text-sm"
                    >
                      {team2.name} Forfeits
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Overtime Player Selection */}
            {showOvertimeSelection && currentMatch && team1 && team2 && (
              <div className="card p-6 border-2 border-yellow-400 bg-yellow-50">
                <div className="text-center mb-6">
                  <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-headline-small font-bold text-gray-900 mb-2">
                    OVERTIME (Encho-sen)
                  </h3>
                  <p className="text-body-large text-gray-700 mb-4">
                    Match is tied {currentMatch.scores.team1Wins}-{currentMatch.scores.team2Wins}. 
                    Select one player from each team for sudden-death overtime.
                  </p>
                  <p className="text-body-medium text-yellow-800 bg-yellow-100 rounded-lg p-3">
                    First valid point (Men, Kote, Tsuki, Do) wins the match!
                  </p>
                </div>

                <OvertimePlayerSelection
                  team1={team1}
                  team2={team2}
                  onPlayerSelection={handleOvertimePlayerSelection}
                />
              </div>
            )}

            {/* Active Overtime */}
            {currentMatch?.status === 'overtime' && currentMatch.overtime && !showOvertimeSelection && (
              <div className="card p-6 border-2 border-yellow-400 bg-yellow-50">
                <div className="text-center mb-6">
                  <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-title-large font-bold text-gray-900 mb-2">
                    OVERTIME IN PROGRESS
                  </h3>
                  <p className="text-body-medium text-yellow-800">
                    First valid point wins the match
                  </p>
                </div>

                <OvertimeInterface
                  match={currentMatch}
                  team1={team1}
                  team2={team2}
                  selectedAction={selectedAction}
                  onActionSelect={handleScoringActionSelect}
                  onActionComplete={handleOvertimeAction}
                  onCancelAction={() => setSelectedAction(null)}
                />
              </div>
            )}

            {/* Match Status Summary */}
            {currentMatch.status === 'completed' && (
              <div className="card p-6 bg-green-50 border-green-200">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-headline-small font-bold text-gray-900 mb-2">
                    Match Complete
                  </h3>
                  <div className="text-title-large font-semibold text-green-800 mb-4">
                    {currentMatch.winnerId === team1?.id ? team1.name : team2.name} Wins!
                  </div>
                  
                  {/* Match result explanation */}
                  <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
                    <div className="text-body-medium text-gray-700">
                      Final Score: {currentMatch.scores.team1Wins}-{currentMatch.scores.team2Wins} sets
                    </div>
                    <div className="text-body-small text-gray-600 mt-1">
                      Total Points: {currentMatch.scores.team1TotalPoints}-{currentMatch.scores.team2TotalPoints}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Match History */}
            <div className="card p-6">
              <h3 className="text-title-large font-semibold text-gray-900 mb-6">
                Set History
              </h3>
              <div className="space-y-4">
                {Array.from({ length: 7 }, (_, i) => {
                  const setNumber = i + 1
                  const setResult = currentMatch.scores.playerSets[i]
                  const isCompleted = setResult?.completedAt
                  const isCurrent = setNumber === currentSet && currentMatch.status === 'in_progress'

                  return (
                    <div
                      key={setNumber}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isCompleted ? 'bg-green-50 border border-green-200' :
                        isCurrent ? 'bg-blue-50 border border-blue-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-4 ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {setNumber}
                        </div>
                        <div className="flex-1">
                          <div className="text-body-medium font-medium text-gray-900 mb-1">
                            Set {setNumber}
                          </div>
                          {setResult && (
                            <div className="space-y-1">
                              <div className="text-body-small text-gray-600">
                                {setResult.result === 'draw' ? 'Draw' :
                                 setResult.result === 'forfeit' ? 
                                   `${setResult.winnerId === team1?.id ? team1.name : team2.name} wins (forfeit)` :
                                 setResult.result === 'time_expired' ? 
                                   `${setResult.winnerId === team1?.id ? team1.name : setResult.winnerId === team2?.id ? team2.name : 'Draw'} (time expired)` :
                                 setResult.winnerId === team1?.id ? `${team1.name} wins` :
                                 setResult.winnerId === team2?.id ? `${team2.name} wins` :
                                 'In progress'}
                              </div>
                              {setResult.completedAt && (
                                <div className="text-body-small text-gray-500">
                                  Points: {setResult.team1Points}-{setResult.team2Points} • 
                                  Time: {formatTime(setResult.timeRemaining)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isCurrent && isTimerRunning && (
                          <div className="text-body-small text-blue-600 font-mono">
                            {formatTime(timeRemaining)}
                          </div>
                        )}
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {isCurrent && <Play className="w-5 h-5 text-blue-500" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Overtime Result */}
              {currentMatch.overtime && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="text-title-medium font-semibold text-gray-900 mb-4">
                      Overtime (Encho-sen)
                    </h4>
                    
                    {currentMatch.overtime.completedAt ? (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="text-title-small font-semibold text-gray-900">
                          {currentMatch.winnerId === team1?.id ? team1.name : team2.name} wins in overtime!
                        </div>
                        <div className="text-body-small text-gray-600 mt-1">
                          Winner: {currentMatch.overtime.winnerId === currentMatch.team1Id 
                            ? team1?.players.find(p => p.id === currentMatch.overtime?.team1PlayerId)?.fullName
                            : team2?.players.find(p => p.id === currentMatch.overtime?.team2PlayerId)?.fullName}
                        </div>
                        {currentMatch.overtime.actions.length > 0 && (
                          <div className="text-body-small text-gray-600 mt-1">
                            Winning action: {currentMatch.overtime.actions[currentMatch.overtime.actions.length - 1].type}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="text-body-medium text-gray-700">
                          Overtime players selected - match in progress
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
              No Active Match
            </h3>
            <p className="text-body-large text-gray-600 mb-6">
              This court currently has no assigned match.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="btn-filled"
            >
              Assign Match
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to find match by ID
const findMatchById = (tournament: any, matchId: string): Match | undefined => {
  if (!tournament) return undefined
  
  // Search in seed groups
  for (const group of tournament.seedGroups) {
    const match = group.matches.find((m: Match) => m.id === matchId)
    if (match) return match
  }
  
  return undefined
}

// Helper function to update match in tournament
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

// Overtime Player Selection Component
const OvertimePlayerSelection: React.FC<{
  team1: any
  team2: any
  onPlayerSelection: (team1PlayerId: string, team2PlayerId: string) => void
}> = ({ team1, team2, onPlayerSelection }) => {
  const [selectedTeam1Player, setSelectedTeam1Player] = useState<string | null>(null)
  const [selectedTeam2Player, setSelectedTeam2Player] = useState<string | null>(null)

  const handleConfirmSelection = () => {
    if (selectedTeam1Player && selectedTeam2Player) {
      onPlayerSelection(selectedTeam1Player, selectedTeam2Player)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Team 1 Player Selection */}
        <div>
          <h4 className="text-title-medium font-semibold text-gray-900 mb-4 text-center">
            {team1.name} - Select Player
          </h4>
          <div className="space-y-2">
            {team1.players.map((player: any) => (
              <button
                key={player.id}
                onClick={() => setSelectedTeam1Player(player.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedTeam1Player === player.id
                    ? 'border-primary-400 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-body-medium font-medium">{player.fullName}</div>
                <div className={`text-body-small ${getRankBadgeClass(player.kendoRank)} inline-block mt-1`}>
                  {player.kendoRank}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team 2 Player Selection */}
        <div>
          <h4 className="text-title-medium font-semibold text-gray-900 mb-4 text-center">
            {team2.name} - Select Player
          </h4>
          <div className="space-y-2">
            {team2.players.map((player: any) => (
              <button
                key={player.id}
                onClick={() => setSelectedTeam2Player(player.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedTeam2Player === player.id
                    ? 'border-accent-400 bg-accent-50 text-accent-900'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-body-medium font-medium">{player.fullName}</div>
                <div className={`text-body-small ${getRankBadgeClass(player.kendoRank)} inline-block mt-1`}>
                  {player.kendoRank}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirmSelection}
          disabled={!selectedTeam1Player || !selectedTeam2Player}
          className="btn-filled text-lg py-3 px-8 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5 mr-2 inline" />
          Start Overtime
        </button>
      </div>
    </div>
  )
}

// Overtime Interface Component
const OvertimeInterface: React.FC<{
  match: Match
  team1: any
  team2: any
  selectedAction: string | null
  onActionSelect: (action: 'men' | 'kote' | 'tsuki' | 'do') => void
  onActionComplete: (playerId: string, action: 'men' | 'kote' | 'tsuki' | 'do') => void
  onCancelAction: () => void
}> = ({ match, team1, team2, selectedAction, onActionSelect, onActionComplete, onCancelAction }) => {
  const team1Player = team1.players.find((p: any) => p.id === match.overtime?.team1PlayerId)
  const team2Player = team2.players.find((p: any) => p.id === match.overtime?.team2PlayerId)

  if (!team1Player || !team2Player || !match.overtime) return null

  return (
    <div className="space-y-6">
      {/* Current Overtime Players */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="bg-primary-100 rounded-xl p-6 border-2 border-primary-200">
            <h4 className="text-title-medium font-semibold text-gray-900 mb-2">
              {team1Player.fullName}
            </h4>
            <div className={`inline-block ${getRankBadgeClass(team1Player.kendoRank)} mb-2`}>
              {team1Player.kendoRank}
            </div>
            <div className="text-body-small text-gray-600">{team1.name}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-accent-100 rounded-xl p-6 border-2 border-accent-200">
            <h4 className="text-title-medium font-semibold text-gray-900 mb-2">
              {team2Player.fullName}
            </h4>
            <div className={`inline-block ${getRankBadgeClass(team2Player.kendoRank)} mb-2`}>
              {team2Player.kendoRank}
            </div>
            <div className="text-body-small text-gray-600">{team2.name}</div>
          </div>
        </div>
      </div>

      {/* Action Selection or Player Selection */}
      {!selectedAction ? (
        <div className="text-center">
          <h4 className="text-title-medium font-semibold text-gray-900 mb-4">
            Select Scoring Action (No Hansoku in Overtime)
          </h4>
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            <button
              onClick={() => onActionSelect('men')}
              className="btn-filled text-sm py-3 bg-blue-600 hover:bg-blue-700"
            >
              Men
            </button>
            <button
              onClick={() => onActionSelect('kote')}
              className="btn-filled text-sm py-3 bg-green-600 hover:bg-green-700"
            >
              Kote
            </button>
            <button
              onClick={() => onActionSelect('tsuki')}
              className="btn-filled text-sm py-3 bg-purple-600 hover:bg-purple-700"
            >
              Tsuki
            </button>
            <button
              onClick={() => onActionSelect('do')}
              className="btn-filled text-sm py-3 bg-orange-600 hover:bg-orange-700"
            >
              Do
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h4 className="text-title-medium font-semibold text-gray-900">
            Who scored the <span className="capitalize font-bold text-yellow-600">{selectedAction}</span>?
          </h4>
          <button
            onClick={onCancelAction}
            className="btn-text text-sm text-gray-600"
          >
            ← Change Action
          </button>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => onActionComplete(team1Player.id, selectedAction as 'men' | 'kote' | 'tsuki' | 'do')}
              className="bg-primary-100 hover:bg-primary-200 border-2 border-primary-300 hover:border-primary-500 rounded-xl p-6 transition-all"
            >
              <div className="text-title-medium font-semibold">{team1Player.fullName}</div>
              <div className="text-body-small text-gray-600">Wins Match for {team1.name}</div>
            </button>
            
            <button
              onClick={() => onActionComplete(team2Player.id, selectedAction as 'men' | 'kote' | 'tsuki' | 'do')}
              className="bg-accent-100 hover:bg-accent-200 border-2 border-accent-300 hover:border-accent-500 rounded-xl p-6 transition-all"
            >
              <div className="text-title-medium font-semibold">{team2Player.fullName}</div>
              <div className="text-body-small text-gray-600">Wins Match for {team2.name}</div>
            </button>
          </div>
        </div>
      )}

      {/* Overtime Actions History */}
      {match.overtime.actions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-yellow-300">
          <h4 className="text-title-small font-semibold text-gray-900 mb-3 text-center">
            Overtime Actions
          </h4>
          <div className="space-y-2">
            {match.overtime.actions.map((action) => {
              const actionPlayer = action.playerId === team1Player.id ? team1Player : team2Player
              const isTeam1 = action.playerId === team1Player.id
              return (
                <div
                  key={action.id}
                  className={`rounded-lg py-2 px-4 text-body-small ${
                    isTeam1 ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold capitalize">{action.type} by {actionPlayer.fullName}</span>
                    <span className="text-gray-600">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourtPage