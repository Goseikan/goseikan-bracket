import React from 'react'
import { Group, TeamStanding, Team, Match } from '../types'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Trophy, Users, Clock, CheckCircle } from 'lucide-react'

/**
 * BracketVisualization component for displaying tournament progress
 * Shows seed groups with round-robin results and standings
 */

interface BracketVisualizationProps {
  groups: Group[]
  teams: Team[]
  onMatchClick?: (match: Match) => void
}

const BracketVisualization: React.FC<BracketVisualizationProps> = ({
  groups,
  teams,
  onMatchClick
}) => {
  // Get team by ID helper
  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(team => team.id === teamId)
  }

  // Get match status icon
  const getMatchStatusIcon = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  // Get match status color
  const getMatchStatusColor = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'in_progress':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
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
                  <h3 className="text-title-large font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <p className="text-body-small text-gray-600">
                    {group.teams.length} teams • {group.matches.length} matches
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-body-small text-gray-600">
                  {group.matches.filter(m => m.status === 'completed').length} / {group.matches.length}
                </div>
                <div className="text-label-small text-gray-500">completed</div>
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

                    return (
                      <div
                        key={standing.teamId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? 'bg-green-50 border border-green-200' :
                          index === 1 ? 'bg-yellow-50 border border-yellow-200' :
                          index === 2 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                            index === 0 ? 'bg-green-600 text-white' :
                            index === 1 ? 'bg-yellow-600 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-body-medium font-medium text-gray-900">
                              {team.name}
                            </p>
                            <p className="text-body-small text-gray-600">
                              {standing.wins}W - {standing.losses}L
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-title-medium font-bold text-gray-900">
                            {standing.points}
                          </div>
                          <div className="text-label-small text-gray-500">pts</div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <h4 className="text-title-medium font-medium text-gray-900 mb-3">
                Matches
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {group.matches.map((match) => {
                  const team1 = getTeamById(match.team1Id)
                  const team2 = getTeamById(match.team2Id)
                  if (!team1 || !team2) return null

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getMatchStatusColor(match)}`}
                      onClick={() => onMatchClick?.(match)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-body-small">
                            <span className={`font-medium ${
                              match.winnerId === team1.id ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {team1.name}
                            </span>
                            <span className="text-gray-500">vs</span>
                            <span className={`font-medium ${
                              match.winnerId === team2.id ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {team2.name}
                            </span>
                          </div>
                          {match.status === 'completed' && (
                            <div className="flex items-center justify-center mt-1 text-body-small text-gray-600">
                              {match.scores.team1Wins} - {match.scores.team2Wins}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          {getMatchStatusIcon(match)}
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
                        className="flex items-center justify-between bg-white rounded-lg p-2"
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 ${
                            index === 0 ? 'bg-green-600' :
                            index === 1 ? 'bg-yellow-600' :
                            index === 2 ? 'bg-orange-600' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-body-small font-medium text-gray-900">
                            {team.name}
                          </span>
                        </div>
                        <span className="text-body-small text-gray-600">
                          {standing.points}pts
                        </span>
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