import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import RankSelector from './RankSelector'
import { Edit3, Check, X, User, Building, Trophy, AlertTriangle, Search, UserMinus, UserPlus, CheckCircle } from 'lucide-react'
import { KendoRank, Dojo, Team } from '../types'

/**
 * UserSettings component - Allows users to edit their personal profile information
 * Includes editing of name, date of birth, and kendo rank
 */

const UserSettings: React.FC = () => {
  const { user: currentUser, updateUserProfile } = useAuth()
  const { dojos, teams, users, updateUser, syncTeamData } = useTournament()
  const [editingUserName, setEditingUserName] = useState(false)
  const [editingDateOfBirth, setEditingDateOfBirth] = useState(false)
  const [editingRank, setEditingRank] = useState(false)
  const [userNameValue, setUserNameValue] = useState(currentUser?.fullName || '')
  const [dateOfBirthValue, setDateOfBirthValue] = useState(currentUser?.dateOfBirth || '')
  const [rankValue, setRankValue] = useState<KendoRank>(currentUser?.kendoRank || 'Mudansha')
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Team/Dojo management state
  const [showJoinDojo, setShowJoinDojo] = useState(false)
  const [showJoinTeam, setShowJoinTeam] = useState(false)
  const [dojoSearchQuery, setDojoSearchQuery] = useState('')
  const [teamSearchQuery, setTeamSearchQuery] = useState('')
  const [dojoSuggestions, setDojoSuggestions] = useState<Dojo[]>([])
  const [teamSuggestions, setTeamSuggestions] = useState<Team[]>([])
  const [showDojoSuggestions, setShowDojoSuggestions] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Note: syncTeamData() is called only when needed during team join attempts
  // to avoid infinite re-render loops

  if (!currentUser) {
    return (
      <div className="card p-6 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
          Not Logged In
        </h3>
        <p className="text-body-medium text-gray-600">
          Please log in to view your settings.
        </p>
      </div>
    )
  }

  // Get user's dojo and team
  const userDojo = dojos.find(d => d.id === currentUser.dojoId)
  
  // Check if user is actually in a team (not just has teamId)
  const userTeam = teams.find(t => {
    if (t.id !== currentUser.teamId) return false
    
    // Check if user is actually in the team's players array
    return t.players.some(p => {
      const playerId = typeof p === 'string' ? p : p.id
      return playerId === currentUser.id
    })
  })

  // Handle user name editing
  const handleStartUserNameEdit = () => {
    setEditingUserName(true)
    setUserNameValue(currentUser.fullName)
    setSaveError(null)
  }

  const handleSaveUserName = async () => {
    if (!userNameValue.trim()) {
      setSaveError('Name cannot be empty')
      return
    }

    try {
      // Update user in tournament context
      await updateUser(currentUser.id, { fullName: userNameValue.trim() })
      // Update user in auth context
      updateUserProfile({ fullName: userNameValue.trim() })
      setEditingUserName(false)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to update user name:', error)
      setSaveError('Failed to save name. Please try again.')
    }
  }

  const handleCancelUserName = () => {
    setEditingUserName(false)
    setUserNameValue(currentUser.fullName)
    setSaveError(null)
  }

  // Handle date of birth editing
  const handleStartDateOfBirthEdit = () => {
    setEditingDateOfBirth(true)
    setDateOfBirthValue(currentUser.dateOfBirth || '')
    setSaveError(null)
  }

  const handleSaveDateOfBirth = async () => {
    if (!dateOfBirthValue.trim()) {
      setSaveError('Date of birth cannot be empty')
      return
    }

    try {
      // Update user in tournament context
      await updateUser(currentUser.id, { dateOfBirth: dateOfBirthValue.trim() })
      // Update user in auth context
      updateUserProfile({ dateOfBirth: dateOfBirthValue.trim() })
      setEditingDateOfBirth(false)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to update date of birth:', error)
      setSaveError('Failed to save date of birth. Please try again.')
    }
  }

  const handleCancelDateOfBirth = () => {
    setEditingDateOfBirth(false)
    setDateOfBirthValue(currentUser.dateOfBirth || '')
    setSaveError(null)
  }

  // Handle rank editing
  const handleStartRankEdit = () => {
    setEditingRank(true)
    setRankValue(currentUser.kendoRank || 'Mudansha')
    setSaveError(null)
  }

  const handleSaveRank = async () => {
    if (!rankValue.trim()) {
      setSaveError('Rank cannot be empty')
      return
    }

    try {
      // Update user in tournament context
      await updateUser(currentUser.id, { kendoRank: rankValue.trim() as KendoRank })
      // Update user in auth context
      updateUserProfile({ kendoRank: rankValue.trim() as KendoRank })
      setEditingRank(false)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to update rank:', error)
      setSaveError('Failed to save rank. Please try again.')
    }
  }

  const handleCancelRank = () => {
    setEditingRank(false)
    setRankValue(currentUser.kendoRank || 'Mudansha')
    setSaveError(null)
  }

  // Handle leaving dojo (and team)
  const handleLeaveDojo = async () => {
    if (!confirm('Are you sure you want to leave your dojo? This will also remove you from your team.')) {
      return
    }

    try {
      const updatedData = {
        dojoId: undefined,
        teamId: undefined,
        dojoName: undefined,
        teamName: undefined
      }
      
      await updateUser(currentUser.id, updatedData)
      updateUserProfile(updatedData)
      setSaveError(null)
      setToast({ type: 'success', message: 'Successfully left dojo and team!' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to leave dojo:', error)
      const errorMsg = 'Failed to leave dojo. Please try again.'
      setSaveError(errorMsg)
      setToast({ type: 'error', message: errorMsg })
      setTimeout(() => setToast(null), 5000)
    }
  }

  // Handle leaving team (but staying in dojo)
  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave your team? You will remain in your dojo.')) {
      return
    }

    try {
      const updatedData = {
        teamId: undefined,
        teamName: undefined
      }
      
      await updateUser(currentUser.id, updatedData)
      updateUserProfile(updatedData)
      setSaveError(null)
      setToast({ type: 'success', message: 'Successfully left team!' })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to leave team:', error)
      const errorMsg = 'Failed to leave team. Please try again.'
      setSaveError(errorMsg)
      setToast({ type: 'error', message: errorMsg })
      setTimeout(() => setToast(null), 5000)
    }
  }

  // Handle joining dojo
  const handleJoinDojo = async (dojo: Dojo) => {
    try {
      const updatedData = {
        dojoId: dojo.id,
        dojoName: dojo.name,
        teamId: undefined, // Reset team when changing dojo
        teamName: undefined
      }
      
      await updateUser(currentUser.id, updatedData)
      updateUserProfile(updatedData)
      setShowJoinDojo(false)
      setDojoSearchQuery('')
      setSaveError(null)
      setToast({ type: 'success', message: `Successfully joined ${dojo.name}!` })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to join dojo:', error)
      const errorMsg = 'Failed to join dojo. Please try again.'
      setSaveError(errorMsg)
      setToast({ type: 'error', message: errorMsg })
      setTimeout(() => setToast(null), 5000)
    }
  }

  // Handle joining team
  const handleJoinTeam = async (team: Team) => {
    console.log('Attempting to join team:', team.name, 'Player count:', team.players.length, 'Players:', team.players)
    
    if (team.players.length >= 7) {
      setSaveError('Cannot join team: Team is full (7/7 members)')
      return
    }

    try {
      const updatedData = {
        teamId: team.id,
        teamName: team.name,
        dojoId: team.dojoId, // Ensure user is in the correct dojo
        dojoName: dojos.find(d => d.id === team.dojoId)?.name
      }
      
      await updateUser(currentUser.id, updatedData)
      updateUserProfile(updatedData)
      setShowJoinTeam(false)
      setTeamSearchQuery('')
      setSaveError(null)
      setToast({ type: 'success', message: `Successfully joined ${team.name}!` })
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      console.error('Failed to join team:', error)
      const errorMsg = 'Failed to join team. Please try again.'
      setSaveError(errorMsg)
      setToast({ type: 'error', message: errorMsg })
      setTimeout(() => setToast(null), 5000)
    }
  }

  // Update dojo suggestions
  React.useEffect(() => {
    if (showDojoSuggestions && dojoSearchQuery.length > 0) {
      const suggestions = dojos
        .filter(dojo => 
          dojo.name.toLowerCase().includes(dojoSearchQuery.toLowerCase()) &&
          dojo.id !== currentUser?.dojoId // Exclude current dojo
        )
        .slice(0, 5)
      setDojoSuggestions(suggestions)
    } else {
      setDojoSuggestions([])
    }
  }, [dojoSearchQuery, dojos, showDojoSuggestions, currentUser?.dojoId])

  // Update team suggestions
  React.useEffect(() => {
    if (showTeamSuggestions && userDojo) {
      console.log('Filtering teams for suggestions...')
      const availableTeams = teams.filter(team => {
        const nameMatch = teamSearchQuery.length === 0 || team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
        const notCurrentTeam = team.id !== currentUser?.teamId
        const correctDojo = team.dojoId === userDojo.id
        
        // Count users who actually have this team assigned to them (more reliable than team.players array)
        const actualMemberCount = users.filter(user => user.teamId === team.id).length
        
        const hasSpace = actualMemberCount < 7
        
        console.log(`Team ${team.name}: nameMatch=${nameMatch}, notCurrentTeam=${notCurrentTeam}, hasSpace=${hasSpace} (${actualMemberCount}/7 actual members, ${team.players.length} in players array), correctDojo=${correctDojo}`)
        
        return nameMatch && notCurrentTeam && hasSpace && correctDojo
      })
      
      console.log('Available teams after filtering:', availableTeams.map(t => {
        const actualCount = users.filter(user => user.teamId === t.id).length
        return `${t.name} (${actualCount}/7 actual, ${t.players.length} in array)`
      }))
      setTeamSuggestions(availableTeams.slice(0, 5))
    } else {
      setTeamSuggestions([])
    }
  }, [teamSearchQuery, teams, showTeamSuggestions, currentUser?.teamId, userDojo])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-title-large font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-body-medium text-gray-600 mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Error Display */}
      {saveError && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-body-medium text-red-800">{saveError}</p>
        </div>
      )}

      {/* User Name */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-8 h-8 text-primary-600 mr-4" />
            <div>
              <h3 className="text-title-medium font-semibold text-gray-900">Your Name</h3>
              <p className="text-body-small text-gray-600">Your display name in the tournament</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          {editingUserName ? (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={userNameValue}
                onChange={(e) => setUserNameValue(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-body-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveUserName()
                  if (e.key === 'Escape') handleCancelUserName()
                }}
                autoFocus
              />
              <button
                onClick={handleSaveUserName}
                className="text-green-600 hover:text-green-700 p-2 rounded"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancelUserName}
                className="text-gray-600 hover:text-gray-700 p-2 rounded"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-body-large text-gray-900">{currentUser.fullName}</span>
              <button
                onClick={handleStartUserNameEdit}
                className="text-primary-600 hover:text-primary-700 p-2 rounded"
                title="Edit Name"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-8 h-8 text-primary-600 mr-4" />
            <div>
              <h3 className="text-title-medium font-semibold text-gray-900">Date of Birth</h3>
              <p className="text-body-small text-gray-600">Your birthdate for age verification</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          {editingDateOfBirth ? (
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={dateOfBirthValue}
                onChange={(e) => setDateOfBirthValue(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-body-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDateOfBirth()
                  if (e.key === 'Escape') handleCancelDateOfBirth()
                }}
                autoFocus
              />
              <button
                onClick={handleSaveDateOfBirth}
                className="text-green-600 hover:text-green-700 p-2 rounded"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancelDateOfBirth}
                className="text-gray-600 hover:text-gray-700 p-2 rounded"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-body-large text-gray-900">
                {currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toLocaleDateString() : 'Not set'}
              </span>
              <button
                onClick={handleStartDateOfBirthEdit}
                className="text-primary-600 hover:text-primary-700 p-2 rounded"
                title="Edit Date of Birth"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kendo Rank */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-accent-600 mr-4" />
            <div>
              <h3 className="text-title-medium font-semibold text-gray-900">Kendo Rank</h3>
              <p className="text-body-small text-gray-600">Your current kendo rank</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          {editingRank ? (
            <div className="space-y-3">
              <RankSelector
                value={rankValue}
                onChange={setRankValue}
                required
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveRank}
                  className="text-green-600 hover:text-green-700 p-2 rounded"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelRank}
                  className="text-gray-600 hover:text-gray-700 p-2 rounded"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-body-large text-gray-900">{currentUser.kendoRank || 'Mudansha'}</span>
              <button
                onClick={handleStartRankEdit}
                className="text-primary-600 hover:text-primary-700 p-2 rounded"
                title="Edit Rank"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dojo & Team Management */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Building className="w-8 h-8 text-green-600 mr-4" />
          <div>
            <h3 className="text-title-medium font-semibold text-gray-900">Dojo & Team Management</h3>
            <p className="text-body-small text-gray-600">Manage your dojo and team memberships</p>
          </div>
        </div>
        
        {/* Current Dojo */}
        <div className="space-y-4">
          <div>
            <span className="text-body-medium font-medium text-gray-700">Current Dojo:</span>
            {userDojo ? (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-large font-medium text-green-900">{userDojo.name}</p>
                    {userDojo.location && (
                      <p className="text-body-small text-green-600">{userDojo.location}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLeaveDojo}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    title="Leave dojo"
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    Leave
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-body-medium text-gray-600 mb-3">You are not currently a member of any dojo.</p>
                {!showJoinDojo ? (
                  <button
                    onClick={() => setShowJoinDojo(true)}
                    className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Join a Dojo
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={dojoSearchQuery}
                        onChange={(e) => setDojoSearchQuery(e.target.value)}
                        onFocus={() => setShowDojoSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowDojoSuggestions(false), 150)}
                        placeholder="Search for dojos..."
                        className="input w-full pl-10"
                      />
                      {showDojoSuggestions && dojoSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {dojoSuggestions.map((dojo) => (
                            <button
                              key={dojo.id}
                              onClick={() => handleJoinDojo(dojo)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{dojo.name}</div>
                              {dojo.location && (
                                <div className="text-sm text-gray-500">{dojo.location}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowJoinDojo(false)
                        setDojoSearchQuery('')
                      }}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Team */}
          <div>
            <span className="text-body-medium font-medium text-gray-700">Current Team:</span>
            {userTeam ? (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-large font-medium text-blue-900">{userTeam.name}</p>
                    <p className="text-body-small text-blue-600">
                      {userTeam.players?.length || 0}/7 members
                    </p>
                  </div>
                  <button
                    onClick={handleLeaveTeam}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    title="Leave team"
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    Leave
                  </button>
                </div>
              </div>
            ) : userDojo ? (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-body-medium text-gray-600 mb-3">You are not currently on any team.</p>
                {!showJoinTeam ? (
                  <button
                    onClick={() => setShowJoinTeam(true)}
                    className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Join a Team
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        onFocus={() => setShowTeamSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowTeamSuggestions(false), 150)}
                        placeholder={`Search teams in ${userDojo.name}...`}
                        className="input w-full pl-10"
                      />
                      {showTeamSuggestions && teamSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {teamSuggestions.map((team) => (
                            <button
                              key={team.id}
                              onClick={() => handleJoinTeam(team)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{team.name}</div>
                                <div className="text-sm text-gray-500">
                                  {team.players?.length || 0}/7 members
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowJoinTeam(false)
                        setTeamSearchQuery('')
                      }}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-body-medium text-gray-600">Join a dojo first to access teams.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-title-medium font-semibold text-blue-900 mb-2">
          Profile & Membership Information
        </h3>
        <ul className="text-body-small text-blue-800 space-y-1">
          <li>• Your personal information is used for tournament registration and identification</li>
          <li>• Date of birth is required for age verification and tournament categories</li>
          <li>• Rank information helps with tournament seeding and matchmaking</li>
          <li>• You can leave and join dojos and teams at any time using the management section above</li>
          <li>• Leaving a dojo will automatically remove you from your team in that dojo</li>
          <li>• Teams are limited to 7 members - you can only join teams with available space</li>
        </ul>
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

export default UserSettings