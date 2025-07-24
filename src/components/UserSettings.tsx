import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import RankSelector from './RankSelector'
import { Edit3, Check, X, User, Building, Trophy, AlertTriangle } from 'lucide-react'
import { KendoRank } from '../types'

/**
 * UserSettings component - Allows users to edit their personal profile information
 * Includes editing of name, date of birth, and kendo rank
 */

const UserSettings: React.FC = () => {
  const { user: currentUser, updateUserProfile } = useAuth()
  const { dojos, teams, updateUser } = useTournament()
  const [editingUserName, setEditingUserName] = useState(false)
  const [editingDateOfBirth, setEditingDateOfBirth] = useState(false)
  const [editingRank, setEditingRank] = useState(false)
  const [userNameValue, setUserNameValue] = useState(currentUser?.fullName || '')
  const [dateOfBirthValue, setDateOfBirthValue] = useState(currentUser?.dateOfBirth || '')
  const [rankValue, setRankValue] = useState<KendoRank>(currentUser?.kendoRank || 'Mudansha')
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

      {/* Current Dojo and Team Info */}
      {(userDojo || userTeam) && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Building className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <h3 className="text-title-medium font-semibold text-gray-900">Dojo & Team</h3>
              <p className="text-body-small text-gray-600">Your current dojo and team assignments</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {userDojo && (
              <div>
                <span className="text-body-medium font-medium text-gray-700">Dojo:</span>
                <p className="text-body-large text-gray-900">{userDojo.name}</p>
                {userDojo.location && (
                  <p className="text-body-small text-gray-500">{userDojo.location}</p>
                )}
              </div>
            )}
            {userTeam && (
              <div>
                <span className="text-body-medium font-medium text-gray-700">Team:</span>
                <p className="text-body-large text-gray-900">{userTeam.name}</p>
                <p className="text-body-small text-gray-500">
                  {userTeam.players?.length || 0}/7 members
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-title-medium font-semibold text-blue-900 mb-2">
          Profile Information
        </h3>
        <ul className="text-body-small text-blue-800 space-y-1">
          <li>• Your personal information is used for tournament registration and identification</li>
          <li>• Date of birth is required for age verification and tournament categories</li>
          <li>• Rank information helps with tournament seeding and matchmaking</li>
          <li>• To change your dojo or team, visit the "Dojo & Team Management" section</li>
        </ul>
      </div>
    </div>
  )
}

export default UserSettings