import React from 'react'
import { Group, TeamStanding, Team, Match, Dojo } from '../types'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Trophy, Users, Clock, CheckCircle, Star, Award, Edit3 } from 'lucide-react'

/**
 * BracketVisualization component for displaying tournament progress
 * Shows seed groups with round-robin results and standings
 */

interface BracketVisualizationProps {
  groups: Group[]
  teams: Team[]
  dojos: Dojo[]
  onMatchClick?: (match: Match) => void
}

const BracketVisualization: React.FC<BracketVisualizationProps> = ({
  groups,
  teams,
  dojos,
  onMatchClick
}) => {
  // Get team by ID helper
  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(team => team.id === teamId)
  }

  // Get dojo by ID helper
  const getDojoById = (dojoId: string): Dojo | undefined => {
    return dojos.find(dojo => dojo.id === dojoId)
  }

  // Get match status icon with animations
  const getMatchStatusIcon = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  // Get match status color with animated effects
  const getMatchStatusColor = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'in_progress':
        return 'border-yellow-300 bg-yellow-50 ring-2 ring-yellow-200 live-match-glow live-match-shimmer'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  // Get additional animated styling for ongoing matches
  const getAnimatedBorder = (match: Match) => {
    if (match.status === 'in_progress') {
      return 'relative overflow-hidden before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-yellow-400 before:animate-ping before:opacity-30'
    }
    return ''
  }

  return (
    <div className="space-y-8">
      {/* Seed Groups Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="card p-6">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <Trophy className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-title-large font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    {/* Group Status Badge */}
                    {(() => {
                      const completedMatches = group.matches.filter(m => m.status === 'completed').length
                      const totalMatches = group.matches.length
                      const hasOngoingMatches = group.matches.some(m => m.status === 'in_progress')
                      
                      if (completedMatches === totalMatches && totalMatches > 0) {
                        return (
                          <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">Complete</span>
                          </div>
                        )
                      } else if (hasOngoingMatches) {
                        return (
                          <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" />
                            <span className="text-xs font-medium">Ongoing</span>
                          </div>
                        )
                      } else if (completedMatches > 0) {
                        return (
                          <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">In Progress</span>
                          </div>
                        )
                      } else {
                        return (
                          <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-xs font-medium">Pending</span>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {group.matches.some(m => m.status === 'in_progress') && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                      <span className="text-xs font-bold text-red-600 animate-pulse">LIVE</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Standings */}
            <div className="mb-6">
              <h4 className="text-title-medium font-medium text-gray-900 mb-3">
                Current Standings
              </h4>
              <div className="space-y-2">
                {group.standings
                  .sort((a, b) => {
                    if (a.points !== b.points) return b.points - a.points
                    if (a.wins !== b.wins) return b.wins - a.wins
                    return a.losses - b.losses
                  })
                  .map((standing, index) => {
                    const team = getTeamById(standing.teamId)
                    if (!team) return null

                    const dojo = getDojoById(team.dojoId)
                    
                    return (
                      <div
                        key={standing.teamId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? 'bg-gray-50 border border-gray-400' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Ranking Indicator */}
                          <div className="flex items-center justify-center w-6 h-6">
                            {index === 0 ? (
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          
                          {/* Team Logo */}
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={`${team.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          
                          {/* Team and Dojo Info */}
                          <div>
                            <p className="text-body-medium font-medium text-gray-900">
                              {team.name}
                            </p>
                            <p className="text-body-small text-gray-600">
                              {dojo?.name || 'Unknown Dojo'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-title-medium font-bold text-gray-900">
                            {standing.wins}W - {standing.losses}L
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <h4 className="text-title-medium font-medium text-gray-900 mb-3">
                Matches <span className="text-label-small text-gray-500 font-normal">(click to edit)</span>
              </h4>
              <div className="space-y-2">
                {group.matches.map((match) => {
                  const team1 = getTeamById(match.team1Id)
                  const team2 = getTeamById(match.team2Id)
                  if (!team1 || !team2) return null

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md hover:ring-2 hover:ring-primary-200 hover:bg-primary-25 transition-all duration-200 ${getMatchStatusColor(match)} ${getAnimatedBorder(match)} relative group`}
                      onClick={() => onMatchClick?.(match)}
                      title="Click to view or edit match details"
                    >
                      <div className="relative">
                        {/* Edit icon on hover for all matches */}
                        <div className="absolute -right-1 -top-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-gray-50 rounded-full p-1 border border-gray-200">
                            <Edit3 className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>

                        {/* Main match content - consistent padding for perfect centering */}
                        <div className="px-1">
                          <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                            {/* Team 1 */}
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {team1.logo ? (
                                  <img 
                                    src={team1.logo} 
                                    alt={`${team1.name} logo`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-2 h-2 text-gray-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`text-body-small font-medium truncate ${
                                  match.winnerId === team1.id ? 'text-green-700' : 'text-gray-700'
                                }`} title={team1.name}>
                                  {team1.name}
                                </div>
                              </div>
                            </div>
                            
                            {/* VS - Perfectly centered */}
                            <div className="flex items-center justify-center px-2">
                              <span className="text-gray-500 text-body-small font-medium whitespace-nowrap">vs</span>
                            </div>
                            
                            {/* Team 2 */}
                            <div className="flex items-center space-x-2 justify-end min-w-0">
                              <div className="min-w-0 flex-1 text-right">
                                <div className={`text-body-small font-medium truncate ${
                                  match.winnerId === team2.id ? 'text-green-700' : 'text-gray-700'
                                }`} title={team2.name}>
                                  {team2.name}
                                </div>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {team2.logo ? (
                                  <img 
                                    src={team2.logo} 
                                    alt={`${team2.name} logo`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-2 h-2 text-gray-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Score display for completed matches */}
                          {match.status === 'completed' && (
                            <div className="flex items-center justify-center mt-2 text-body-small text-gray-600">
                              <div className="text-center">
                                <div className="font-medium">{match.scores.team1Wins} - {match.scores.team2Wins}</div>
                                <div className="text-xs text-gray-500">
                                  ({match.scores.team1TotalPoints || 0} - {match.scores.team2TotalPoints || 0} pts)
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Qualification Status */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Users className="w-6 h-6 text-accent-400 mr-3" />
          <h3 className="text-title-large font-semibold text-gray-900">
            Main Tournament Seeding
          </h3>
        </div>
        
        <p className="text-body-medium text-gray-600 mb-6">
          All teams advance to the main double elimination bracket with strategic seeding based on their group performance.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group) => {
            const allTeams = group.standings
              .sort((a, b) => {
                if (a.points !== b.points) return b.points - a.points
                if (a.wins !== b.wins) return b.wins - a.wins
                return a.losses - b.losses
              })

            return (
              <div key={group.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-title-small font-medium text-gray-900 mb-3">
                  {group.name} Seeding
                </h4>
                <div className="space-y-2">
                  {allTeams.map((standing, index) => {
                    const team = getTeamById(standing.teamId)
                    if (!team) return null

                    return (
                      <div
                        key={standing.teamId}
                        className={`flex items-center justify-between rounded-lg p-2 ${
                          index === 0 ? 'bg-white border border-gray-400' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          {/* Ranking Indicator */}
                          <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                            {index === 0 ? (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          
                          {/* Team Logo */}
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={`${team.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-3 h-3 text-gray-500" />
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="text-body-small font-medium text-gray-900 truncate">
                              {team.name}
                            </div>
                            <div className="text-label-small text-gray-500 truncate">
                              {getDojoById(team.dojoId)?.name || 'Unknown Dojo'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BracketVisualization