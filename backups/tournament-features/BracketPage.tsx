import React, { useState } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import BracketVisualization from '../components/BracketVisualization'
import DoubleEliminationBracket from '../components/DoubleEliminationBracket'
import MatchResultModal from '../components/MatchResultModal'
import { getTournamentProgress, updateStandings } from '../utils/tournamentLogic'
import { BracketMatch } from '../utils/doubleEliminationBracket'
import { Match, Team } from '../types'
import { Trophy, Users, Calendar, BarChart3 } from 'lucide-react'

/**
 * BracketPage component - Tournament bracket visualization
 * Shows current tournament bracket and match progression
 */

const BracketPage: React.FC = () => {
  const { tournament, teams, dojos, updateMatch, updateTournament } = useTournament()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate tournament progress
  const progress = tournament ? getTournamentProgress(tournament) : null

  // Handle seed stage match click for result reporting
  const handleSeedMatchClick = (match: Match) => {
    setSelectedMatch(match)
    setIsModalOpen(true)
  }

  // Handle main bracket match click for navigation
  const handleMainMatchClick = (match: BracketMatch) => {
    console.log('Main bracket match clicked:', match)
    // TODO: Navigate to match details or court view
  }

  // Handle match result save
  const handleMatchResultSave = async (matchId: string, winnerId: string, scores: { team1Wins: number, team2Wins: number, team1TotalPoints?: number, team2TotalPoints?: number, playerSets?: any[], status?: string, overtime?: any }) => {
    if (!tournament || !selectedMatch) return

    try {
      // Update the match with the result
      const updatedMatch: Match = {
        ...selectedMatch,
        status: (scores.status as any) || (winnerId ? 'completed' : 'in_progress'),
        winnerId,
        overtime: scores.overtime || selectedMatch.overtime,
        scores: {
          ...selectedMatch.scores,
          team1Wins: scores.team1Wins,
          team2Wins: scores.team2Wins,
          team1TotalPoints: scores.team1TotalPoints || scores.team1Wins,
          team2TotalPoints: scores.team2TotalPoints || scores.team2Wins,
          playerSets: scores.playerSets || []
        }
      }

      // Update match in context
      await updateMatch(updatedMatch)

      // Find the group this match belongs to and update standings
      const updatedGroups = tournament.seedGroups.map(group => {
        const matchInGroup = group.matches.find(m => m.id === matchId)
        if (matchInGroup) {
          // Update the match in the group
          const updatedMatches = group.matches.map(m => 
            m.id === matchId ? updatedMatch : m
          )
          
          // Only update standings if this is a newly completed match
          // Check if the original match was not completed but the updated match is
          const wasAlreadyCompleted = matchInGroup.status === 'completed'
          const isNowCompleted = updatedMatch.status === 'completed'
          
          let updatedStandings = group.standings
          if (!wasAlreadyCompleted && isNowCompleted) {
            // This is a newly completed match, update standings
            updatedStandings = updateStandings(group.standings, updatedMatch)
          } else if (wasAlreadyCompleted && isNowCompleted) {
            // Match was already completed - recalculate entire group standings to avoid duplicates
            // Reset all standings to 0 and recalculate from all completed matches
            const resetStandings = group.standings.map(s => ({
              ...s,
              wins: 0,
              losses: 0,
              points: 0,
              ranking: 0
            }))
            
            // Recalculate standings from all completed matches in the group
            updatedStandings = updatedMatches.reduce((standings, match) => {
              if (match.status === 'completed') {
                return updateStandings(standings, match)
              }
              return standings
            }, resetStandings)
          }
          
          return {
            ...group,
            matches: updatedMatches,
            standings: updatedStandings
          }
        }
        return group
      })

      // Update tournament with new groups
      const updatedTournament = {
        ...tournament,
        seedGroups: updatedGroups,
        updatedAt: new Date().toISOString()
      }

      updateTournament(updatedTournament)

    } catch (error) {
      console.error('Failed to save match result:', error)
      throw error
    }
  }

  // Get team by ID helper
  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(team => team.id === teamId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-display-medium font-bold text-gray-900 mb-4">
            Tournament Bracket
          </h1>
          {tournament && (
            <p className="text-body-large text-gray-600">
              {tournament.name} - {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)} Stage
            </p>
          )}
        </div>

        {tournament ? (
          <div className="space-y-8">
            {/* Tournament Status */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 text-primary-600 mr-3" />
                  <div>
                    <h2 className="text-title-large font-semibold text-gray-900">
                      Current Status
                    </h2>
                    <p className="text-body-medium text-gray-600">
                      Tournament is in {tournament.status} stage
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-label-large font-medium ${
                  tournament.status === 'registration' ? 'bg-blue-100 text-blue-800' :
                  tournament.status === 'seed' ? 'bg-yellow-100 text-yellow-800' :
                  tournament.status === 'main' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </div>
              </div>

              {/* Progress Bar */}
              {progress && progress.totalMatches > 0 && (
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-gray-500 mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-body-small text-gray-600 mb-1">
                      <span>Tournament Progress</span>
                      <span>{progress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-body-small text-gray-500 mt-1">
                      <span>{progress.completedMatches} completed</span>
                      <span>{progress.remainingMatches} remaining</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {tournament.status === 'registration' && (
              <div className="card p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
                  Registration Phase
                </h3>
                <p className="text-body-large text-gray-600 mb-6">
                  Tournament registration is currently open. The bracket will be generated once registration closes.
                </p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-display-small font-bold text-primary-600">
                      {teams.length}
                    </div>
                    <div className="text-body-medium text-gray-600">Teams Registered</div>
                  </div>
                  <div>
                    <div className="text-display-small font-bold text-accent-400">
                      {dojos.length}
                    </div>
                    <div className="text-body-medium text-gray-600">Participating Dojos</div>
                  </div>
                  <div>
                    <div className="text-display-small font-bold text-gray-700">
                      {tournament.courts.length}
                    </div>
                    <div className="text-body-medium text-gray-600">Available Courts</div>
                  </div>
                </div>
              </div>
            )}

            {/* Seed Stage Bracket */}
            {tournament.status === 'seed' && tournament.seedGroups.length > 0 && (
              <BracketVisualization
                groups={tournament.seedGroups}
                teams={teams}
                dojos={dojos}
                onMatchClick={handleSeedMatchClick}
              />
            )}

            {/* Main Stage Bracket */}
            {tournament.status === 'main' && tournament.mainBracket && (
              <DoubleEliminationBracket
                qualifiedTeams={teams.filter(team => team.seedRanking && team.seedRanking <= 2)}
                onMatchClick={handleMainMatchClick}
              />
            )}

          </div>
        ) : (
          <div className="card p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
              No Active Tournament
            </h3>
            <p className="text-body-large text-gray-600">
              There is currently no active tournament. Check back later for updates.
            </p>
          </div>
        )}

        {/* Match Result Modal */}
        {selectedMatch && (
          <MatchResultModal
            match={selectedMatch}
            team1={getTeamById(selectedMatch.team1Id)!}
            team2={getTeamById(selectedMatch.team2Id)!}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedMatch(null)
            }}
            onSave={handleMatchResultSave}
          />
        )}
      </div>
    </div>
  )
}

export default BracketPage