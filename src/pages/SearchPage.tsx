import React, { useState, useMemo } from 'react'
import { useTournament } from '../contexts/TournamentContext'
import SearchBar from '../components/SearchBar'
import { searchParticipants, getSearchSuggestions, highlightMatch } from '../utils/searchUtils'
import { getRankBadgeClass } from '../utils/kendoRanks'
import { Users, Trophy, Search, MapPin, Building } from 'lucide-react'

/**
 * SearchPage component - Comprehensive search for dojos, teams, and members
 * Provides detailed search functionality across all tournament participants
 */

const SearchPage: React.FC = () => {
  const { teams, dojos, users } = useTournament()
  const [searchQuery, setSearchQuery] = useState('')

  // Perform search with memoization for performance
  const searchResults = useMemo(() => {
    if (searchQuery.trim() === '') {
      // Show all dojos with their teams when no search query
      return dojos.map(dojo => ({
        dojo,
        teams: teams.filter(team => team.dojoId === dojo.id),
        matchScore: 1,
        matchedFields: []
      }))
    }
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
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-display-medium font-bold text-gray-900 mb-4">
            Registrants Directory
          </h1>
          <p className="text-body-large text-gray-600">
            Browse all registered dojos, teams, and members
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            suggestions={suggestions}
            placeholder="Filter registrants by name, dojo, team, or rank..."
            className="w-full"
          />
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-headline-medium font-bold text-primary-600">
                    {totalStats.totalDojos}
                  </div>
                  <div className="text-body-medium text-gray-600">
                    {totalStats.totalDojos === 1 ? 'Dojo' : 'Dojos'} Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-headline-medium font-bold text-accent-600">
                    {totalStats.totalTeams}
                  </div>
                  <div className="text-body-medium text-gray-600">
                    {totalStats.totalTeams === 1 ? 'Team' : 'Teams'} Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-headline-medium font-bold text-green-600">
                    {totalStats.totalParticipants}
                  </div>
                  <div className="text-body-medium text-gray-600">
                    {totalStats.totalParticipants === 1 ? 'Member' : 'Members'} Found
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-8">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
                <div key={result.dojo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Dojo Header */}
                  <div className="bg-primary-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center">
                      {result.dojo.logo ? (
                        <img
                          src={result.dojo.logo}
                          alt={`${result.dojo.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-primary-200 mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-200 rounded-lg flex items-center justify-center mr-4">
                          <Building className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-title-large font-semibold text-gray-900">
                          {result.dojo.name}
                        </h2>
                        {result.dojo.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-body-medium text-gray-600">
                              {result.dojo.location}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-body-small text-gray-500">
                          {result.teams.length} {result.teams.length === 1 ? 'team' : 'teams'}
                        </div>
                        <div className="text-body-small text-gray-500">
                          {result.teams.reduce((sum, team) => sum + team.players.length, 0)} members
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="p-6">
                    <div className="grid gap-6">
                      {result.teams.map((team) => (
                        <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                          {/* Team Header */}
                          <div className="flex items-center mb-4">
                            {team.logo ? (
                              <img
                                src={team.logo}
                                alt={`${team.name} logo`}
                                className="w-10 h-10 rounded-lg object-cover border-2 border-accent-200 mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-accent-200 rounded-lg flex items-center justify-center mr-3">
                                <Trophy className="w-5 h-5 text-accent-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-title-medium font-semibold text-gray-900">
                                {team.name}
                              </h3>
                              <p className="text-body-small text-gray-500">
                                {team.players.length}/7 members
                              </p>
                            </div>
                            {team.seedRanking && (
                              <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-label-small font-medium">
                                Seed #{team.seedRanking}
                              </div>
                            )}
                          </div>

                          {/* Team Members */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {team.players.map((player, index) => (
                              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <p className="text-body-medium font-medium text-gray-900 truncate">
                                    {player.fullName}
                                  </p>
                                  <p className="text-body-small text-gray-600">
                                    Position {index + 1}
                                  </p>
                                </div>
                                <span className={getRankBadgeClass(player.kendoRank)}>
                                  {player.kendoRank}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-title-medium font-semibold text-gray-900 mb-2">
                No registrants found
              </h3>
              <p className="text-body-medium text-gray-600">
                Try adjusting your search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage