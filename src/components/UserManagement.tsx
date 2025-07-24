import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import { useAuth } from '../contexts/AuthContext'
import { User, Dojo, Team } from '../types'
import { getRankBadgeClass, KENDO_RANKS } from '../utils/kendoRanks'
import { Trash2, Edit3, UserCheck, AlertTriangle, X, Check, Search } from 'lucide-react'

/**
 * UserManagement component - Admin interface for managing users
 * Allows admins to view, edit, and delete users with confirmation dialogs
 */

const UserManagement: React.FC = () => {
  const { users, dojos, teams, updateUser, deleteUser } = useTournament()
  const { user: currentUser } = useAuth()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editForm, setEditForm] = useState<Partial<User>>({})

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.dojoName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get dojo and team names for a user
  const getUserDojoTeam = (user: User) => {
    const dojo = dojos.find(d => d.id === user.dojoId)
    const team = teams.find(t => t.id === user.teamId)
    return { dojo, team }
  }

  // Handle user deletion with confirmation
  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  // Handle user edit start
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      kendoRank: user.kendoRank,
      dateOfBirth: user.dateOfBirth,
      dojoId: user.dojoId,
      teamId: user.teamId
    })
  }

  // Handle user edit save
  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      await updateUser(editingUser.id, {
        ...editingUser,
        ...editForm,
        updatedAt: new Date().toISOString()
      })
      setEditingUser(null)
      setEditForm({})
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  // Handle user role change
  const handleRoleChange = async (user: User, newRole: 'admin' | 'participant') => {
    try {
      await updateUser(user.id, { ...user, role: newRole })
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  // Handle team/dojo switch
  const handleTeamSwitch = async (user: User, newTeamId: string) => {
    const newTeam = teams.find(t => t.id === newTeamId)
    if (!newTeam) return

    // Check if team has space (7 member limit)
    if (newTeam.players.length >= 7) {
      alert('Cannot move user: Target team already has 7 members')
      return
    }

    try {
      await updateUser(user.id, { 
        ...user, 
        teamId: newTeamId,
        dojoId: newTeam.dojoId,
        teamName: newTeam.name,
        dojoName: dojos.find(d => d.id === newTeam.dojoId)?.name || ''
      })
    } catch (error) {
      console.error('Failed to update user team:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title-large font-semibold text-gray-900">User Management</h2>
          <p className="text-body-medium text-gray-600 mt-1">
            Manage tournament participants and administrators
          </p>
        </div>
        <div className="text-right">
          <div className="text-headline-small font-bold text-primary-600">{filteredUsers.length}</div>
          <div className="text-body-small text-gray-600">Total Users</div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, dojo, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dojo/Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const { dojo, team } = getUserDojoTeam(user)
                const teamMemberCount = team?.players.length || 0

                return (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => handleEditUser(user)}
                    title="Click to edit user"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-body-medium font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-body-small text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={getRankBadgeClass(user.kendoRank)}>
                        {user.kendoRank || 'Mudansha'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-body-medium text-gray-900">
                          {dojo?.name || user.dojoName || 'No Dojo'}
                        </div>
                        <div className="text-body-small text-gray-500">
                          {team?.name || user.teamName || 'No Team'} 
                          {teamMemberCount > 0 && ` (${teamMemberCount}/7)`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'participant')}
                        className="text-body-small border border-gray-300 rounded px-2 py-1"
                        disabled={user.id === currentUser?.id} // Can't change own role
                      >
                        <option value="participant">Participant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-body-medium text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No users have been registered yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelEdit}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Edit User
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editForm.dateOfBirth || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>

              {/* Kendo Rank */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Kendo Rank
                </label>
                <select
                  value={editForm.kendoRank || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, kendoRank: e.target.value }))}
                  className="input w-full"
                  required
                >
                  {KENDO_RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Dojo Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Dojo
                </label>
                <select
                  value={editForm.dojoId || ''}
                  onChange={(e) => {
                    const newDojoId = e.target.value
                    setEditForm(prev => ({ 
                      ...prev, 
                      dojoId: newDojoId,
                      teamId: '' // Reset team when dojo changes
                    }))
                  }}
                  className="input w-full"
                  required
                >
                  <option value="">Select Dojo</option>
                  {dojos.map(dojo => (
                    <option key={dojo.id} value={dojo.id}>{dojo.name}</option>
                  ))}
                </select>
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  value={editForm.teamId || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, teamId: e.target.value }))}
                  className="input w-full"
                  disabled={!editForm.dojoId}
                >
                  <option value="">Select Team</option>
                  {teams
                    .filter(team => team.dojoId === editForm.dojoId)
                    .map(team => {
                      const isCurrentTeam = team.id === editingUser?.teamId
                      const isFull = team.players.length >= 7 && !isCurrentTeam
                      return (
                        <option 
                          key={team.id} 
                          value={team.id}
                          disabled={isFull}
                        >
                          {team.name} ({team.players.length}/7) {isFull ? '- Full' : ''}
                        </option>
                      )
                    })
                  }
                </select>
                {!editForm.dojoId && (
                  <p className="text-body-small text-gray-500 mt-1">
                    Select a dojo first to choose a team
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingUser(editingUser)
                    setEditingUser(null)
                    setEditForm({})
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  disabled={editingUser?.id === currentUser?.id} // Can't delete self
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-outlined"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setDeletingUser(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-title-medium font-semibold text-gray-900">
                Delete User
              </h3>
            </div>
            <p className="text-body-medium text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deletingUser.fullName}</strong>? 
              This action cannot be undone and will remove them from their team and all tournament data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="btn-outlined"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement