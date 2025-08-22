import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTournament } from '../contexts/TournamentContext'
import { Match, ScoringAction } from '../types'
import { Monitor, Users, Clock, Trophy, Crown, AlertTriangle, Zap, Timer } from 'lucide-react'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { formatTime } from '../utils/kendoMatchLogic'

/**
 * PublicCourtPage component - Public display for spectators
 * Shows real-time match information and scoring without admin controls
 */

const PublicCourtPage: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>()
  const { tournament, teams } = useTournament()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second for live display
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Find the court and current match
  const court = tournament?.courts.find(c => c.id === courtId)
  const currentMatch = court?.currentMatchId ? findMatchById(tournament, court.currentMatchId) : null

  if (!court) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center text-white">
        <div className="text-center">
          <AlertTriangle className="w-24 h-24 text-white/60 mx-auto mb-6" />
          <h1 className="text-display-medium font-bold mb-4">
            Court Not Found
          </h1>
          <p className="text-title-large text-white/80">
            The requested court display is not available.
          </p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 text-white">
      {/* Header Bar */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="w-6 h-6 mr-3" />
            <div>
              <h1 className="text-title-large font-bold">
                {court.name}
              </h1>
              <p className="text-body-small text-white/80">
                Live Tournament Display
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-title-medium font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-body-small text-white/80">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentMatch && team1 && team2 ? (
          <div className="space-y-8">
            {/* Match Status */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-title-medium font-bold mb-4 ${
                currentMatch.status === 'in_progress' ? 'bg-green-500' :
                currentMatch.status === 'overtime' ? 'bg-yellow-500 animate-pulse' :
                currentMatch.status === 'scheduled' ? 'bg-blue-500' :
                currentMatch.status === 'completed' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}>
                {currentMatch.status === 'in_progress' && <><Clock className="w-5 h-5 mr-2" /> LIVE</>}
                {currentMatch.status === 'overtime' && <><Zap className="w-5 h-5 mr-2" /> OVERTIME</>}
                {currentMatch.status === 'scheduled' && 'SCHEDULED'}
                {currentMatch.status === 'completed' && <><Trophy className="w-5 h-5 mr-2" /> COMPLETE</>}
              </div>
              <div className="text-title-large text-white/80">
                {currentMatch.stage === 'seed' ? 'Seed Stage' : 'Main Tournament'}
              </div>
            </div>

            {/* Main Scoreboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Team 1 */}
                <div className="text-center">
                  <h2 className="text-display-small font-bold mb-4 truncate">
                    {team1.name}
                  </h2>
                  <div className="text-display-large font-bold mb-2 text-accent-400">
                    {currentMatch.scores.team1Wins}
                  </div>
                  <div className="text-title-medium text-white/80">
                    Sets Won
                  </div>
                  <div className="text-body-small text-white/60 mt-1">
                    Total Points: {currentMatch.scores.team1TotalPoints}
                  </div>
                  {currentMatch.winnerId === team1.id && (
                    <div className="mt-4">
                      <Crown className="w-8 h-8 text-accent-400 mx-auto" />
                      <div className="text-title-small font-bold text-accent-400 mt-1">
                        WINNER
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Info */}
                <div className="text-center">
                  <div className="text-display-medium font-bold text-white/60 mb-2">
                    VS
                  </div>
                  <div className="bg-white/20 rounded-lg py-4 px-6">
                    <div className="text-display-small font-bold">
                      Set {currentSet}
                    </div>
                    <div className="text-title-medium text-white/80 mb-2">
                      of 7
                    </div>
                    
                    {/* Current Set Timer and Points */}
                    {currentMatch.status === 'in_progress' && (
                      <div className="mt-3 pt-3 border-t border-white/30">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-white/80" />
                          <span className="text-title-medium font-mono font-bold text-white">
                            {formatTime(currentMatch.scores.playerSets[currentSet - 1]?.timeRemaining || 180)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-title-small font-bold text-accent-400">
                              {currentMatch.scores.playerSets[currentSet - 1]?.team1Points || 0}
                            </div>
                            <div className="text-body-small text-white/70">Points</div>
                          </div>
                          <div className="text-white/60 text-body-small">vs</div>
                          <div>
                            <div className="text-title-small font-bold text-accent-400">
                              {currentMatch.scores.playerSets[currentSet - 1]?.team2Points || 0}
                            </div>
                            <div className="text-body-small text-white/70">Points</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team 2 */}
                <div className="text-center">
                  <h2 className="text-display-small font-bold mb-4 truncate">
                    {team2.name}
                  </h2>
                  <div className="text-display-large font-bold mb-2 text-accent-400">
                    {currentMatch.scores.team2Wins}
                  </div>
                  <div className="text-title-medium text-white/80">
                    Sets Won
                  </div>
                  <div className="text-body-small text-white/60 mt-1">
                    Total Points: {currentMatch.scores.team2TotalPoints}
                  </div>
                  {currentMatch.winnerId === team2.id && (
                    <div className="mt-4">
                      <Crown className="w-8 h-8 text-accent-400 mx-auto" />
                      <div className="text-title-small font-bold text-accent-400 mt-1">
                        WINNER
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Players */}
            {currentMatch.status === 'in_progress' && team1Player && team2Player && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-display-small font-bold mb-2">
                    Current Battle
                  </h3>
                  <div className="text-title-large text-white/80">
                    Set {currentSet} • In Progress
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Team 1 Player */}
                  <div className="text-center">
                    <div className="bg-primary-500/30 backdrop-blur-sm rounded-xl p-8 mb-6">
                      <h4 className="text-headline-small font-bold mb-4">
                        {team1Player.fullName}
                      </h4>
                      <div className={`inline-block ${getRankBadgeClass(team1Player.kendoRank)} text-title-medium mb-4`}>
                        {team1Player.kendoRank}
                      </div>
                      <div className="text-title-medium text-white/80">
                        {team1.name}
                      </div>
                    </div>
                    
                    {/* Recent Actions */}
                    <div className="space-y-2">
                      <div className="text-title-small font-semibold text-white/80 mb-3">
                        Recent Actions
                      </div>
                      {currentMatch.scores.currentBattle?.team1Actions.slice(-3).map((action, index) => {
                        const actionPlayer = team1.players.find(p => p.id === action.playerId)
                        return (
                          <div key={action.id} className="bg-white/10 rounded-lg py-2 px-4 text-body-medium">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold capitalize">{action.type}</span>
                              <span className="text-white/60 text-body-small">
                                {new Date(action.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {actionPlayer && (
                              <div className="text-white/70 text-body-small mt-1">
                                by {actionPlayer.fullName}
                              </div>
                            )}
                          </div>
                        )
                      }) || (
                        <div className="text-white/60 text-body-medium">
                          No actions yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team 2 Player */}
                  <div className="text-center">
                    <div className="bg-accent-600/30 backdrop-blur-sm rounded-xl p-8 mb-6">
                      <h4 className="text-headline-small font-bold mb-4">
                        {team2Player.fullName}
                      </h4>
                      <div className={`inline-block ${getRankBadgeClass(team2Player.kendoRank)} text-title-medium mb-4`}>
                        {team2Player.kendoRank}
                      </div>
                      <div className="text-title-medium text-white/80">
                        {team2.name}
                      </div>
                    </div>
                    
                    {/* Recent Actions */}
                    <div className="space-y-2">
                      <div className="text-title-small font-semibold text-white/80 mb-3">
                        Recent Actions
                      </div>
                      {currentMatch.scores.currentBattle?.team2Actions.slice(-3).map((action, index) => {
                        const actionPlayer = team2.players.find(p => p.id === action.playerId)
                        return (
                          <div key={action.id} className="bg-white/10 rounded-lg py-2 px-4 text-body-medium">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold capitalize">{action.type}</span>
                              <span className="text-white/60 text-body-small">
                                {new Date(action.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {actionPlayer && (
                              <div className="text-white/70 text-body-small mt-1">
                                by {actionPlayer.fullName}
                              </div>
                            )}
                          </div>
                        )
                      }) || (
                        <div className="text-white/60 text-body-medium">
                          No actions yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overtime Display */}
            {currentMatch.status === 'overtime' && currentMatch.overtime && (
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-400">
                <div className="text-center mb-8">
                  <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-display-small font-bold mb-2">
                    OVERTIME (Encho-sen)
                  </h3>
                  <div className="text-title-large text-white/90 mb-4">
                    Match was tied {currentMatch.scores.team1Wins}-{currentMatch.scores.team2Wins}
                  </div>
                  <div className="text-title-medium text-yellow-200 bg-yellow-900/30 rounded-lg p-3">
                    First valid point wins the match!
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Overtime Team 1 Player */}
                  <div className="text-center">
                    <div className="bg-primary-500/30 backdrop-blur-sm rounded-xl p-8 mb-6">
                      <div className="text-headline-small font-bold mb-4">
                        {teams.find(t => t.id === currentMatch.team1Id)?.players.find(p => p.id === currentMatch.overtime?.team1PlayerId)?.fullName || 'Player 1'}
                      </div>
                      <div className="text-title-medium text-white/80">
                        {team1.name}
                      </div>
                    </div>
                  </div>

                  {/* Overtime Team 2 Player */}
                  <div className="text-center">
                    <div className="bg-accent-600/30 backdrop-blur-sm rounded-xl p-8 mb-6">
                      <div className="text-headline-small font-bold mb-4">
                        {teams.find(t => t.id === currentMatch.team2Id)?.players.find(p => p.id === currentMatch.overtime?.team2PlayerId)?.fullName || 'Player 2'}
                      </div>
                      <div className="text-title-medium text-white/80">
                        {team2.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overtime Actions */}
                {currentMatch.overtime.actions.length > 0 && (
                  <div className="mt-8 text-center">
                    <h4 className="text-title-large font-semibold text-white mb-4">
                      Overtime Actions
                    </h4>
                    <div className="space-y-2">
                      {currentMatch.overtime.actions.map((action) => {
                        const actionPlayer = teams.find(t => t.id === currentMatch.team1Id)?.players.find(p => p.id === action.playerId) ||
                                           teams.find(t => t.id === currentMatch.team2Id)?.players.find(p => p.id === action.playerId)
                        return (
                          <div key={action.id} className="bg-white/10 rounded-lg py-3 px-6 text-title-medium">
                            <div className="font-bold capitalize text-yellow-200">
                              {action.type} by {actionPlayer?.fullName}
                            </div>
                            <div className="text-white/70 text-body-medium">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Set Progress */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-headline-small font-bold text-center mb-8">
                Match Progress
              </h3>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }, (_, i) => {
                  const setNumber = i + 1
                  const setResult = currentMatch.scores.playerSets[i]
                  const isCompleted = setResult?.completedAt
                  const isCurrent = setNumber === currentSet && currentMatch.status === 'in_progress'

                  return (
                    <div key={setNumber} className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-title-medium font-bold mb-2 mx-auto ${
                        isCompleted ? 'bg-green-500' :
                        isCurrent ? 'bg-blue-500 animate-pulse' :
                        'bg-white/20'
                      }`}>
                        {setNumber}
                      </div>
                      <div className="text-body-small">
                        Set {setNumber}
                      </div>
                      {setResult && (
                        <div className="text-body-small text-white/70 mt-1 space-y-1">
                          <div>
                            {setResult.result === 'draw' ? 'Draw' :
                             setResult.result === 'forfeit' ? 
                               `${setResult.winnerId === team1?.id ? team1.name : team2.name} (forfeit)` :
                             setResult.result === 'time_expired' ? 
                               `${setResult.winnerId === team1?.id ? team1.name : setResult.winnerId === team2?.id ? team2.name : 'Draw'} (time)` :
                             setResult.winnerId === team1?.id ? team1.name :
                             setResult.winnerId === team2?.id ? team2.name :
                             'In Progress'}
                          </div>
                          {setResult.completedAt && (
                            <div className="text-body-small text-white/60">
                              {setResult.team1Points}-{setResult.team2Points} pts
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Monitor className="w-24 h-24 text-white/40 mx-auto mb-8" />
            <h2 className="text-display-medium font-bold mb-4">
              No Active Match
            </h2>
            <p className="text-title-large text-white/80 mb-8">
              {court.name} is currently not hosting a match.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-title-large font-semibold mb-4">
                Court Information
              </h3>
              <div className="space-y-2 text-body-large">
                <div>Court: {court.name}</div>
                <div>Status: Available</div>
                <div>Next match will appear here automatically</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black/20 backdrop-blur-sm p-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-body-small text-white/60">
            Live tournament display • Updates automatically
          </div>
        </div>
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

export default PublicCourtPage