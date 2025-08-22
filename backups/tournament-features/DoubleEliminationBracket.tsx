import React from 'react'
import { Team } from '../types'
import { generateDoubleEliminationBracket, getBracketVisualizationData, BracketMatch } from '../utils/doubleEliminationBracket'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Trophy, Users, ArrowRight, Crown } from 'lucide-react'

/**
 * DoubleEliminationBracket component for visualizing main tournament bracket
 * Shows winners and losers brackets with match progression
 */

interface DoubleEliminationBracketProps {
  qualifiedTeams: Team[]
  onMatchClick?: (match: BracketMatch) => void
}

const DoubleEliminationBracket: React.FC<DoubleEliminationBracketProps> = ({
  qualifiedTeams,
  onMatchClick
}) => {
  // Generate bracket structure
  const bracket = generateDoubleEliminationBracket(qualifiedTeams)
  const visualData = getBracketVisualizationData(bracket)

  // Get match status styling
  const getMatchStatusStyling = (match: BracketMatch) => {
    switch (match.status) {
      case 'completed':
        return 'border-green-300 bg-green-50'
      case 'ready':
        return 'border-blue-300 bg-blue-50'
      case 'in_progress':
        return 'border-yellow-300 bg-yellow-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  // Get team display with rank
  const TeamDisplay: React.FC<{ team?: Team; isWinner?: boolean }> = ({ team, isWinner = false }) => {
    if (!team) {
      return (
        <div className="text-body-small text-gray-400 italic py-2">
          TBD
        </div>
      )
    }

    return (
      <div className={`py-2 px-3 rounded ${isWinner ? 'bg-green-100 border border-green-300' : ''}`}>
        <div className="text-body-small font-medium text-gray-900">
          {team.name}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={getRankBadgeClass('1 Dan')} style={{ fontSize: '10px', padding: '1px 4px' }}>
            Seed #{team.seedRanking}
          </span>
          {isWinner && <Crown className="w-3 h-3 text-green-600" />}
        </div>
      </div>
    )
  }

  // Render match component
  const MatchComponent: React.FC<{ match: BracketMatch; isVertical?: boolean }> = ({ 
    match, 
    isVertical = false 
  }) => (
    <div
      className={`border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow min-w-32 ${getMatchStatusStyling(match)}`}
      onClick={() => onMatchClick?.(match)}
    >
      <div className="text-center mb-2">
        <div className="text-body-small font-medium text-gray-700">
          {match.isWinnersBracket ? 'W' : 'L'}R{match.round}-{match.position}
        </div>
        {match.status === 'ready' && (
          <div className="text-xs text-blue-600 font-medium">Ready</div>
        )}
      </div>
      
      <div className={`space-y-1 ${isVertical ? 'min-h-24' : 'min-h-20'}`}>
        <TeamDisplay team={match.team1} isWinner={match.winner?.id === match.team1?.id} />
        <div className="text-center text-gray-400">
          <span className="text-xs">vs</span>
        </div>
        <TeamDisplay team={match.team2} isWinner={match.winner?.id === match.team2?.id} />
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Bracket Header */}
      <div className="text-center">
        <h2 className="text-headline-large font-bold text-gray-900 mb-2">
          Main Tournament Bracket
        </h2>
        <p className="text-body-large text-gray-600">
          Double elimination format • {qualifiedTeams.length} qualified teams
        </p>
      </div>

      {/* Bracket Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-title-large font-bold text-primary-600">
            {visualData.winnersRounds.length}
          </div>
          <div className="text-body-small text-gray-600">Winners Rounds</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-title-large font-bold text-amber-600">
            {visualData.losersRounds.length}
          </div>
          <div className="text-body-small text-gray-600">Losers Rounds</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-title-large font-bold text-green-600">
            {visualData.teamsRemaining}
          </div>
          <div className="text-body-small text-gray-600">Teams Remaining</div>
        </div>
      </div>

      {/* Winners Bracket */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Trophy className="w-6 h-6 text-primary-600 mr-3" />
          <h3 className="text-title-large font-semibold text-gray-900">
            Winners Bracket
          </h3>
        </div>
        
        <div className="space-y-6">
          {visualData.winnersRounds.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="space-y-4">
              <h4 className="text-title-medium font-medium text-gray-700">
                Round {roundIndex + 1}
                {roundIndex === visualData.winnersRounds.length - 1 && (
                  <span className="ml-2 text-body-small text-primary-600">(Winners Final)</span>
                )}
              </h4>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {roundMatches.map((match) => (
                  <MatchComponent key={match.id} match={match} />
                ))}
              </div>
              
              {roundIndex < visualData.winnersRounds.length - 1 && (
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Losers Bracket */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-amber-600 mr-3" />
          <h3 className="text-title-large font-semibold text-gray-900">
            Losers Bracket
          </h3>
        </div>
        
        <div className="space-y-6">
          {visualData.losersRounds.map((roundMatches, roundIndex) => (
            <div key={roundIndex} className="space-y-4">
              <h4 className="text-title-medium font-medium text-gray-700">
                Losers Round {roundIndex + 1}
                {roundIndex === visualData.losersRounds.length - 1 && (
                  <span className="ml-2 text-body-small text-amber-600">(Losers Final)</span>
                )}
              </h4>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {roundMatches.map((match) => (
                  <MatchComponent key={match.id} match={match} />
                ))}
              </div>
              
              {roundIndex < visualData.losersRounds.length - 1 && (
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grand Final */}
      <div className="card p-6">
        <div className="flex items-center justify-center mb-6">
          <Crown className="w-8 h-8 text-accent-400 mr-3" />
          <h3 className="text-headline-small font-bold text-gray-900">
            Grand Final
          </h3>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <MatchComponent match={visualData.grandFinal} isVertical />
            
            {visualData.grandFinal.status === 'completed' && visualData.grandFinal.winner && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent-400 text-gray-900 px-4 py-1 rounded-full text-body-small font-bold">
                  CHAMPION
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bracket Legend */}
      <div className="card p-4">
        <h4 className="text-title-medium font-medium text-gray-900 mb-3">
          Bracket Legend
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-body-small">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-300 bg-blue-50 rounded mr-2"></div>
              <span>Ready to play</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-yellow-300 bg-yellow-50 rounded mr-2"></div>
              <span>Match in progress</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-green-300 bg-green-50 rounded mr-2"></div>
              <span>Match completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-gray-300 bg-gray-50 rounded mr-2"></div>
              <span>Waiting for teams</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <h4 className="text-title-medium font-medium text-blue-900 mb-2">
          How Double Elimination Works
        </h4>
        <div className="text-body-small text-blue-800 space-y-1">
          <p>• <strong>Winners Bracket:</strong> Teams advance with wins, drop to losers bracket with losses</p>
          <p>• <strong>Losers Bracket:</strong> Teams get a second chance, but one loss eliminates them</p>
          <p>• <strong>Grand Final:</strong> Winners bracket champion vs losers bracket champion</p>
          <p>• <strong>Advantage:</strong> Winners bracket team only needs to win once in grand final</p>
        </div>
      </div>
    </div>
  )
}

export default DoubleEliminationBracket