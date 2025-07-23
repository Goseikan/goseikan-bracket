/**
 * Logo generation utilities for automatically creating default logos
 * Generates SVG logos similar to sample data when dojos/teams are created
 */

// Color palette for generating logos - matches sample data colors
const LOGO_COLORS = [
  '#4F46E5', // Indigo
  '#DC2626', // Red
  '#059669', // Green
  '#F59E0B', // Amber
  '#B91C1C', // Dark Red
  '#1D4ED8', // Blue
  '#C026D3', // Fuchsia
  '#14B8A6', // Teal
  '#EF4444', // Red
  '#6B7280', // Gray
  '#F97316', // Orange
  '#84CC16', // Lime
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#FBBF24', // Yellow
  '#BE185D'  // Pink-700
]

/**
 * Generate an abbreviation from a name
 * Takes the first letter of each word, max 4 characters
 */
export const generateAbbreviation = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4) // Limit to 4 characters max
}

/**
 * Get a deterministic color based on a string
 * Same input will always return the same color
 */
const getColorFromString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % LOGO_COLORS.length
  return LOGO_COLORS[colorIndex]
}

/**
 * Generate a default dojo logo
 * Creates a colored square with the dojo's abbreviation
 */
export const generateDojoLogo = (dojoName: string): string => {
  const abbreviation = generateAbbreviation(dojoName)
  const color = getColorFromString(dojoName)
  const encodedColor = encodeURIComponent(color)
  
  // Calculate font size based on abbreviation length
  const fontSize = abbreviation.length <= 2 ? '18' : 
                  abbreviation.length === 3 ? '16' : '14'
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>
    <rect width='100' height='100' fill='${color}'/>
    <text x='50' y='55' font-family='Arial' font-size='${fontSize}' font-weight='bold' text-anchor='middle' fill='white'>${abbreviation}</text>
  </svg>`
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Generate a default team logo
 * Creates a colored square with the team's abbreviation, different color from dojo
 */
export const generateTeamLogo = (teamName: string, dojoName: string): string => {
  // Create a unique identifier by combining team and dojo names
  const uniqueId = `${teamName}_${dojoName}`
  const abbreviation = generateAbbreviation(teamName)
  
  // Get a different color by modifying the hash calculation
  let hash = 0
  for (let i = 0; i < uniqueId.length; i++) {
    const char = uniqueId.charCodeAt(i)
    hash = ((hash << 7) - hash) + char + 42 // Add offset for teams
    hash = hash & hash
  }
  
  const colorIndex = Math.abs(hash) % LOGO_COLORS.length
  const color = LOGO_COLORS[colorIndex]
  
  // Calculate font size based on abbreviation length
  const fontSize = abbreviation.length <= 2 ? '16' : 
                  abbreviation.length === 3 ? '14' : '12'
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>
    <rect width='100' height='100' fill='${color}'/>
    <text x='50' y='55' font-family='Arial' font-size='${fontSize}' font-weight='bold' text-anchor='middle' fill='white'>${abbreviation}</text>
  </svg>`
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Generate a team logo with specific team letter suffix
 * For teams like "Dojo Name Team A", "Dojo Name Team B"
 */
export const generateTeamLogoWithSuffix = (
  dojoName: string, 
  teamSuffix: string = 'A'
): string => {
  const dojoAbbrev = generateAbbreviation(dojoName)
  const teamAbbrev = `${dojoAbbrev}${teamSuffix}`
  
  // Use dojo name + suffix for color generation
  const uniqueId = `${dojoName}_team_${teamSuffix}`
  let hash = 0
  for (let i = 0; i < uniqueId.length; i++) {
    const char = uniqueId.charCodeAt(i)
    hash = ((hash << 6) - hash) + char + 123 // Different offset for team suffixes
    hash = hash & hash
  }
  
  const colorIndex = Math.abs(hash) % LOGO_COLORS.length
  const color = LOGO_COLORS[colorIndex]
  
  // Adjust font size for team abbreviations
  const fontSize = teamAbbrev.length <= 3 ? '14' : '12'
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>
    <rect width='100' height='100' fill='${color}'/>
    <text x='50' y='55' font-family='Arial' font-size='${fontSize}' font-weight='bold' text-anchor='middle' fill='white'>${teamAbbrev}</text>
  </svg>`
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}