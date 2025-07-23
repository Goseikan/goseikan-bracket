import { User, Dojo, Team, Tournament, Court, KendoRank } from '../types'

/**
 * Sample data generator based on 2024 Michigan Cup tournament
 * Creates realistic tournament data with proper dojo/team structure
 */

// Sample data extracted from the tournament program
const SAMPLE_DOJOS_DATA = [
  {
    name: "Bloomington Normal Kendo Club",
    abbreviation: "BNKC",
    participants: [
      { name: "Joshua Rhodes", rank: "4 Dan" as KendoRank }
    ]
  },
  {
    name: "Cleveland Kendo Association", 
    abbreviation: "CKA",
    participants: [
      { name: "John Beaty", rank: "5 Dan" as KendoRank },
      { name: "Yudai Yamamoto", rank: "4 Dan" as KendoRank },
      { name: "Peter Lopez", rank: "3 Dan" as KendoRank },
      { name: "Philip Hughes", rank: "1 Dan" as KendoRank },
      { name: "Patrick Leary", rank: "1 Kyu" as KendoRank },
      { name: "Atlas Renwick-Cusma", rank: "5 Kyu" as KendoRank },
      { name: "Yifu Chen", rank: "Mudansha" as KendoRank },
      { name: "Allison Chatlos", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Columbus Kendo Club",
    abbreviation: "CKC", 
    participants: [
      { name: "Hinata Suwa", rank: "1 Dan" as KendoRank },
      { name: "Ayumu Suwa", rank: "1 Dan" as KendoRank },
      { name: "Katie Maynard", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Costa Mesa Kendo Dojo",
    abbreviation: "CMKD",
    participants: [
      { name: "Vishwaas Gangeddula", rank: "1 Dan" as KendoRank }
    ]
  },
  {
    name: "Detroit Kendo Dojo",
    abbreviation: "DKD",
    participants: [
      { name: "Hirotaka Yoshikawa", rank: "6 Dan" as KendoRank },
      { name: "Sayaka Minami", rank: "2 Dan" as KendoRank },
      { name: "Akihito Ohta", rank: "2 Dan" as KendoRank },
      { name: "Kotaro Kurita", rank: "2 Dan" as KendoRank },
      { name: "Jensen Masato Dahl", rank: "2 Dan" as KendoRank },
      { name: "Hinako Naritomi", rank: "1 Kyu" as KendoRank },
      { name: "Ryosei Yamada", rank: "1 Kyu" as KendoRank },
      { name: "Hyogo Naritomi", rank: "2 Kyu" as KendoRank },
      { name: "Shiho Kurita", rank: "2 Kyu" as KendoRank },
      { name: "Yu Fukuhara", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Goseikan",
    abbreviation: "GSK",
    participants: [
      { name: "Gordan Small", rank: "6 Dan" as KendoRank },
      { name: "Daniel Ahn", rank: "4 Dan" as KendoRank },
      { name: "Naoya Isobe", rank: "4 Dan" as KendoRank },
      { name: "Hemil Gonzalez", rank: "3 Dan" as KendoRank },
      { name: "John Lee", rank: "1 Dan" as KendoRank },
      { name: "Joe Lee", rank: "1 Dan" as KendoRank },
      { name: "Bryson Rawlings", rank: "2 Kyu" as KendoRank },
      { name: "Tyler Chen", rank: "3 Kyu" as KendoRank },
      { name: "Jordan N. Newell", rank: "3 Kyu" as KendoRank },
      { name: "Edward Soderberg", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Great Lakes Kendo Dojo",
    abbreviation: "GLKD",
    participants: [
      { name: "Robin Tanaka", rank: "7 Dan" as KendoRank },
      { name: "Takuya Manome", rank: "6 Dan" as KendoRank },
      { name: "Keiichiro Tsuji", rank: "5 Dan" as KendoRank },
      { name: "Phillip Karpowicz", rank: "4 Dan" as KendoRank },
      { name: "Emily Shinohara", rank: "3 Dan" as KendoRank },
      { name: "Hideo Imai", rank: "3 Dan" as KendoRank },
      { name: "Maki Mitsuya", rank: "3 Dan" as KendoRank },
      { name: "Brandon Shinnosuke Christ", rank: "1 Dan" as KendoRank },
      { name: "Kotaro Tanaka", rank: "1 Kyu" as KendoRank },
      { name: "Jonah Nguyen", rank: "2 Kyu" as KendoRank },
      { name: "Shuntaro Tanaka", rank: "2 Kyu" as KendoRank },
      { name: "Peyton Allard", rank: "2 Kyu" as KendoRank },
      { name: "Niko Tsuji", rank: "2 Kyu" as KendoRank },
      { name: "Liam Gilliland", rank: "3 Kyu" as KendoRank },
      { name: "Milo Gilliland", rank: "6 Kyu" as KendoRank },
      { name: "Takumi Manome", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Hampton Roads Kendo Dojo",
    abbreviation: "HRKD",
    participants: [
      { name: "Yong Back", rank: "4 Dan" as KendoRank }
    ]
  },
  {
    name: "JCCC Kendo Club",
    abbreviation: "JCCC",
    participants: [
      { name: "Ryo Tamaru", rank: "6 Dan" as KendoRank }
    ]
  },
  {
    name: "Koyokai",
    abbreviation: "KYK",
    participants: [
      { name: "Yutaro Matsuura", rank: "7 Dan" as KendoRank },
      { name: "Vlad Trusevich", rank: "4 Dan" as KendoRank },
      { name: "Amy Walker", rank: "3 Dan" as KendoRank },
      { name: "Sean Kelly", rank: "3 Dan" as KendoRank },
      { name: "Steve Walker", rank: "3 Dan" as KendoRank },
      { name: "Josh Elmblad", rank: "3 Dan" as KendoRank },
      { name: "Eric Collins", rank: "3 Dan" as KendoRank },
      { name: "Christopher Choi", rank: "2 Dan" as KendoRank },
      { name: "Taichi Matsuura", rank: "1 Dan" as KendoRank },
      { name: "Anton Trusevich", rank: "1 Kyu" as KendoRank },
      { name: "Matt MacLaren", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Macomb Kendo Dojo",
    abbreviation: "MKD", 
    participants: [
      { name: "Travis Hill", rank: "6 Dan" as KendoRank },
      { name: "Mimi Hill", rank: "5 Dan" as KendoRank },
      { name: "Tim Minowa", rank: "5 Dan" as KendoRank },
      { name: "Daichi Sakuma", rank: "4 Dan" as KendoRank },
      { name: "Ryan Choi", rank: "3 Dan" as KendoRank },
      { name: "Kouta Horiguchi", rank: "2 Dan" as KendoRank },
      { name: "Kiki Choi", rank: "2 Dan" as KendoRank },
      { name: "Sarah Chung", rank: "2 Dan" as KendoRank },
      { name: "Michael Krueger", rank: "Mudansha" as KendoRank },
      { name: "Shane Dasine", rank: "Mudansha" as KendoRank },
      { name: "Yung Jen Cheng", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Miami Valley Kendo Club",
    abbreviation: "MVKC",
    participants: [
      { name: "Christopher Robert Glyptis", rank: "3 Kyu" as KendoRank }
    ]
  },
  {
    name: "Milwaukee Kendo Club", 
    abbreviation: "MKC",
    participants: [
      { name: "Erik Hancock", rank: "3 Dan" as KendoRank },
      { name: "Anwar Jackson", rank: "1 Dan" as KendoRank }
    ]
  },
  {
    name: "Minnehaha Kendo Dojo",
    abbreviation: "MHD",
    participants: [
      { name: "Travis Stronach", rank: "6 Dan" as KendoRank },
      { name: "Xue Lin", rank: "2 Dan" as KendoRank }
    ]
  },
  {
    name: "Michigan State University Kendo Club",
    abbreviation: "MSU",
    participants: [
      { name: "Takuma Miura", rank: "5 Dan" as KendoRank },
      { name: "PJ Smaza", rank: "Mudansha" as KendoRank },
      { name: "Justyce Yin", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Ohio State University Kendo Club",
    abbreviation: "OSU",
    participants: [
      { name: "Maya Perlmutter", rank: "2 Dan" as KendoRank },
      { name: "Bakusa Conteh", rank: "1 Dan" as KendoRank },
      { name: "Nathan Henderson", rank: "Mudansha" as KendoRank },
      { name: "Nicholas Sansoterra", rank: "Mudansha" as KendoRank },
      { name: "Derek Chen", rank: "Mudansha" as KendoRank }
    ]
  },
  {
    name: "Pittsburgh Kenyukai",
    abbreviation: "PK",
    participants: [
      { name: "Taejin Jeong", rank: "4 Dan" as KendoRank },
      { name: "Yuqing Chen", rank: "2 Dan" as KendoRank },
      { name: "Dong Yu", rank: "1 Dan" as KendoRank }
    ]
  },
  {
    name: "St. Louis Kendo",
    abbreviation: "STL",
    participants: [
      { name: "Mark Chao", rank: "4 Dan" as KendoRank },
      { name: "Efrem Taiga Nickel", rank: "3 Dan" as KendoRank },
      { name: "Linjie Bu", rank: "2 Dan" as KendoRank },
      { name: "Zhizhen Zhou", rank: "2 Dan" as KendoRank },
      { name: "Brandon Terrizzi", rank: "2 Dan" as KendoRank },
      { name: "Kouki Saathoff", rank: "2 Dan" as KendoRank }
    ]
  },
  {
    name: "Seishinkan",
    abbreviation: "SEI",
    participants: [
      { name: "Noriyuki Sakuma", rank: "6 Dan" as KendoRank },
      { name: "Jason Aubry", rank: "4 Dan" as KendoRank },
      { name: "Charlie Kondek", rank: "4 Dan" as KendoRank },
      { name: "Jason Engling", rank: "3 Dan" as KendoRank },
      { name: "Satoshi Horiguchi", rank: "2 Dan" as KendoRank },
      { name: "Sladjan Stojkovic", rank: "2 Dan" as KendoRank },
      { name: "Lingling Peng", rank: "1 Dan" as KendoRank },
      { name: "Alexander J Maynard", rank: "2 Kyu" as KendoRank }
    ]
  },
  {
    name: "Toronto Kendo Club",
    abbreviation: "TKC",
    participants: [
      { name: "Koichi Miyamoto", rank: "7 Dan" as KendoRank },
      { name: "Qidong Wang", rank: "3 Dan" as KendoRank },
      { name: "Taketoshi Miyamoto", rank: "2 Dan" as KendoRank },
      { name: "Yona Kushima", rank: "2 Dan" as KendoRank }
    ]
  },
  {
    name: "University of Michigan Kendo Club",
    abbreviation: "UM",
    participants: [
      { name: "Joseph Ponchart", rank: "4 Dan" as KendoRank },
      { name: "Archie Geng", rank: "3 Dan" as KendoRank },
      { name: "Raymond Wen", rank: "3 Dan" as KendoRank },
      { name: "Nathan Choi", rank: "3 Dan" as KendoRank },
      { name: "Chris Lee", rank: "Mudansha" as KendoRank }
    ]
  }
]

/**
 * Generate sample teams for each dojo
 * Creates 2-3 teams per dojo with 7 players each where possible
 */
const generateTeamsForDojo = (dojoData: typeof SAMPLE_DOJOS_DATA[0], dojoId: string): Team[] => {
  const teams: Team[] = []
  const participants = dojoData.participants
  
  // Calculate number of teams needed (aim for 5-7 players per team)
  const teamCount = Math.max(1, Math.ceil(participants.length / 7))
  
  for (let i = 0; i < teamCount; i++) {
    const teamName = teamCount === 1 
      ? `${dojoData.name} Main Team`
      : `${dojoData.name} Team ${String.fromCharCode(65 + i)}` // A, B, C, etc.
    
    const startIndex = i * 7
    const endIndex = Math.min(startIndex + 7, participants.length)
    const teamParticipants = participants.slice(startIndex, endIndex)
    
    teams.push({
      id: `team_${dojoId}_${i + 1}`,
      name: teamName,
      dojoId,
      players: [], // Will be populated in assignUsersToTeams
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  
  return teams
}

/**
 * Generate sample users from tournament data
 */
const generateUsers = (): User[] => {
  const users: User[] = []
  
  // Add admin user
  users.push({
    id: 'admin_1',
    fullName: 'Tournament Administrator',
    email: 'admin@tournament.com',
    password: 'admin123', // In real app, this would be hashed
    dateOfBirth: '1985-01-01',
    dojoId: 'dojo_macomb',
    teamId: 'team_dojo_macomb_1',
    role: 'admin',
    kendoRank: '6 Dan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  // Generate users from sample data
  SAMPLE_DOJOS_DATA.forEach((dojoData, dojoIndex) => {
    const dojoId = `dojo_${dojoData.name.toLowerCase().replace(/\s+/g, '_')}`
    
    dojoData.participants.forEach((participant, participantIndex) => {
      const userId = `user_${participant.name.replace(/\s+/g, '_').toLowerCase()}`
      
      // Generate realistic birth dates based on rank
      let birthYear = 1990
      if (participant.rank.includes('Dan')) {
        const danLevel = parseInt(participant.rank.charAt(0))
        birthYear = 1980 - (danLevel * 2) // Higher dans are typically older
      } else if (participant.rank.includes('Kyu')) {
        birthYear = 1995 + Math.floor(Math.random() * 10) // Kyu ranks are typically younger
      } else {
        birthYear = 2000 + Math.floor(Math.random() * 5) // Mudansha are typically youngest
      }
      
      const email = `${participant.name.toLowerCase().replace(/\s+/g, '.')}@${dojoData.abbreviation.toLowerCase()}.com`
      
      users.push({
        id: userId,
        fullName: participant.name,
        email,
        password: 'password123', // In real app, this would be hashed
        dateOfBirth: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        dojoId,
        teamId: '', // Will be assigned when teams are created
        role: 'participant',
        kendoRank: participant.rank,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    })
  })
  
  return users
}

/**
 * Generate sample dojos
 */
const generateDojos = (): Dojo[] => {
  return SAMPLE_DOJOS_DATA.map((dojoData, index) => ({
    id: `dojo_${dojoData.name.toLowerCase().replace(/\s+/g, '_')}`,
    name: dojoData.name,
    location: `${dojoData.name.split(' ')[0]}, USA`, // Approximate location
    teams: [], // Will be populated later
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
}

/**
 * Generate sample teams
 */
const generateTeams = (dojos: Dojo[]): Team[] => {
  const allTeams: Team[] = []
  
  dojos.forEach((dojo) => {
    const dojoData = SAMPLE_DOJOS_DATA.find(d => d.name === dojo.name)
    if (dojoData) {
      const teams = generateTeamsForDojo(dojoData, dojo.id)
      allTeams.push(...teams)
    }
  })
  
  return allTeams
}

/**
 * Generate sample courts
 */
const generateCourts = (): Court[] => {
  return [
    {
      id: 'court_a',
      name: 'Court A',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'court_b', 
      name: 'Court B',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'court_c',
      name: 'Court C', 
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'court_d',
      name: 'Court D',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

/**
 * Generate sample tournament
 */
const generateTournament = (): Tournament => {
  return {
    id: 'tournament_2024_michigan_cup',
    name: '2024 Michigan Cup Kendo Tournament',
    description: 'Annual kendo tournament featuring individual and team competitions',
    status: 'registration',
    isActive: true,
    maxParticipants: 200,
    seedGroups: [],
    mainBracket: {
      id: 'main_bracket',
      type: 'double_elimination',
      rounds: []
    },
    courts: [
      { id: 'court_a', name: 'Court A', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'court_b', name: 'Court B', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'court_c', name: 'Court C', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'court_d', name: 'Court D', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Assign users to teams and update team player lists
 */
const assignUsersToTeams = (users: User[], teams: Team[]): { users: User[], teams: Team[] } => {
  const updatedUsers = [...users]
  const updatedTeams = [...teams]
  
  // Create a map of team ID to team for quick lookup
  const teamMap = new Map(updatedTeams.map(team => [team.id, team]))
  
  // Assign each user to the appropriate team
  updatedUsers.forEach(user => {
    if (user.role === 'admin') return // Skip admin users
    
    // Find the first team for this user's dojo
    const userTeam = updatedTeams.find(team => 
      team.dojoId === user.dojoId && team.players.length < 7
    )
    
    if (userTeam) {
      user.teamId = userTeam.id
      if (!userTeam.players.some((p: any) => p.id === user.id)) {
        userTeam.players.push(user)
      }
    }
  })
  
  return { users: updatedUsers, teams: updatedTeams }
}

/**
 * Generate all sample data for the tournament
 */
export const generateSampleTournamentData = () => {
  const dojos = generateDojos()
  const teams = generateTeams(dojos)
  const users = generateUsers()
  const courts = generateCourts()
  const tournament = generateTournament()
  
  // Assign users to teams
  const { users: assignedUsers, teams: updatedTeams } = assignUsersToTeams(users, teams)
  
  return {
    dojos,
    teams: updatedTeams,
    users: assignedUsers,
    courts,
    tournaments: [tournament],
    matches: []
  }
}

/**
 * Initialize sample data in localStorage
 */
export const initializeSampleData = (): void => {
  // Only initialize if no data exists
  if (!localStorage.getItem('users')) {
    const sampleData = generateSampleTournamentData()
    
    localStorage.setItem('users', JSON.stringify(sampleData.users))
    localStorage.setItem('dojos', JSON.stringify(sampleData.dojos))
    localStorage.setItem('teams', JSON.stringify(sampleData.teams))
    localStorage.setItem('courts', JSON.stringify(sampleData.courts))
    localStorage.setItem('tournaments', JSON.stringify(sampleData.tournaments))
    localStorage.setItem('matches', JSON.stringify(sampleData.matches))
    
    console.log('Sample tournament data initialized:', {
      users: sampleData.users.length,
      dojos: sampleData.dojos.length, 
      teams: sampleData.teams.length,
      courts: sampleData.courts.length
    })
  }
}