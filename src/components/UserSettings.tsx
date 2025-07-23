import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import { Edit3, Check, X, User, Building, Trophy, AlertTriangle } from 'lucide-react'

/**
 * UserSettings component - Allows users to edit their own profile and associated dojo/team names
 * Also allows editing of their own name
 */

const UserSettings: React.FC = () => {
  const { user: currentUser, updateUserProfile } = useAuth()
  const { dojos, teams, updateDojo, updateTeam, updateUser } = useTournament()
  const [editingUserName, setEditingUserName] = useState(false)
  const [editingDojoName, setEditingDojoName] = useState(false)
  const [editingTeamName, setEditingTeamName] = useState(false)
  const [userNameValue, setUserNameValue] = useState(currentUser?.fullName || '')
  const [dojoNameValue, setDojoNameValue] = useState('')
  const [teamNameValue, setTeamNameValue] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

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
  const userTeam = teams.find(t => t.id === currentUser.teamId)

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

  // Handle dojo name editing
  const handleStartDojoNameEdit = () => {
    setEditingDojoName(true)
    setDojoNameValue(userDojo?.name || '')
    setSaveError(null)
  }

  const handleSaveDojoName = async () => {
    if (!userDojo || !dojoNameValue.trim()) {
      setSaveError('Dojo name cannot be empty')
      return
    }

    try {
      await updateDojo(userDojo.id, { name: dojoNameValue.trim() })
      setEditingDojoName(false)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to update dojo name:', error)
      setSaveError('Failed to save dojo name. Please try again.')
    }
  }

  const handleCancelDojoName = () => {
    setEditingDojoName(false)
    setDojoNameValue(userDojo?.name || '')
    setSaveError(null)
  }

  // Handle team name editing
  const handleStartTeamNameEdit = () => {
    setEditingTeamName(true)
    setTeamNameValue(userTeam?.name || '')
    setSaveError(null)
  }

  const handleSaveTeamName = async () => {
    if (!userTeam || !teamNameValue.trim()) {
      setSaveError('Team name cannot be empty')
      return
    }

    try {
      await updateTeam(userTeam.id, { name: teamNameValue.trim() })
      setEditingTeamName(false)
      setSaveError(null)
    } catch (error) {
      console.error('Failed to update team name:', error)
      setSaveError('Failed to save team name. Please try again.')
    }
  }

  const handleCancelTeamName = () => {
    setEditingTeamName(false)
    setTeamNameValue(userTeam?.name || '')
    setSaveError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-title-large font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-body-medium text-gray-600 mt-1">
          Manage your personal information and associated dojo/team names
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

      {/* Dojo Name */}
      {userDojo && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-title-medium font-semibold text-gray-900">Your Dojo</h3>
                <p className="text-body-small text-gray-600">Edit your dojo name (affects all members)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            {editingDojoName ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={dojoNameValue}
                  onChange={(e) => setDojoNameValue(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-body-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveDojoName()
                    if (e.key === 'Escape') handleCancelDojoName()
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveDojoName}
                  className="text-green-600 hover:text-green-700 p-2 rounded"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelDojoName}
                  className="text-gray-600 hover:text-gray-700 p-2 rounded"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-body-large text-gray-900">{userDojo.name}</span>
                <button
                  onClick={handleStartDojoNameEdit}
                  className="text-primary-600 hover:text-primary-700 p-2 rounded"
                  title="Edit Dojo Name"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Name */}
      {userTeam && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-accent-600 mr-4" />
              <div>
                <h3 className="text-title-medium font-semibold text-gray-900">Your Team</h3>
                <p className="text-body-small text-gray-600">Edit your team name (affects all team members)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            {editingTeamName ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={teamNameValue}
                  onChange={(e) => setTeamNameValue(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-body-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTeamName()
                    if (e.key === 'Escape') handleCancelTeamName()
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveTeamName}
                  className="text-green-600 hover:text-green-700 p-2 rounded"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancelTeamName}
                  className="text-gray-600 hover:text-gray-700 p-2 rounded"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-body-large text-gray-900">{userTeam.name}</span>
                <button
                  onClick={handleStartTeamNameEdit}
                  className="text-primary-600 hover:text-primary-700 p-2 rounded"
                  title="Edit Team Name"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-title-medium font-semibold text-blue-900 mb-2">
          Name Change Impact
        </h3>
        <ul className="text-body-small text-blue-800 space-y-1">
          <li>• Changing your name only affects your personal profile</li>
          <li>• Changing your dojo name affects all members of your dojo</li>
          <li>• Changing your team name affects all members of your team</li>
          <li>• All changes are immediate and visible to other tournament participants</li>
        </ul>
      </div>
    </div>
  )
}

export default UserSettings