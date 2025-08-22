import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import { useAuth } from '../contexts/AuthContext'
import { User, Dojo, Team, KendoRank } from '../types'
import { getRankBadgeClass, KENDO_RANKS } from '../utils/kendoRanks'
import { Trash2, Edit3, UserCheck, AlertTriangle, X, Check, Search, CheckCircle } from 'lucide-react'

/**
 * UserManagement component - Admin interface for managing users
 * Allows admins to view, edit, and delete users with confirmation dialogs
 */

const UserManagement: React.FC = () => {
  const { users, dojos, teams, updateUser, deleteUser, syncTeamData } = useTournament()
  const { user: currentUser, isSuperAdmin } = useAuth()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editForm, setEditForm] = useState<Partial<User>>({})
  
  // Dojo/Team search state
  const [dojoSearchQuery, setDojoSearchQuery] = useState('')
  const [teamSearchQuery, setTeamSearchQuery] = useState('')
  const [dojoSuggestions, setDojoSuggestions] = useState<Dojo[]>([])
  const [teamSuggestions, setTeamSuggestions] = useState<Team[]>([])
  const [showDojoSuggestions, setShowDojoSuggestions] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)
  const [selectedDojo, setSelectedDojo] = useState<Dojo | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  
  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Check if user can be edited by current user
  const canEditUser = (user: User): boolean => {
    // Super admins can edit anyone
    if (isSuperAdmin()) return true
    // Regular admins cannot edit super admins
    if (user.role === 'super_admin') return false
    // Can't edit self
    if (user.id === currentUser?.id) return false
    return true
  }

  // Check if user can be deleted by current user
  const canDeleteUser = (user: User): boolean => {
    // Super admins can delete anyone (except themselves)
    if (isSuperAdmin()) return user.id !== currentUser?.id
    // Regular admins cannot delete super admins
    if (user.role === 'super_admin') return false
    // Can't delete self
    if (user.id === currentUser?.id) return false
    return true
  }

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
      teamId: user.teamId,
      role: user.role
    })
    
    // Set initial dojo and team
    const userDojo = dojos.find(d => d.id === user.dojoId)
    const userTeam = teams.find(t => t.id === user.teamId)
    
    if (userDojo) {
      setSelectedDojo(userDojo)
      setDojoSearchQuery(userDojo.name)
    } else {
      setSelectedDojo(null)
      setDojoSearchQuery('')
    }
    
    if (userTeam) {
      setSelectedTeam(userTeam)
      setTeamSearchQuery(userTeam.name)
    } else {
      setSelectedTeam(null)
      setTeamSearchQuery('')
    }
    
    // Reset suggestions
    setDojoSuggestions([])
    setTeamSuggestions([])
    setShowDojoSuggestions(false)
    setShowTeamSuggestions(false)
  }

  // Handle user edit save
  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      // Prepare updated user data
      const updatedData = {
        ...editingUser,
        ...editForm,
        updatedAt: new Date().toISOString()
      }

      // Handle dojo/team removal logic
      if (editForm.dojoId === undefined) {
        // Note: dojoId is required in User type, so we can't actually set it to undefined
        // This case might need special handling or the User type needs to be updated
        console.warn('Attempting to remove required dojoId - this may cause issues')
      } else if (editForm.teamId === undefined && editForm.dojoId) {
        // If only team is removed but dojo remains
        updatedData.teamId = undefined
        updatedData.teamName = undefined
      } else {
        // Update dojo/team names if they exist
        const selectedDojoData = dojos.find(d => d.id === editForm.dojoId)
        const selectedTeamData = teams.find(t => t.id === editForm.teamId)
        
        if (selectedDojoData) {
          updatedData.dojoName = selectedDojoData.name
        }
        if (selectedTeamData) {
          updatedData.teamName = selectedTeamData.name
        }
      }

      await updateUser(editingUser.id, updatedData)
      
      // Sync team data to ensure consistency
      syncTeamData()
      
      // Show success toast
      setToast({ type: 'success', message: `${updatedData.fullName} updated successfully!` })
      
      // Clear form
      setEditingUser(null)
      setEditForm({})
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setToast(null), 3000)
      
    } catch (error) {
      console.error('Failed to update user:', error)
      
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
      setToast({ type: 'error', message: `Save failed: ${errorMessage}` })
      
      // Auto-hide toast after 5 seconds for errors
      setTimeout(() => setToast(null), 5000)
    }
  }

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
    setDojoSearchQuery('')
    setTeamSearchQuery('')
    setDojoSuggestions([])
    setTeamSuggestions([])
    setSelectedDojo(null)
    setSelectedTeam(null)
    setShowDojoSuggestions(false)
    setShowTeamSuggestions(false)
  }


  // Handle dojo selection
  const handleDojoSelection = (dojo: Dojo) => {
    setSelectedDojo(dojo)
    setDojoSearchQuery(dojo.name)
    setShowDojoSuggestions(false)
    setEditForm(prev => ({ 
      ...prev, 
      dojoId: dojo.id,
      teamId: undefined // Reset team when dojo changes
    }))
    
    // Clear team selection when dojo changes
    setSelectedTeam(null)
    setTeamSearchQuery('')
    setShowTeamSuggestions(false)
  }

  // Handle team selection
  const handleTeamSelection = (team: Team) => {
    setSelectedTeam(team)
    setTeamSearchQuery(team.name)
    setShowTeamSuggestions(false)
    setEditForm(prev => ({ 
      ...prev, 
      teamId: team.id
    }))
  }

  // Update dojo suggestions
  React.useEffect(() => {
    if (showDojoSuggestions && dojoSearchQuery.length > 0) {
      const suggestions = dojos
        .filter(dojo => 
          dojo.name.toLowerCase().includes(dojoSearchQuery.toLowerCase())
        )
        .slice(0, 5)
      setDojoSuggestions(suggestions)
    } else {
      setDojoSuggestions([])
    }
  }, [dojoSearchQuery, dojos, showDojoSuggestions])

  // Update team suggestions
  React.useEffect(() => {
    if (showTeamSuggestions && selectedDojo) {
      const dojoTeams = teams.filter(team => team.dojoId === selectedDojo.id)
      const suggestions = dojoTeams
        .filter(team => 
          team.name.toLowerCase().includes(teamSearchQuery.toLowerCase())
        )
        .slice(0, 5)
      setTeamSuggestions(suggestions)
    } else {
      setTeamSuggestions([])
    }
  }, [teamSearchQuery, selectedDojo, teams, showTeamSuggestions])

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
                    className={`${canEditUser(user) ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                    onClick={() => canEditUser(user) && handleEditUser(user)}
                    title={canEditUser(user) ? "Click to edit user" : "User cannot be edited"}
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
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' :
                           user.role === 'admin' ? 'Admin' : 'Participant'}
                        </span>
                        {user.role === 'super_admin' && !isSuperAdmin() && (
                          <span className="ml-2 text-xs text-red-600 font-medium">Protected</span>
                        )}
                      </div>
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, kendoRank: e.target.value as KendoRank }))}
                  className="input w-full"
                  required
                >
                  {KENDO_RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'participant' | 'super_admin' }))}
                  className="input w-full"
                  disabled={
                    editingUser?.id === currentUser?.id || // Can't change own role
                    (editingUser?.role === 'super_admin' && !isSuperAdmin()) // Only super admins can change super admin roles
                  }
                  required
                >
                  <option value="participant">Participant</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin() && <option value="super_admin">Super Admin</option>}
                </select>
                {editingUser?.role === 'super_admin' && !isSuperAdmin() && (
                  <p className="text-body-small text-red-600 mt-1">
                    Only super admins can modify super admin roles
                  </p>
                )}
                {editingUser?.id === currentUser?.id && (
                  <p className="text-body-small text-gray-500 mt-1">
                    You cannot change your own role
                  </p>
                )}
              </div>

              {/* Dojo Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Dojo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dojoSearchQuery}
                    onChange={(e) => setDojoSearchQuery(e.target.value)}
                    onBlur={() => {
                      setTimeout(() => setShowDojoSuggestions(false), 150)
                    }}
                    onClick={() => {
                      setShowDojoSuggestions(true)
                    }}
                    placeholder="Search for dojos... (leave empty to remove)"
                    className="input w-full"
                  />
                  {showDojoSuggestions && dojoSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {dojoSuggestions.map((dojo) => (
                        <button
                          key={dojo.id}
                          onClick={() => handleDojoSelection(dojo)}
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
                {selectedDojo ? (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-green-800">Selected: {selectedDojo.name}</div>
                        {selectedDojo.location && (
                          <div className="text-xs text-green-600">{selectedDojo.location}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDojo(null)
                          setDojoSearchQuery('')
                          setSelectedTeam(null)
                          setTeamSearchQuery('')
                          setEditForm(prev => ({ ...prev, dojoId: undefined, teamId: undefined }))
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Remove from dojo"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : editingUser?.dojoId ? (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      No dojo selected - user will be removed from current dojo and team
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Team
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    onBlur={() => {
                      setTimeout(() => setShowTeamSuggestions(false), 150)
                    }}
                    onClick={() => {
                      if (selectedDojo) {
                        setShowTeamSuggestions(true)
                      }
                    }}
                    placeholder={selectedDojo ? `Search teams in ${selectedDojo.name}... (leave empty to remove)` : "Select a dojo first"}
                    className="input w-full"
                    disabled={!selectedDojo}
                  />
                  {showTeamSuggestions && teamSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {teamSuggestions.map((team) => {
                        const memberCount = team.players?.length || 0
                        const isCurrentTeam = team.id === editingUser?.teamId
                        const isFull = memberCount >= 7 && !isCurrentTeam
                        
                        return (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSelection(team)}
                            disabled={isFull}
                            className={`w-full text-left px-4 py-2 border-b border-gray-100 last:border-b-0 ${
                              isFull 
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">{team.name}</div>
                              <div className="text-sm text-gray-500">
                                {memberCount}/7 {isFull && '(Full)'}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {selectedTeam ? (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-green-800">Selected: {selectedTeam.name}</div>
                        <div className="text-xs text-green-600">
                          {selectedTeam.players?.length || 0}/7 members
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeam(null)
                          setTeamSearchQuery('')
                          setEditForm(prev => ({ ...prev, teamId: undefined }))
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Remove from team"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : editingUser?.teamId && selectedDojo ? (
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      No team selected - user will be removed from current team but remain in dojo
                    </div>
                  </div>
                ) : null}
                {!selectedDojo && (
                  <p className="text-body-small text-gray-500 mt-1">
                    Select a dojo first to choose a team
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingUser(editingUser)
                    setEditingUser(null)
                    setEditForm({})
                  }}
                  className="text-red-600 hover:text-red-800 px-3 py-2 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editingUser ? !canDeleteUser(editingUser) : true}
                  title={editingUser?.role === 'super_admin' && !isSuperAdmin() ? 'Protected user cannot be deleted' : 'Delete this user'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {editingUser?.role === 'super_admin' && !isSuperAdmin() ? 'Protected' : 'Delete'}
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center font-medium shadow-sm"
                  >
                    <Check className="w-5 h-5 mr-2" />
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

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
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

export default UserManagement