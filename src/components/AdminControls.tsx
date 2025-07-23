import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import { generateSeedGroups, advanceToMainStage } from '../utils/tournamentLogic'
import { Settings, Play, Trophy, Users, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * AdminControls component for tournament management
 * Allows admins to control tournament progression
 */

const AdminControls: React.FC = () => {
  const { tournament, teams, updateTournament } = useTournament()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleGenerateSeedGroups = async () => {
    if (!tournament) return

    setLoading(true)
    setMessage(null)

    try {
      // Generate 4 seed groups
      const seedGroups = generateSeedGroups(teams, 4)
      
      // Update tournament with seed groups and change status
      const updatedTournament = {
        ...tournament,
        status: 'seed' as const,
        seedGroups,
        updatedAt: new Date().toISOString()
      }

      // Save to localStorage
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const updatedTournaments = tournaments.map((t: any) =>
        t.id === tournament.id ? updatedTournament : t
      )
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments))

      // Update context
      updateTournament(updatedTournament)

      setMessage({
        type: 'success',
        text: `Successfully generated ${seedGroups.length} seed groups with ${seedGroups.reduce((total, group) => total + group.matches.length, 0)} matches`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to generate seed groups'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdvanceToMain = async () => {
    if (!tournament) return

    setLoading(true)
    setMessage(null)

    try {
      const updatedTournament = advanceToMainStage(tournament, tournament.seedGroups)
      
      // Save to localStorage
      const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]')
      const updatedTournaments = tournaments.map((t: any) =>
        t.id === tournament.id ? updatedTournament : t
      )
      localStorage.setItem('tournaments', JSON.stringify(updatedTournaments))

      // Update context
      updateTournament(updatedTournament)

      setMessage({
        type: 'success',
        text: 'Successfully advanced to main tournament stage'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to advance to main stage'
      })
    } finally {
      setLoading(false)
    }
  }

  const canGenerateSeeds = tournament?.status === 'registration' && teams.length >= 4
  const canAdvanceToMain = tournament?.status === 'seed' && tournament.seedGroups.length > 0
  const allSeedGroupsComplete = tournament?.seedGroups.every(group => 
    group.matches.every(match => match.status === 'completed')
  )

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-primary-600 mr-3" />
        <h2 className="text-title-large font-semibold text-gray-900">
          Tournament Controls
        </h2>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          )}
          <p className={`text-body-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Tournament Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-title-large font-bold text-gray-900">
              {teams.length}
            </div>
            <div className="text-body-small text-gray-600">Registered Teams</div>
          </div>
          <div>
            <div className={`text-title-large font-bold ${
              tournament?.status === 'registration' ? 'text-blue-600' :
              tournament?.status === 'seed' ? 'text-yellow-600' :
              tournament?.status === 'main' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {tournament?.status.toUpperCase()}
            </div>
            <div className="text-body-small text-gray-600">Current Stage</div>
          </div>
          <div>
            <div className="text-title-large font-bold text-gray-900">
              {tournament?.seedGroups.length || 0}
            </div>
            <div className="text-body-small text-gray-600">Seed Groups</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Generate Seed Groups */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <h3 className="text-title-medium font-medium text-gray-900">
                Generate Seed Groups
              </h3>
              <p className="text-body-small text-gray-600">
                Create round-robin groups for the seed stage
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateSeedGroups}
            disabled={!canGenerateSeeds || loading}
            className={`btn-filled ${!canGenerateSeeds ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Groups
              </>
            )}
          </button>
        </div>

        {/* Advance to Main Stage */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Trophy className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <h3 className="text-title-medium font-medium text-gray-900">
                Advance to Main Stage
              </h3>
              <p className="text-body-small text-gray-600">
                Start the double elimination bracket
              </p>
              {canAdvanceToMain && !allSeedGroupsComplete && (
                <p className="text-body-small text-amber-600 mt-1">
                  ⚠️ Not all seed matches are complete
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleAdvanceToMain}
            disabled={!canAdvanceToMain || loading}
            className={`btn-filled ${!canAdvanceToMain ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Advancing...
              </div>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Advance to Main
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-title-small font-medium text-blue-900 mb-2">
          Tournament Flow
        </h4>
        <ol className="text-body-small text-blue-800 space-y-1">
          <li>1. <strong>Registration:</strong> Teams register and join the tournament</li>
          <li>2. <strong>Generate Seed Groups:</strong> Create round-robin groups (prevents same-dojo conflicts)</li>
          <li>3. <strong>Seed Stage:</strong> Teams compete in their groups to determine rankings</li>
          <li>4. <strong>Advance to Main:</strong> Top teams from each group enter double elimination</li>
          <li>5. <strong>Main Stage:</strong> Double elimination bracket determines final rankings</li>
        </ol>
      </div>
    </div>
  )
}

export default AdminControls