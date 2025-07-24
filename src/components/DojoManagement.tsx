import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import LogoUpload from './LogoUpload'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Building, Users, Save, AlertCircle, Plus, Edit3, X, Check, RefreshCw, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

/**
 * DojoManagement component for managing dojo and team logos
 * Allows dojo members to upload and manage logos for their dojo and teams
 */

const DojoManagement: React.FC = () => {
  const { user, updateUserProfile } = useAuth()
  const { dojos, teams, getDojoById, getTeamsByDojoId, addDojo, addTeam, updateDojo, updateTeam, updateUser } = useTournament()
  
  const [userDojo, setUserDojo] = useState<any>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [dojoLogo, setDojoLogo] = useState<string>('')
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Dojo editing state
  const [editingDojo, setEditingDojo] = useState(false)
  const [editDojoName, setEditDojoName] = useState('')
  const [editDojoLocation, setEditDojoLocation] = useState('')
  
  // Team editing state
  const [editingTeam, setEditingTeam] = useState<any | null>(null)
  const [editTeamName, setEditTeamName] = useState('')
  
  // Dojo/Team switching state
  const [switchingDojo, setSwitchingDojo] = useState(false)
  const [switchingTeam, setSwitchingTeam] = useState(false)
  const [dojoSearchQuery, setDojoSearchQuery] = useState('')
  const [teamSearchQuery, setTeamSearchQuery] = useState('')
  const [dojoSuggestions, setDojoSuggestions] = useState<typeof dojos>([])
  const [teamSuggestions, setTeamSuggestions] = useState<typeof teams>([])
  const [selectedNewDojo, setSelectedNewDojo] = useState<any | null>(null)
  const [selectedNewTeam, setSelectedNewTeam] = useState<any | null>(null)
  const [showDojoSuggestions, setShowDojoSuggestions] = useState(false)
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false)
  const [showTeamSwitchSuggestions, setShowTeamSwitchSuggestions] = useState(false)
  const [reorderingMembers, setReorderingMembers] = useState<string | null>(null)
  const [draggedMember, setDraggedMember] = useState<any | null>(null)
  
  // New dojo/team creation state (admin only)
  const [showCreateDojo, setShowCreateDojo] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newDojoName, setNewDojoName] = useState('')
  const [newDojoLocation, setNewDojoLocation] = useState('')
  const [newTeamName, setNewTeamName] = useState('')

  // Load user's dojo and teams
  useEffect(() => {
    if (user) {
      const dojo = getDojoById(user.dojoId)
      const dojoTeams = getTeamsByDojoId(user.dojoId)
      
      setUserDojo(dojo)
      setUserTeams(dojoTeams)
      
      // Set current logos
      if (dojo?.logo) {
        setDojoLogo(dojo.logo)
      }
      
      // Set edit values
      if (dojo) {
        setEditDojoName(dojo.name)
        setEditDojoLocation(dojo.location || '')
      }
      
      const teamLogoMap: Record<string, string> = {}
      dojoTeams.forEach(team => {
        if (team.logo) {
          teamLogoMap[team.id] = team.logo
        }
      })
      setTeamLogos(teamLogoMap)
    }
  }, [user, dojos, teams])

  // Update dojo suggestions based on search query
  useEffect(() => {
    if (showDojoSuggestions) {
      const suggestions = dojos
        .filter(dojo => 
          dojo.name.toLowerCase().includes(dojoSearchQuery.toLowerCase()) &&
          dojo.id !== user?.dojoId // Exclude current dojo
        )
        .slice(0, 5)
      setDojoSuggestions(suggestions)
    } else {
      setDojoSuggestions([])
    }
  }, [dojoSearchQuery, dojos, user?.dojoId, showDojoSuggestions])

  // Update team suggestions based on current dojo and search query (for dojo switching)
  useEffect(() => {
    const targetDojoId = selectedNewDojo?.id
    if (showTeamSuggestions && targetDojoId) {
      const dojoTeams = teams.filter(team => team.dojoId === targetDojoId)
      const suggestions = dojoTeams
        .filter(team => 
          team.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) &&
          team.id !== user?.teamId // Exclude current team
        )
        .slice(0, 5)
      setTeamSuggestions(suggestions)
    } else {
      setTeamSuggestions([])
    }
  }, [teamSearchQuery, selectedNewDojo, user?.teamId, teams, showTeamSuggestions])

  // Update team switch suggestions based on current dojo (for regular team switching)
  useEffect(() => {
    if (showTeamSwitchSuggestions && user?.dojoId) {
      const dojoTeams = teams.filter(team => team.dojoId === user.dojoId)
      const suggestions = dojoTeams
        .filter(team => 
          team.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) &&
          team.id !== user?.teamId // Exclude current team
        )
        .slice(0, 5)
      setTeamSuggestions(suggestions)
    } else if (!showTeamSuggestions) {
      setTeamSuggestions([])
    }
  }, [teamSearchQuery, user?.dojoId, user?.teamId, teams, showTeamSwitchSuggestions, showTeamSuggestions])

  // Handle dojo logo change
  const handleDojoLogoChange = (logo: string | null) => {
    setDojoLogo(logo || '')
  }

  // Handle team logo change
  const handleTeamLogoChange = (teamId: string, logo: string | null) => {
    setTeamLogos(prev => ({
      ...prev,
      [teamId]: logo || ''
    }))
  }

  // Handle dojo editing
  const handleStartDojoEdit = () => {
    setEditingDojo(true)
    setEditDojoName(userDojo.name)
    setEditDojoLocation(userDojo.location || '')
  }

  const handleSaveDojoEdit = async () => {
    if (!userDojo || !editDojoName.trim()) {
      setError('Dojo name is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await updateDojo(userDojo.id, {
        name: editDojoName.trim(),
        location: editDojoLocation.trim()
      })
      
      setSuccess('Dojo information updated successfully!')
      setEditingDojo(false)
    } catch (err) {
      setError('Failed to update dojo information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDojoEdit = () => {
    setEditingDojo(false)
    setEditDojoName(userDojo.name)
    setEditDojoLocation(userDojo.location || '')
  }

  // Handle team editing
  const handleStartTeamEdit = (team: any) => {
    setEditingTeam(team)
    setEditTeamName(team.name)
  }

  const handleSaveTeamEdit = async () => {
    if (!editingTeam || !editTeamName.trim()) {
      setError('Team name is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await updateTeam(editingTeam.id, { name: editTeamName.trim() })
      
      setSuccess('Team updated successfully!')
      setEditingTeam(null)
    } catch (err) {
      setError('Failed to update team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTeamEdit = () => {
    setEditingTeam(null)
    setEditTeamName('')
  }

  // Handle dojo switching
  const handleStartDojoSwitch = () => {
    setSwitchingDojo(true)
    setDojoSearchQuery('')
    setTeamSearchQuery('')
    setDojoSuggestions([])
    setTeamSuggestions([])
    setSelectedNewDojo(null)
    setSelectedNewTeam(null)
    setShowDojoSuggestions(false)
    setShowTeamSuggestions(false)
    setError('')
  }

  const handleDojoSelection = (dojo: typeof dojos[0]) => {
    setSelectedNewDojo(dojo)
    setDojoSearchQuery(dojo.name)
    setShowDojoSuggestions(false)
    setDojoSuggestions([])
    // Clear team selection when dojo changes
    setSelectedNewTeam(null)
    setTeamSearchQuery('')
    setShowTeamSuggestions(false)
    setTeamSuggestions([])
  }

  const handleTeamSelection = (team: typeof teams[0]) => {
    setSelectedNewTeam(team)
    setTeamSearchQuery(team.name)
    setShowTeamSuggestions(false)
    setTeamSuggestions([])
  }

  const handleConfirmDojoSwitch = async () => {
    if (!selectedNewDojo || !selectedNewTeam) {
      setError('Please select both a dojo and a team')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Update user's dojo and team
      await updateUser(user!.id, { 
        dojoId: selectedNewDojo.id,
        teamId: selectedNewTeam.id
      })
      
      // Update auth context
      updateUserProfile({ 
        dojoId: selectedNewDojo.id,
        teamId: selectedNewTeam.id,
        teamName: selectedNewTeam.name
      })
      
      setSwitchingDojo(false)
      setDojoSearchQuery('')
      setTeamSearchQuery('')
      setDojoSuggestions([])
      setTeamSuggestions([])
      setSelectedNewDojo(null)
      setSelectedNewTeam(null)
      setSuccess(`Successfully switched to ${selectedNewDojo.name} - ${selectedNewTeam.name}`)
    } catch (error) {
      console.error('Failed to switch dojo:', error)
      setError('Failed to switch dojo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDojoSwitch = () => {
    setSwitchingDojo(false)
    setDojoSearchQuery('')
    setTeamSearchQuery('')
    setDojoSuggestions([])
    setTeamSuggestions([])
    setSelectedNewDojo(null)
    setSelectedNewTeam(null)
    setShowDojoSuggestions(false)
    setShowTeamSuggestions(false)
    setError('')
  }

  // Handle team switching (within current dojo)
  const handleStartTeamSwitch = () => {
    setSwitchingTeam(true)
    setTeamSearchQuery('')
    setTeamSuggestions([])
    setShowTeamSwitchSuggestions(false)
    setError('')
  }

  const handleTeamSelect = async (team: typeof teams[0]) => {
    try {
      setLoading(true)
      setError('')
      
      // Update user's team (should be within same dojo)
      await updateUser(user!.id, { 
        teamId: team.id
      })
      
      // Update auth context
      updateUserProfile({ 
        teamId: team.id,
        teamName: team.name
      })
      
      setSwitchingTeam(false)
      setTeamSearchQuery('')
      setTeamSuggestions([])
      setSuccess(`Successfully switched to ${team.name}`)
    } catch (error) {
      console.error('Failed to switch team:', error)
      setError('Failed to switch team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelTeamSwitch = () => {
    setSwitchingTeam(false)
    setTeamSearchQuery('')
    setTeamSuggestions([])
    setShowTeamSwitchSuggestions(false)
    setError('')
  }

  // Handle member reordering
  const handleMoveMember = async (teamId: string, memberId: string, direction: 'up' | 'down') => {
    const team = userTeams.find(t => t.id === teamId)
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
    } catch (error) {
      console.error('Failed to reorder team members:', error)
      setError('Failed to reorder team members. Please try again.')
    }
  }

  // Handle drag and drop for members
  const handleMemberDragStart = (e: React.DragEvent, member: any) => {
    setDraggedMember(member)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleMemberDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleMemberDrop = async (e: React.DragEvent, targetMember: any, teamId: string) => {
    e.preventDefault()
    if (!draggedMember || draggedMember.id === targetMember.id) {
      setDraggedMember(null)
      return
    }

    try {
      const team = userTeams.find(t => t.id === teamId)
      if (!team || !team.players) return

      const draggedIndex = team.players.findIndex((p: any) => p.id === draggedMember.id)
      const targetIndex = team.players.findIndex((p: any) => p.id === targetMember.id)
      
      if (draggedIndex === -1 || targetIndex === -1) return

      // Create new players array with reordered members
      const newPlayers = [...team.players]
      const draggedPlayer = newPlayers.splice(draggedIndex, 1)[0]
      newPlayers.splice(targetIndex, 0, draggedPlayer)
      
      await updateTeam(teamId, { players: newPlayers })
    } catch (error) {
      console.error('Failed to reorder team members:', error)
      setError('Failed to reorder team members. Please try again.')
    } finally {
      setDraggedMember(null)
    }
  }

  const handleMemberDragEnd = () => {
    setDraggedMember(null)
  }

  // Save logos
  const handleSave = async () => {
    if (!userDojo) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Update dojo logo
      const updatedDojo = { ...userDojo, logo: dojoLogo }
      const updatedDojos = dojos.map(d => d.id === userDojo.id ? updatedDojo : d)
      localStorage.setItem('dojos', JSON.stringify(updatedDojos))

      // Update team logos
      const updatedTeams = teams.map(team => {
        if (team.dojoId === userDojo.id && teamLogos[team.id] !== undefined) {
          return { ...team, logo: teamLogos[team.id] }
        }
        return team
      })
      localStorage.setItem('teams', JSON.stringify(updatedTeams))

      setSuccess('Logos updated successfully!')
      
      // Reload page data to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError('Failed to save logos. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle creating a new dojo
  const handleCreateDojo = async () => {
    // Check admin permission
    if (user?.role !== 'admin') {
      setError('Only administrators can create new dojos')
      return
    }
    
    if (!newDojoName.trim() || !newDojoLocation.trim()) {
      setError('Please fill in all dojo fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const newDojo = await addDojo(newDojoName.trim(), newDojoLocation.trim())
      
      setSuccess(`Dojo "${newDojo.name}" created successfully with auto-generated logo!`)
      setNewDojoName('')
      setNewDojoLocation('')
      setShowCreateDojo(false)
    } catch (err) {
      setError('Failed to create dojo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle creating a new team
  const handleCreateTeam = async () => {
    // Check admin permission
    if (user?.role !== 'admin') {
      setError('Only administrators can create new teams')
      return
    }
    
    if (!newTeamName.trim()) {
      setError('Please enter a team name')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const newTeam = await addTeam(newTeamName.trim(), userDojo.id)
      
      setSuccess(`Team "${newTeam.name}" created successfully with auto-generated logo!`)
      setNewTeamName('')
      setShowCreateTeam(false)
    } catch (err) {
      setError('Failed to create team. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !userDojo) {
    return (
      <div className="card p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
          No Dojo Access
        </h3>
        <p className="text-body-medium text-gray-600">
          You need to be registered with a dojo to manage logos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-headline-large font-bold text-gray-900 mb-2">
          Dojo & Team Management
        </h2>
        <p className="text-body-large text-gray-600">
          Manage your dojo and teams - click on cards to edit
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-5 h-5 text-green-600 mr-3">✓</div>
          <p className="text-body-medium text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-body-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dojo Card */}
        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setEditingDojo(true)}
          title="Click to edit dojo"
        >
          <div className="flex items-center mb-4">
            {/* Dojo Logo */}
            {userDojo.logo ? (
              <img
                src={userDojo.logo}
                alt={`${userDojo.name} logo`}
                className="w-12 h-12 rounded-lg object-cover border-2 border-primary-200 mr-3 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-title-medium font-semibold text-gray-900 truncate">
                {userDojo.name}
              </h3>
              <p className="text-body-small text-gray-500">
                {userDojo.location || 'No location specified'}
              </p>
            </div>
          </div>

          {/* Switch Dojo Button */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-body-small text-gray-600">Your Dojo</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleStartDojoSwitch()
              }}
              className="text-blue-600 hover:text-blue-700 p-2 rounded"
              title="Switch Dojo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Team Management */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h3 className="text-title-large font-semibold text-gray-900">
                  Team Management
                </h3>
                <p className="text-body-medium text-gray-600">
                  {userTeams.length} team{userTeams.length !== 1 ? 's' : ''} • Switch teams or manage logos
                </p>
              </div>
            </div>
            {user?.teamId && !switchingTeam && (
              <button
                onClick={handleStartTeamSwitch}
                className="text-blue-600 hover:text-blue-700 p-2 rounded"
                title="Switch Team"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Team Switching Interface */}
          {switchingTeam && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
              <h4 className="text-title-medium font-medium text-gray-900 mb-3">Switch to a different team</h4>
              <div className="relative">
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click events
                    setTimeout(() => setShowTeamSwitchSuggestions(false), 150)
                  }}
                  onClick={() => {
                    setShowTeamSwitchSuggestions(true)
                  }}
                  placeholder="Search for teams in your dojo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {showTeamSwitchSuggestions && teamSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {teamSuggestions.map((team) => {
                      const memberCount = team.players?.length || 0
                      const isFull = memberCount >= 7
                      
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleTeamSelect(team)}
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
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={handleCancelTeamSwitch}
                  className="btn-outlined"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {userTeams.map((team) => (
              <div 
                key={team.id} 
                className="card p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStartTeamEdit(team)}
                title="Click to edit team"
              >
                {/* Team Header */}
                <div className="flex items-center mb-3">
                  {/* Team Logo */}
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-accent-200 mr-3 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-accent-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Users className="w-5 h-5 text-accent-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-title-small font-semibold text-gray-900 truncate">
                      {team.name}
                    </h4>
                    <p className="text-body-small text-gray-500">
                      {team.players?.length || 0} members
                    </p>
                  </div>
                </div>

                {/* Team Members */}
                {team.players && team.players.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-body-small font-medium text-gray-700">Members</h5>
                      {team.players.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setReorderingMembers(reorderingMembers === team.id ? null : team.id)
                          }}
                          className={`text-xs px-2 py-1 rounded ${reorderingMembers === team.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <GripVertical className="w-3 h-3 inline mr-1" />
                          {reorderingMembers === team.id ? 'Done' : 'Reorder'}
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {team.players.map((member: any, memberIndex: number) => (
                        <div 
                          key={member.id} 
                          className={`flex items-center justify-between text-body-small p-2 rounded ${
                            reorderingMembers === team.id 
                              ? 'cursor-move border border-gray-200 hover:border-primary-300' 
                              : ''
                          } ${
                            draggedMember?.id === member.id ? 'opacity-50' : ''
                          }`}
                          draggable={reorderingMembers === team.id}
                          onDragStart={(e) => handleMemberDragStart(e, member)}
                          onDragOver={handleMemberDragOver}
                          onDrop={(e) => handleMemberDrop(e, member, team.id)}
                          onDragEnd={handleMemberDragEnd}
                        >
                          <div className="flex items-center flex-1">
                            {reorderingMembers === team.id && (
                              <div className="flex flex-col mr-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMoveMember(team.id, member.id, 'up')
                                  }}
                                  disabled={memberIndex === 0}
                                  className={`p-0.5 rounded hover:bg-gray-100 ${memberIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMoveMember(team.id, member.id, 'down')
                                  }}
                                  disabled={memberIndex === team.players.length - 1}
                                  className={`p-0.5 rounded hover:bg-gray-100 ${memberIndex === team.players.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'}`}
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            {reorderingMembers === team.id && (
                              <span className="text-xs font-medium text-primary-600 mr-2 min-w-[20px]">
                                #{memberIndex + 1}
                              </span>
                            )}
                            <span className="text-gray-900 truncate">{member.fullName}</span>
                          </div>
                          <div className={getRankBadgeClass(member.kendoRank)}>
                            {member.kendoRank || 'Mudansha'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {userTeams.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body-medium text-gray-600">
                  No teams found for your dojo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation Forms - Admin Only */}
      {user.role === 'admin' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Dojo */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Plus className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-title-large font-semibold text-gray-900">
                    Create New Dojo
                  </h3>
                  <p className="text-body-medium text-gray-600">
                    Add a new dojo with auto-generated logo
                  </p>
                </div>
              </div>
            </div>

            {!showCreateDojo ? (
              <button
                onClick={() => setShowCreateDojo(true)}
                className="btn-outlined w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Dojo
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-label-medium text-gray-700 mb-2">
                    Dojo Name
                  </label>
                  <input
                    type="text"
                    value={newDojoName}
                    onChange={(e) => setNewDojoName(e.target.value)}
                    placeholder="Enter dojo name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-label-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newDojoLocation}
                    onChange={(e) => setNewDojoLocation(e.target.value)}
                    placeholder="Enter location (e.g., City, State)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateDojo}
                    disabled={loading}
                    className="btn-filled flex-1"
                  >
                    Create Dojo
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDojo(false)
                      setNewDojoName('')
                      setNewDojoLocation('')
                    }}
                    className="btn-outlined flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create New Team */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Plus className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-title-large font-semibold text-gray-900">
                    Create New Team
                  </h3>
                  <p className="text-body-medium text-gray-600">
                    Add a team to {userDojo.name} with auto-generated logo
                  </p>
                </div>
              </div>
            </div>

            {!showCreateTeam ? (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-outlined w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-label-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateTeam}
                    disabled={loading}
                    className="btn-filled flex-1"
                  >
                    Create Team
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateTeam(false)
                      setNewTeamName('')
                    }}
                    className="btn-outlined flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dojo Edit Modal */}
      {editingDojo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDojoEdit}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Edit Dojo
              </h3>
              <button
                onClick={handleCancelDojoEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveDojoEdit(); }} className="space-y-4">
              {/* Dojo Name */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Dojo Name
                </label>
                <input
                  type="text"
                  value={editDojoName}
                  onChange={(e) => setEditDojoName(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editDojoLocation}
                  onChange={(e) => setEditDojoLocation(e.target.value)}
                  className="input w-full"
                  placeholder="Enter dojo location"
                />
              </div>

              {/* Logo Management */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Dojo Logo
                </label>
                <LogoUpload
                  currentLogo={dojoLogo}
                  onLogoChange={handleDojoLogoChange}
                  label="Dojo Logo"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelDojoEdit}
                  className="btn-outlined"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Team Edit Modal */}
      {editingTeam && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelTeamEdit}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Edit Team
              </h3>
              <button
                onClick={handleCancelTeamEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTeamEdit(); }} className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="input w-full"
                  required
                />
              </div>

              {/* Logo Management */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-1">
                  Team Logo
                </label>
                <LogoUpload
                  currentLogo={teamLogos[editingTeam.id] || ''}
                  onLogoChange={(logo) => handleTeamLogoChange(editingTeam.id, logo)}
                  label="Team Logo"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelTeamEdit}
                  className="btn-outlined"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dojo Switching Modal */}
      {switchingDojo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDojoSwitch}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-medium font-semibold text-gray-900">
                Switch Dojo & Team
              </h3>
              <button
                onClick={handleCancelDojoSwitch}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Dojo Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-2">
                  Select New Dojo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dojoSearchQuery}
                    onChange={(e) => setDojoSearchQuery(e.target.value)}
                    onFocus={() => {
                      setShowDojoSuggestions(true)
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click events
                      setTimeout(() => setShowDojoSuggestions(false), 150)
                    }}
                    onClick={() => {
                      setShowDojoSuggestions(true)
                    }}
                    placeholder="Search for dojos..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                {selectedNewDojo && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-sm font-medium text-green-800">Selected: {selectedNewDojo.name}</div>
                    {selectedNewDojo.location && (
                      <div className="text-xs text-green-600">{selectedNewDojo.location}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-2">
                  Select Team <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (selectedNewDojo) {
                        setShowTeamSuggestions(true)
                        if (teamSearchQuery === '') {
                          setTeamSearchQuery('')
                        }
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click events
                      setTimeout(() => setShowTeamSuggestions(false), 150)
                    }}
                    onClick={() => {
                      if (selectedNewDojo) {
                        setShowTeamSuggestions(true)
                      }
                    }}
                    placeholder={selectedNewDojo ? `Search teams in ${selectedNewDojo.name}...` : "Select a dojo first"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!selectedNewDojo}
                  />
                  {showTeamSuggestions && teamSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {teamSuggestions.map((team) => {
                        const memberCount = team.players?.length || 0
                        const isFull = memberCount >= 7
                        
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
                {selectedNewTeam && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-sm font-medium text-green-800">Selected: {selectedNewTeam.name}</div>
                    <div className="text-xs text-green-600">
                      {selectedNewTeam.players?.length || 0}/7 members
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelDojoSwitch}
                className="btn-outlined"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDojoSwitch}
                disabled={!selectedNewDojo || !selectedNewTeam || loading}
                className="btn-primary"
              >
                {loading ? 'Switching...' : 'Confirm Switch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DojoManagement