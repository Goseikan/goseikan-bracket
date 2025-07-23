import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Clock } from 'lucide-react'

/**
 * SearchBar component with real-time search and suggestions
 * Supports autocomplete and search history
 */

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  suggestions?: string[]
  placeholder?: string
  showHistory?: boolean
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  suggestions = [],
  placeholder = "Search dojos, teams, participants, or ranks...",
  showHistory = true,
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tournament_search_history')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }, [])

  // Strip HTML tags from text
  const stripHtml = (html: string): string => {
    if (!html) return ''
    // First, decode any HTML entities and strip tags using DOM
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const text = tmp.textContent || tmp.innerText || ''
    // Also strip any remaining HTML-like patterns with regex as backup
    return text.replace(/<[^>]*>/g, '').trim()
  }

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return
    
    // Strip any HTML that might have been passed in
    const cleanQuery = stripHtml(searchQuery.trim())
    
    const newHistory = [
      cleanQuery,
      ...searchHistory.filter(item => item !== cleanQuery)
    ].slice(0, 10) // Keep only last 10 searches
    
    setSearchHistory(newHistory)
    localStorage.setItem('tournament_search_history', JSON.stringify(newHistory))
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onQueryChange(value)
    setShowSuggestions(value.length > 0)
  }

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveToHistory(query.trim())
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = stripHtml(suggestion)
    onQueryChange(cleanSuggestion)
    saveToHistory(cleanSuggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // Clear search
  const handleClear = () => {
    onQueryChange('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true)
    if (!query && showHistory && searchHistory.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setIsFocused(false)
        setShowSuggestions(false)
      }
    }, 150)
  }

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('tournament_search_history')
  }

  // Get suggestions to show
  const getSuggestionsToShow = () => {
    if (!showSuggestions) return []
    
    if (query.trim()) {
      // Show matching suggestions - clean them to remove any HTML
      const cleanSuggestions = suggestions.slice(0, 8).map(suggestion => stripHtml(suggestion))
      return cleanSuggestions
    } else if (showHistory && searchHistory.length > 0) {
      // Show search history when no query
      return searchHistory.slice(0, 5)
    }
    
    return []
  }

  const suggestionsToShow = getSuggestionsToShow()
  const showHistoryItems = !query.trim() && showHistory && searchHistory.length > 0

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`
              w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-all duration-200 text-body-medium
              ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            `}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {suggestionsToShow.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-64 overflow-y-auto"
        >
          {/* Search History Header */}
          {showHistoryItems && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center text-body-small text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Recent Searches
              </div>
              <button
                onClick={clearHistory}
                className="text-body-small text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Suggestions List */}
          <div className="py-1">
            {suggestionsToShow.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center"
              >
                {showHistoryItems ? (
                  <Clock className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                ) : (
                  <Search className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                )}
                <span className="text-body-medium text-gray-900 truncate">
                  {stripHtml(suggestion)}
                </span>
              </button>
            ))}
          </div>

          {/* No suggestions message */}
          {suggestions.length === 0 && query.trim() && (
            <div className="px-4 py-3 text-center text-body-medium text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar