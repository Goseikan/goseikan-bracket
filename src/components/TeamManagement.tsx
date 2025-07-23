import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import { Team } from '../types'
import LogoUpload from './LogoUpload'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Trophy, Trash2, Edit3, AlertTriangle, X, Users, Building, Check } from 'lucide-react'

/**
 * TeamManagement component - Admin interface for managing teams
 * Allows admins to view, edit logos, and delete teams with confirmation dialogs
 */

const TeamManagement: React.FC = () => {
  const { teams, dojos, users, updateTeam, deleteTeam } = useTournament()
  const [editingNameTeam, setEditingNameTeam] = useState<Team | null>(null)
  const [editingLogoTeam, setEditingLogoTeam] = useState<Team | null>(null)
  const [editingName, setEditingName] = useState<string>('')
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dojos.find(d => d.id === team.dojoId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get dojo and members for a team
  const getTeamDetails = (team: Team) => {
    const dojo = dojos.find(d => d.id === team.dojoId)
    const members = team.players || []
    return { dojo, members, memberCount: members.length }
  }

  // Handle team deletion with confirmation
  const handleDeleteTeam = async () => {
    if (!deletingTeam) return

    try {
      await deleteTeam(deletingTeam.id)
      setDeletingTeam(null)
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  // Handle name editing start
  const handleStartNameEdit = (team: Team) => {
    setEditingNameTeam(team)
    setEditingName(team.name)
  }

  // Handle name save
  const handleNameSave = async () => {
    if (!editingNameTeam || !editingName.trim()) return

    try {
      await updateTeam(editingNameTeam.id, { name: editingName.trim() })
      setEditingNameTeam(null)
      setEditingName('')
    } catch (error) {
      console.error('Failed to update team name:', error)
    }
  }

  // Handle name cancel
  const handleNameCancel = () => {
    setEditingNameTeam(null)
    setEditingName('')
  }

  // Handle logo upload
  const handleLogoUpdate = async (team: Team, logoData: string) => {
    try {
      await updateTeam(team.id, { logo: logoData })
      // Don't close modal - let user close it manually
    } catch (error) {
      console.error('Failed to update team logo:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-large font-semibold text-gray-900">Team Management</h2>
          <p className="text-body-medium text-gray-600 mt-1">
            Manage tournament teams and their logos
          </p>
        </div>
        <div className="text-right">
          <div className="text-headline-small font-bold text-primary-600">{filteredTeams.length}</div>
          <div className="text-body-small text-gray-600">Total Teams</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Search teams by name or dojo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const { dojo, members, memberCount } = getTeamDetails(team)
          
          return (
            <div key={team.id} className="card p-6">
              {/* Team Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {/* Team Logo */}
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-accent-200 mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-accent-200 rounded-lg flex items-center justify-center mr-3">
                      <Trophy className="w-6 h-6 text-accent-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {editingNameTeam?.id === team.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="text-title-medium font-semibold text-gray-900 bg-white border border-primary-300 rounded px-2 py-1 flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNameSave()
                            if (e.key === 'Escape') handleNameCancel()
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleNameSave}
                          className="text-green-600 hover:text-green-700 p-1 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNameCancel}
                          className="text-gray-600 hover:text-gray-700 p-1 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 
                        className="text-title-medium font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                        onClick={() => handleStartNameEdit(team)}
                        title="Click to edit name"
                      >
                        {team.name}
                      </h3>
                    )}
                    <p className="text-body-small text-gray-500">
                      {dojo?.name || 'Unknown Dojo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingLogoTeam(team)}
                    className="text-primary-600 hover:text-primary-700 p-1 rounded"
                    title="Edit Logo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTeam(team)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Team Stats */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-medium font-medium text-gray-700">Members</span>
                  <span className={`text-body-small font-medium ${
                    memberCount === 7 ? 'text-green-600' : 
                    memberCount > 7 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {memberCount}/7
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      memberCount === 7 ? 'bg-green-500' : 
                      memberCount > 7 ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min((memberCount / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Team Members */}
              {members.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-body-medium font-medium text-gray-700 mb-2">Team Members</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {members.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-body-small">
                        <span className="text-gray-900 truncate">{member.fullName}</span>
                        <div className={getRankBadgeClass(member.kendoRank)}>
                          {member.kendoRank || 'Mudansha'}
                        </div>
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div className="text-body-small text-gray-500 text-center">
                        +{members.length - 5} more members
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seed Ranking */}
              {team.seedRanking && (
                <div className="mb-4">
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-label-small font-medium text-center">
                    Seed #{team.seedRanking}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-body-small text-gray-500">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="card p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
            No teams found
          </h3>
          <p className="text-body-medium text-gray-600">
            {searchQuery ? 'Try adjusting your search criteria.' : 'No teams have been registered yet.'}
          </p>
        </div>
      )}

      {/* Logo Edit Modal */}
      {editingLogoTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Update Team Logo
              </h3>
              <button
                onClick={() => setEditingLogoTeam(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-body-medium text-gray-600 mb-2">
                Updating logo for: <strong>{editingLogoTeam.name}</strong>
              </p>
              
              {/* Current Logo */}
              {editingLogoTeam.logo && (
                <div className="mb-4">
                  <p className="text-body-small text-gray-500 mb-2">Current Logo:</p>
                  <img
                    src={editingLogoTeam.logo}
                    alt="Current logo"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            <LogoUpload
              currentLogo={editingLogoTeam.logo}
              onLogoChange={(logoData) => logoData && handleLogoUpdate(editingLogoTeam, logoData)}
              label="Upload New Logo"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingLogoTeam(null)}
                className="btn-outlined"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-title-medium font-semibold text-gray-900">
                Delete Team
              </h3>
            </div>
            
            {(() => {
              const { dojo, memberCount } = getTeamDetails(deletingTeam)
              return (
                <div>
                  <p className="text-body-medium text-gray-600 mb-4">
                    Are you sure you want to delete <strong>{deletingTeam.name}</strong> from <strong>{dojo?.name}</strong>?
                  </p>
                  {memberCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-body-small text-red-800 font-medium mb-2">
                        This will affect:
                      </p>
                      <ul className="text-body-small text-red-700 space-y-1">
                        <li>• {memberCount} team member{memberCount !== 1 ? 's' : ''} will be moved to other teams or become unassigned</li>
                      </ul>
                      <p className="text-body-small text-red-800 font-medium mt-2">
                        This action cannot be undone.
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingTeam(null)}
                className="btn-outlined"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement