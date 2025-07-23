import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import { sortDojoMembersByRank, getRankBadgeClass } from '../utils/kendoRanks'
import { User, Users, Trophy, MapPin } from 'lucide-react'

/**
 * DashboardPage component - User's personal tournament dashboard
 * Shows personal info, dojo members, and tournament status
 */

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { 
    tournament, 
    getUsersByDojoId, 
    getTeamsByDojoId, 
    getUserById, 
    getTeamById, 
    getDojoById 
  } = useTournament()

  if (!user) {
    return null
  }

  // Get user's dojo and team information
  const userDojo = getDojoById(user.dojoId)
  const userTeam = getTeamById(user.teamId)
  const dojoMembers = getUsersByDojoId(user.dojoId)
  const dojoTeams = getTeamsByDojoId(user.dojoId)

  // Sort dojo members by rank (highest first)
  const sortedDojoMembers = sortDojoMembersByRank(dojoMembers)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-display-small font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-body-large text-gray-600">
            Your tournament dashboard and information center
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-title-large font-semibold text-gray-900">
                  Your Information
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-label-medium text-gray-600">Full Name</label>
                  <p className="text-body-large font-medium text-gray-900">{user.fullName}</p>
                </div>
                
                <div>
                  <label className="text-label-medium text-gray-600">Kendo Rank</label>
                  <div className="mt-1">
                    <span className={getRankBadgeClass(user.kendoRank)}>
                      {user.kendoRank}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-label-medium text-gray-600">Dojo</label>
                  <p className="text-body-large font-medium text-gray-900">{userDojo?.name}</p>
                </div>
                
                <div>
                  <label className="text-label-medium text-gray-600">Team</label>
                  <p className="text-body-large font-medium text-gray-900">{userTeam?.name}</p>
                </div>
              </div>
            </div>

            {/* Tournament Status */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-6 h-6 text-accent-400 mr-3" />
                <h2 className="text-title-large font-semibold text-gray-900">
                  Tournament Status
                </h2>
              </div>
              
              {tournament ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-label-medium text-gray-600">Tournament</label>
                    <p className="text-body-large font-medium text-gray-900">{tournament.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-label-medium text-gray-600">Current Stage</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'registration' ? 'bg-blue-100 text-blue-800' :
                        tournament.status === 'seed' ? 'bg-yellow-100 text-yellow-800' :
                        tournament.status === 'main' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)} Stage
                      </span>
                    </div>
                  </div>
                  
                  {tournament.status === 'registration' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-body-small text-blue-800">
                        Tournament registration is currently open. More participants can still join.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-body-medium text-gray-600">
                  No active tournament at this time.
                </p>
              )}
            </div>
          </div>

          {/* Dojo Information */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-title-large font-semibold text-gray-900">
                    {userDojo?.name} Members
                  </h2>
                </div>
                <div className="text-body-small text-gray-500">
                  {dojoMembers.length} total members
                </div>
              </div>

              {/* Dojo Teams */}
              <div className="space-y-6">
                {dojoTeams.map((team) => {
                  const teamMembers = team.players
                    .map(playerId => getUserById(playerId))
                    .filter(Boolean)
                    .sort((a, b) => sortDojoMembersByRank([a!, b!]).indexOf(a!) - sortDojoMembersByRank([a!, b!]).indexOf(b!))

                  return (
                    <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-title-medium font-semibold text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        {team.name}
                        <span className="ml-2 text-body-small text-gray-500">
                          ({teamMembers.length} members)
                        </span>
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teamMembers.map((member, index) => (
                          <div 
                            key={member!.id} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              member!.id === user.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <div>
                              <p className={`text-body-medium font-medium ${
                                member!.id === user.id ? 'text-primary-900' : 'text-gray-900'
                              }`}>
                                {member!.fullName}
                                {member!.id === user.id && (
                                  <span className="text-body-small text-primary-600 ml-1">(You)</span>
                                )}
                              </p>
                              <p className="text-body-small text-gray-600">
                                Position {index + 1}
                              </p>
                            </div>
                            <span className={getRankBadgeClass(member!.kendoRank)}>
                              {member!.kendoRank}
                            </span>
                          </div>
                        ))}
                        
                        {/* Show empty positions */}
                        {Array.from({ length: Math.max(0, 7 - teamMembers.length) }, (_, index) => (
                          <div 
                            key={`empty-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300"
                          >
                            <div>
                              <p className="text-body-medium text-gray-500">
                                Open Position
                              </p>
                              <p className="text-body-small text-gray-400">
                                Position {teamMembers.length + index + 1}
                              </p>
                            </div>
                            <span className="text-body-small text-gray-400">
                              Vacant
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {dojoTeams.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-body-large text-gray-600">
                    No teams found for your dojo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage