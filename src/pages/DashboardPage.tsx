import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import { sortDojoMembersByRank, getRankBadgeClass } from '../utils/kendoRanks'
import DojoManagement from '../components/DojoManagement'
import UserSettings from '../components/UserSettings'
import { User, Users, Trophy, MapPin, Building, Settings, RefreshCw, Edit3, Check, X, ChevronUp, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react'

/**
 * DashboardPage component - User's personal registration dashboard
 * REGISTRATION-ONLY MODE: Shows personal info, dojo/team management
 * Tournament features temporarily disabled. See backups/tournament-features/ for restoration.
 */

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { 
    tournament, 
    getUsersByDojoId, 
    getTeamsByDojoId, 
    getUserById, 
    getTeamById, 
    getDojoById,
    updateDojo,
    updateTeam,
    updateUser
  } = useTournament()

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')
  
  // Edit state
  const [editingDojo, setEditingDojo] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [dojoNameEdit, setDojoNameEdit] = useState('')
  const [teamNameEdit, setTeamNameEdit] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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

  // Edit handlers
  const handleStartEditDojo = (dojoId: string, currentName: string) => {
    setEditingDojo(dojoId)
    setDojoNameEdit(currentName)
  }

  const handleSaveDojoEdit = async () => {
    if (!editingDojo || !dojoNameEdit.trim()) return
    
    try {
      await updateDojo(editingDojo, { name: dojoNameEdit.trim() })
      setEditingDojo(null)
      setDojoNameEdit('')
      setToast({ type: 'success', message: 'Dojo name updated successfully!' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to update dojo name:', error)
      setToast({ type: 'error', message: 'Failed to update dojo name. Please try again.' })
      setTimeout(() => setToast(null), 5000)
    }
  }

  const handleCancelDojoEdit = () => {
    setEditingDojo(null)
    setDojoNameEdit('')
  }

  const handleStartEditTeam = (teamId: string, currentName: string) => {
    setEditingTeam(teamId)
    setTeamNameEdit(currentName)
  }

  const handleSaveTeamEdit = async () => {
    if (!editingTeam || !teamNameEdit.trim()) return
    
    try {
      await updateTeam(editingTeam, { name: teamNameEdit.trim() })
      setEditingTeam(null)
      setTeamNameEdit('')
      setToast({ type: 'success', message: 'Team name updated successfully!' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to update team name:', error)
      setToast({ type: 'error', message: 'Failed to update team name. Please try again.' })
      setTimeout(() => setToast(null), 5000)
    }
  }

  const handleCancelTeamEdit = () => {
    setEditingTeam(null)
    setTeamNameEdit('')
  }

  // Team member reordering
  const handleMoveMember = async (teamId: string, memberId: string, direction: 'up' | 'down') => {
    const team = getTeamById(teamId)
    if (!team || !team.players) return

    const currentIndex = team.players.findIndex((p: any) => p.id === memberId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= team.players.length) return
    
    try {
      // Create new players array with swapped positions
      const newPlayers = [...team.players]
      const temp = newPlayers[currentIndex]
      newPlayers[currentIndex] = newPlayers[newIndex]
      newPlayers[newIndex] = temp
      
      await updateTeam(teamId, { players: newPlayers })
      setToast({ type: 'success', message: 'Team order updated!' })
      setTimeout(() => setToast(null), 2000)
    } catch (error) {
      console.error('Failed to reorder team members:', error)
      setToast({ type: 'error', message: 'Failed to reorder team members.' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-display-small font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-body-large text-gray-600">
            Manage your registration and team information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
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

            {/* Registration Status */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-6 h-6 text-green-500 mr-3" />
                <h2 className="text-title-large font-semibold text-gray-900">
                  Registration Status
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-label-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Successfully Registered
                    </span>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-body-small text-green-800">
                    You're all set! Tournament details and schedules will be announced closer to the event date.
                  </p>
                </div>
                
                <div>
                  <label className="text-label-medium text-gray-600">Next Steps</label>
                  <ul className="mt-2 text-body-small text-gray-600 space-y-1">
                    <li>• Keep your team and dojo information updated</li>
                    <li>• Check for tournament announcements</li>
                    <li>• Prepare for competition</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Dojo Information */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-primary-600 mr-3" />
                  {editingDojo === userDojo?.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={dojoNameEdit}
                        onChange={(e) => setDojoNameEdit(e.target.value)}
                        className="text-title-large font-semibold bg-white border border-gray-300 rounded px-2 py-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveDojoEdit()
                          if (e.key === 'Escape') handleCancelDojoEdit()
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveDojoEdit}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Save dojo name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelDojoEdit}
                        className="text-gray-600 hover:text-gray-700 p-1"
                        title="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div>
                        <h2 className="text-title-large font-semibold text-gray-900">
                          {userDojo?.name}
                        </h2>
                        {userDojo?.location && (
                          <p className="text-body-medium text-gray-600 mt-1">
                            {userDojo.location}
                          </p>
                        )}
                      </div>
                      {userDojo && (user.role === 'admin' || user.role === 'super_admin') && (
                        <button
                          onClick={() => handleStartEditDojo(userDojo.id, userDojo.name)}
                          className="ml-2 text-gray-400 hover:text-primary-600 p-1"
                          title="Edit dojo name"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-body-small text-gray-500">
                  {dojoMembers.length} total members
                </div>
              </div>

              {/* Dojo Teams */}
              <div className="space-y-6">
                {dojoTeams.map((team) => {
                  const teamMembers = team.players
                    .map((player: any) => typeof player === 'string' ? getUserById(player) : player)
                    .filter(Boolean)

                  return (
                    <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                          {editingTeam === team.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={teamNameEdit}
                                onChange={(e) => setTeamNameEdit(e.target.value)}
                                className="text-title-medium font-semibold bg-white border border-gray-300 rounded px-2 py-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveTeamEdit()
                                  if (e.key === 'Escape') handleCancelTeamEdit()
                                }}
                                autoFocus
                              />
                              <button
                                onClick={handleSaveTeamEdit}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Save team name"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelTeamEdit}
                                className="text-gray-600 hover:text-gray-700 p-1"
                                title="Cancel edit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <h3 className="text-title-medium font-semibold text-gray-900">
                                {team.name}
                              </h3>
                              {(user.role === 'admin' || user.role === 'super_admin') && (
                                <button
                                  onClick={() => handleStartEditTeam(team.id, team.name)}
                                  className="ml-2 text-gray-400 hover:text-primary-600 p-1"
                                  title="Edit team name"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                          <span className="ml-2 text-body-small text-gray-500">
                            ({teamMembers.length}/7 members)
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teamMembers.map((member, index) => (
                          <div 
                            key={member!.id} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              member!.id === user.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-body-medium font-medium truncate ${
                                    member!.id === user.id ? 'text-primary-900' : 'text-gray-900'
                                  }`}>
                                    {member!.fullName}
                                    {member!.id === user.id && (
                                      <span className="text-body-small text-primary-600 ml-1">(You)</span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-body-small text-gray-600">
                                      Position {index + 1}
                                    </p>
                                    <span className={getRankBadgeClass(member!.kendoRank)}>
                                      {member!.kendoRank}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Admin reordering controls */}
                                {(user.role === 'admin' || user.role === 'super_admin') && teamMembers.length > 1 && (
                                  <div className="flex items-center ml-2 space-x-1 flex-shrink-0">
                                    <button
                                      onClick={() => handleMoveMember(team.id, member!.id, 'up')}
                                      disabled={index === 0}
                                      className={`p-1 rounded ${
                                        index === 0 
                                          ? 'text-gray-300 cursor-not-allowed' 
                                          : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                                      }`}
                                      title={`Move to position ${index}`}
                                    >
                                      <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveMember(team.id, member!.id, 'down')}
                                      disabled={index === teamMembers.length - 1}
                                      className={`p-1 rounded ${
                                        index === teamMembers.length - 1 
                                          ? 'text-gray-300 cursor-not-allowed' 
                                          : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                                      }`}
                                      title={`Move to position ${index + 2}`}
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Show empty positions with assignment ability */}
                        {Array.from({ length: Math.max(0, 7 - teamMembers.length) }, (_, index) => {
                          // Get unassigned dojo members for assignment
                          const unassignedMembers = sortedDojoMembers.filter(member => !member.teamId)
                          
                          return (
                            <div 
                              key={`empty-${index}`}
                              className="p-3 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-body-medium text-gray-500">
                                    Open Position
                                  </p>
                                  <p className="text-body-small text-gray-400">
                                    Position {teamMembers.length + index + 1}
                                  </p>
                                </div>
                              </div>
                              {(user.role === 'admin' || user.role === 'super_admin') && unassignedMembers.length > 0 ? (
                                <select
                                  onChange={async (e) => {
                                    if (e.target.value) {
                                      const selectedMember = unassignedMembers.find(m => m.id === e.target.value)
                                      if (selectedMember) {
                                        try {
                                          await updateUser(selectedMember.id, {
                                            teamId: team.id,
                                            teamName: team.name
                                          })
                                          setToast({ type: 'success', message: `${selectedMember.fullName} added to ${team.name}!` })
                                          setTimeout(() => setToast(null), 3000)
                                        } catch (error) {
                                          console.error('Failed to assign team:', error)
                                          setToast({ type: 'error', message: 'Failed to assign team. Please try again.' })
                                          setTimeout(() => setToast(null), 5000)
                                        }
                                      }
                                    }
                                    e.target.value = '' // Reset select
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-primary-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  defaultValue=""
                                >
                                  <option value="" className="text-gray-500">+ Assign member</option>
                                  {unassignedMembers.map(member => (
                                    <option key={member.id} value={member.id} className="text-gray-900">
                                      {member.fullName} ({member.kendoRank})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="text-center">
                                  <span className="text-body-small text-gray-400">
                                    {unassignedMembers.length === 0 && (user.role === 'admin' || user.role === 'super_admin') ? 'No unassigned members' : 'Vacant'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
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

            {/* All Dojo Members List */}
            {userDojo && (
              <div className="card p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 text-primary-600 mr-3" />
                    <h3 className="text-title-large font-semibold text-gray-900">
                      All Members
                    </h3>
                  </div>
                  <div className="text-body-small text-gray-500">
                    {sortedDojoMembers.length} total members
                  </div>
                </div>
                
                <p className="text-body-medium text-gray-600 mb-6">
                  Complete list of all dojo members sorted by rank (highest to lowest)
                </p>

                {/* Members Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedDojoMembers.map((member) => {
                        const memberTeam = member.teamId ? getTeamById(member.teamId) : null

                        return (
                          <tr 
                            key={member.id}
                            className={member.id === user.id ? 'bg-primary-50' : 'hover:bg-gray-50'}
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className={`text-body-medium font-medium ${
                                    member.id === user.id ? 'text-primary-900' : 'text-gray-900'
                                  }`}>
                                    {member.fullName}
                                    {member.id === user.id && (
                                      <span className="text-body-small text-primary-600 ml-1">(You)</span>
                                    )}
                                  </div>
                                  <div className="text-body-small text-gray-500">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={getRankBadgeClass(member.kendoRank)}>
                                {member.kendoRank}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {memberTeam ? (
                                <div className="text-body-medium font-medium text-gray-900">
                                  {memberTeam.name}
                                </div>
                              ) : (
                                <span className="text-body-medium text-gray-500 italic">
                                  No team
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {sortedDojoMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-body-large text-gray-600">
                      No members found in your dojo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        ) : (
          /* Settings Tab */
          <UserSettings />
        )}
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="text-body-medium font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white hover:text-gray-200 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardPage