import React, { useState, useMemo } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import SearchBar from '../components/SearchBar'
import { searchParticipants, getSearchSuggestions, highlightMatch } from '../utils/searchUtils'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Users, Trophy, Filter } from 'lucide-react'

/**
 * ParticipantsPage component - Shows participating teams organized by dojo
 * Displays detailed team member information with names and ranks
 */

const ParticipantsPage: React.FC = () => {
  const { tournament, teams, dojos, users } = useTournament()
  const [searchQuery, setSearchQuery] = useState('')

  // Perform search with memoization for performance
  const searchResults = useMemo(() => {
    return searchParticipants(dojos, teams, users, searchQuery)
  }, [dojos, teams, users, searchQuery])

  // Get search suggestions
  const suggestions = useMemo(() => {
    return getSearchSuggestions(dojos, teams, users, searchQuery)
  }, [dojos, teams, users, searchQuery])

  // Calculate total stats from search results
  const totalStats = useMemo(() => {
    const totalTeams = searchResults.reduce((sum, result) => sum + result.teams.length, 0)
    const totalParticipants = searchResults.reduce((sum, result) => 
      sum + result.teams.reduce((teamSum, team) => teamSum + team.players.length, 0), 0
    )
    return { totalTeams, totalParticipants, totalDojos: searchResults.length }
  }, [searchResults])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-display-medium font-bold text-gray-900 mb-4">
            Tournament Participants
          </h1>
          {tournament && (
            <p className="text-body-large text-gray-600">
              {tournament.name} - Complete list of participating teams and members
            </p>
          )}
        </div>

        {tournament ? (
          <div className="space-y-8">
            {/* Tournament Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="text-display-small font-bold text-primary-600">
                  {searchQuery ? totalStats.totalTeams : teams.length}
                </div>
                <div className="text-body-medium text-gray-600">
                  {searchQuery ? 'Matching Teams' : 'Teams Registered'}
                </div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-display-small font-bold text-accent-400">
                  {searchQuery ? totalStats.totalDojos : dojos.length}
                </div>
                <div className="text-body-medium text-gray-600">
                  {searchQuery ? 'Matching Dojos' : 'Participating Dojos'}
                </div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-display-small font-bold text-gray-700">
                  {searchQuery ? totalStats.totalParticipants : teams.reduce((total, team) => total + team.players.length, 0)}
                </div>
                <div className="text-body-medium text-gray-600">
                  {searchQuery ? 'Matching Participants' : 'Total Participants'}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="card p-6 overflow-visible">
              <div className="flex items-center mb-4">
                <Filter className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-title-large font-semibold text-gray-900">
                  Search Participants
                </h2>
              </div>
              <div className="relative z-50">
                <SearchBar
                  query={searchQuery}
                  onQueryChange={setSearchQuery}
                  suggestions={suggestions}
                  placeholder="Search by dojo, team, participant name, or rank (e.g., 'Goseikan', 'John', '3 Dan')..."
                />
              </div>
            </div>

            {/* Participating Teams by Dojo */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-title-large font-semibold text-gray-900">
                  {searchQuery ? 'Search Results' : 'Teams by Dojo'}
                </h2>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-body-small text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
              
              {/* No Results Message */}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
                    No matches found
                  </h3>
                  <p className="text-body-medium text-gray-600 mb-4">
                    Try searching with different keywords or check your spelling.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-text"
                  >
                    Show all participants
                  </button>
                </div>
              )}
              
              <div className="grid lg:grid-cols-2 gap-8">
                {searchResults.map((result) => {
                  const { dojo, teams: dojoTeams } = result
                  
                  return (
                    <div key={dojo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Dojo Header */}
                      <div className="bg-primary-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {/* Dojo Logo */}
                            {dojo.logo ? (
                              <img
                                src={dojo.logo}
                                alt={`${dojo.name} logo`}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-primary-200 mr-4"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary-200 rounded-lg flex items-center justify-center mr-4">
                                <Users className="w-6 h-6 text-primary-600" />
                              </div>
                            )}
                            <div>
                              <h3 
                                className="text-title-large font-semibold text-primary-900"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightMatch(dojo.name, searchQuery) 
                                }}
                              />
                              <p className="text-body-medium text-primary-700 mt-1">
                                {dojoTeams.length} team{dojoTeams.length !== 1 ? 's' : ''} • {dojoTeams.reduce((total, team) => total + team.players.length, 0)} participants
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-label-small text-primary-600 uppercase font-medium tracking-wide">
                              Dojo
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Teams */}
                      <div className="p-6">
                        <div className="grid gap-6">
                          {dojoTeams.map((team) => {
                            const teamMembers = team.players
                            
                            return (
                              <div key={team.id} className="bg-gray-50 rounded-lg p-5">
                                {/* Team Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center">
                                    {/* Team Logo */}
                                    {team.logo ? (
                                      <img
                                        src={team.logo}
                                        alt={`${team.name} logo`}
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 mr-3"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center mr-3">
                                        <Users className="w-5 h-5 text-gray-900" />
                                      </div>
                                    )}
                                    <div>
                                      <h4 
                                        className="text-title-medium font-semibold text-gray-900"
                                        dangerouslySetInnerHTML={{ 
                                          __html: highlightMatch(team.name, searchQuery) 
                                        }}
                                      />
                                      <p className="text-body-small text-gray-600">
                                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                  {team.seedRanking && (
                                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-label-small font-medium">
                                      Seed #{team.seedRanking}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Team Members */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {teamMembers.map((member) => (
                                    <div key={member.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <p 
                                            className="text-body-medium font-medium text-gray-900 truncate"
                                            dangerouslySetInnerHTML={{ 
                                              __html: highlightMatch(member.fullName, searchQuery) 
                                            }}
                                          />
                                          <div className="flex items-center mt-1">
                                            <div 
                                              className={getRankBadgeClass(member.kendoRank)}
                                              dangerouslySetInnerHTML={{ 
                                                __html: highlightMatch(member.kendoRank || 'Mudansha', searchQuery) 
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-headline-small font-semibold text-gray-900 mb-2">
              No Active Tournament
            </h3>
            <p className="text-body-large text-gray-600">
              There is currently no active tournament. Check back later for participant information.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantsPage