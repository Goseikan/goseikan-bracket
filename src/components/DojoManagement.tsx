import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTournament } from '../contexts/TournamentContext'
import LogoUpload from './LogoUpload'
import { Building, Users, Save, AlertCircle, Plus } from 'lucide-react'

/**
 * DojoManagement component for managing dojo and team logos
 * Allows dojo members to upload and manage logos for their dojo and teams
 */

const DojoManagement: React.FC = () => {
  const { user } = useAuth()
  const { dojos, teams, getDojoById, getTeamsByDojoId, addDojo, addTeam } = useTournament()
  
  const [userDojo, setUserDojo] = useState<any>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [dojoLogo, setDojoLogo] = useState<string>('')
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // New dojo/team creation state
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
      
      const teamLogoMap: Record<string, string> = {}
      dojoTeams.forEach(team => {
        if (team.logo) {
          teamLogoMap[team.id] = team.logo
        }
      })
      setTeamLogos(teamLogoMap)
    }
  }, [user, dojos, teams])

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
    if (!newDojoName.trim() || !newDojoLocation.trim()) {
      setError('Please fill in all dojo fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const newDojo = addDojo(newDojoName.trim(), newDojoLocation.trim())
      
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
    if (!newTeamName.trim()) {
      setError('Please enter a team name')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const newTeam = addTeam(newTeamName.trim(), userDojo.id)
      
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
          Dojo & Team Logos
        </h2>
        <p className="text-body-large text-gray-600">
          Upload logos for {userDojo.name} and your teams
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
        {/* Dojo Logo */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Building className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h3 className="text-title-large font-semibold text-gray-900">
                Dojo Logo
              </h3>
              <p className="text-body-medium text-gray-600">
                {userDojo.name}
              </p>
            </div>
          </div>

          <LogoUpload
            currentLogo={dojoLogo}
            onLogoChange={handleDojoLogoChange}
            label="Dojo Logo"
            disabled={loading}
          />
        </div>

        {/* Team Logos */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h3 className="text-title-large font-semibold text-gray-900">
                Team Logos
              </h3>
              <p className="text-body-medium text-gray-600">
                {userTeams.length} team{userTeams.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {userTeams.map((team) => (
              <div key={team.id} className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
                <h4 className="text-title-medium font-medium text-gray-900 mb-4">
                  {team.name}
                </h4>
                <LogoUpload
                  currentLogo={teamLogos[team.id]}
                  onLogoChange={(logo) => handleTeamLogoChange(team.id, logo)}
                  label={`${team.name} Logo`}
                  disabled={loading}
                />
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

      {/* Creation Forms */}
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

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-filled px-8 py-3"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Save Logos
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default DojoManagement