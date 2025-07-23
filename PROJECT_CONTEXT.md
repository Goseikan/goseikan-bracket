# Goseikan Kendo Tournament Management System - Project Context

## 🏆 Project Overview
A complete React-based kendo tournament management application built with TypeScript, Tailwind CSS, and Material Design 3. Designed for managing traditional kendo tournaments with authentic rules, real-time scoring, and comprehensive bracket management.

## 🎯 Key Requirements & Design Decisions

### **Tournament Structure**
- **Seed Stage**: Round-robin groups (4 groups) to avoid same-dojo conflicts
- **Main Stage**: Double elimination bracket with qualified teams
- **Authentic Kendo Rules**: All 7 sets completed regardless of early wins
- **Team Structure**: 7-player teams with forfeit/draw logic for incomplete teams

### **Scoring System**
- **Kendo Actions**: men, kote, tsuki, do, hansoku (all linked to specific players)
- **Two-Step Scoring**: Select action type → Select player who performed it
- **Time-Based Sets**: Individual sets are first-to-2-points OR time limit winner (3 minutes default)
- **Real-Time Timers**: Countdown timers with start/pause controls for each set
- **Point Tracking**: Live point counting for each player in active sets
- **Set Results**: win, draw, forfeit, time_expired (automatic when time runs out)
- **Match Winner Determination**: Uses authentic kendo hierarchy (set wins > total points > overtime)
- **Overtime System**: Encho-sen when matches end 3-3 (sudden death, first point wins)

### **User Roles & Authentication**
- **Participants**: Register with dojo/team, view dashboards, access public displays
- **Admins**: Full tournament management, court assignment, real-time scoring
- **Public**: Access to spectator displays without authentication

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom Material Design 3 theme
- **React Router** for navigation and protected routes
- **Context API** for global state management (Auth + Tournament)
- **Lucide React** for consistent iconography

### **Styling & Design**
- **Material Design 3** principles throughout
- **Brand Colors**: Primary #090666 (deep blue), Accent #ecb517 (gold)
- **Mobile-First**: Responsive design optimized for tablets and phones
- **WCAG 2.1 AA** compliance for accessibility

### **Data Storage**
- **LocalStorage** for development/demo (easily swappable for backend)
- **Structured Types** ready for database integration
- **Sample Data** based on real 2024 Michigan Cup tournament

## 📁 Key File Structure

```
src/
├── components/           # Reusable UI components
│   ├── AdminControls.tsx      # Tournament progression controls
│   ├── BracketVisualization.tsx # Seed stage bracket display
│   ├── CourtManagement.tsx    # Admin court assignment interface
│   ├── DoubleEliminationBracket.tsx # Main bracket visualization
│   └── Navigation.tsx         # Main navigation component
├── contexts/            # Global state management
│   ├── AuthContext.tsx        # User authentication & sessions
│   └── TournamentContext.tsx  # Tournament data & operations
├── pages/               # Route-level components
│   ├── AdminPage.tsx          # Admin dashboard with tabbed interface
│   ├── BracketPage.tsx        # Public bracket viewing
│   ├── CourtPage.tsx          # Individual court management & time-based scoring
│   ├── DashboardPage.tsx      # User personal dashboard
│   ├── PublicCourtPage.tsx    # Spectator display with live timers
│   └── RegisterPage.tsx       # User registration with dojo selection
├── types/index.ts       # Complete TypeScript definitions
├── utils/               # Business logic utilities
│   ├── doubleEliminationBracket.ts # Bracket generation algorithms
│   ├── kendoMatchLogic.ts     # Authentic kendo scoring and timing logic
│   ├── kendoRanks.ts          # Rank system utilities
│   ├── matchRules.ts          # Forfeit/draw logic
│   ├── sampleData.ts          # Michigan Cup tournament data
│   └── tournamentLogic.ts     # Seed group generation
└── index.css           # Material Design 3 theme implementation
```

## 🎮 Core Features Implemented

### **1. User Management**
- Registration with dojo selection and kendo rank
- Authentication with role-based access (participant/admin)
- Personal dashboards showing team structure and rank hierarchy
- Automatic team assignment and dojo member management

### **2. Tournament Bracket System**
- **Seed Groups**: 4 round-robin groups avoiding same-dojo conflicts
- **Bracket Visualization**: Interactive displays with match progression
- **Double Elimination**: Winners/losers bracket with proper seeding
- **Real-time Updates**: Live bracket progression and standings

### **3. Court Management System**
- **Admin Interface**: Create courts, assign matches, manage progression
- **Individual Court Pages**: Full scoring interface with kendo actions
- **Public Displays**: Spectator-friendly screens with live updates
- **Two-Step Scoring**: Action selection → Player selection for accuracy
- **Overtime Management**: Complete encho-sen system with player selection

### **4. Authentic Kendo Rules**
- **Complete Matches**: All 7 sets played regardless of early wins
- **Individual Tracking**: Every action linked to specific player
- **Time-Based Sets**: Each set has 3-minute time limit with real-time countdown
- **Set Completion**: First-to-2-points OR most points when time expires
- **Point Counting**: Only men, kote, tsuki, do count as scoring points (not hansoku)
- **Match Winner Hierarchy**: 1) Most set wins, 2) Most total points, 3) Overtime
- **Result Types**: win, draw, forfeit, time_expired properly handled
- **Overtime System**: Encho-sen for tied matches (3-3 after 7 sets)
- **Sudden Death**: First valid point (men, kote, tsuki, do) wins in overtime
- **Player Selection**: Teams choose their overtime representative
- **Rank System**: Full kyu/dan hierarchy with sorting utilities

## 🏅 Kendo-Specific Implementation Details

### **Team Structure**
- 7 players per team (positions 1-7)
- Automatic forfeit logic for incomplete teams
- Rank-based sorting within dojos (highest Dan first)
- Support for Mudansha (no formal rank) through 10 Dan

### **Match Scoring**
```typescript
// Each action tracks the specific player
interface ScoringAction {
  id: string
  type: 'men' | 'kote' | 'tsuki' | 'do' | 'hansoku'
  playerId: string  // Links to specific player
  timestamp: string
  confirmed: boolean
}

// Enhanced set results with time and point tracking
interface PlayerSetResult {
  setNumber: number
  team1PlayerId?: string
  team2PlayerId?: string
  winnerId?: string
  result: 'win' | 'loss' | 'draw' | 'forfeit' | 'time_expired'
  actions: ScoringAction[]
  team1Points: number // Real-time point tracking
  team2Points: number // Real-time point tracking
  timeLimit: number   // Set time limit in seconds
  timeRemaining: number // Current time remaining
  startedAt?: string
  completedAt?: string
}

// Enhanced match scores with total point tracking
interface MatchScore {
  team1Wins: number
  team2Wins: number
  team1TotalPoints: number // Sum of all points across sets
  team2TotalPoints: number // Sum of all points across sets
  playerSets: PlayerSetResult[]
  currentBattle?: CurrentBattle
}

// Overtime data for encho-sen
interface OvertimeData {
  team1PlayerId: string
  team2PlayerId: string
  actions: ScoringAction[]
  winnerId?: string
  startedAt: string
  completedAt?: string
}
```

### **Overtime System Implementation**
The overtime (encho-sen) system follows authentic kendo rules for resolving tied matches:

#### **Trigger Conditions**
- Match reaches 3-3 tie after all 7 sets completed
- System automatically transitions to overtime status
- No time limits - continues until first valid point

#### **Two-Phase Process**
1. **Player Selection Phase**:
   ```typescript
   // Admin selects one player from each team
   interface OvertimePlayerSelection {
     team1PlayerId: string  // Chosen representative
     team2PlayerId: string  // Chosen representative
   }
   ```

2. **Scoring Phase**:
   ```typescript
   // Only valid scoring actions count (no hansoku)
   type OvertimeValidActions = 'men' | 'kote' | 'tsuki' | 'do'
   
   // First action immediately wins match
   const handleOvertimeScore = (playerId: string, action: OvertimeValidActions) => {
     match.winnerId = getTeamIdByPlayerId(playerId)
     match.status = 'completed'
     match.overtime.completedAt = timestamp
   }
   ```

#### **UI/UX Features**
- **Visual Identity**: Yellow theme with lightning bolt icons
- **Player Selection**: Full team roster with rank display
- **Action Interface**: Simplified to only valid overtime actions
- **Public Display**: Prominent overtime status with pulsing animations
- **Result Tracking**: Complete history of overtime progression

### **Tournament Flow**
1. **Registration**: Users join with dojo/team selection
2. **Team Formation**: Automatic assignment ensuring 7-player structure
3. **Seed Generation**: 4 groups created avoiding same-dojo conflicts
4. **Seed Matches**: Round-robin within groups for ranking
5. **Main Bracket**: Double elimination with qualified teams
6. **Real-time Scoring**: Court-by-court match management with overtime support
7. **Overtime Resolution**: Encho-sen for tied matches with player selection
8. **Final Rankings**: Complete tournament results and placements

## 🎨 Design System

### **Color Palette**
- **Primary**: #090666 (deep blue) - main UI elements, primary actions
- **Accent**: #ecb517 (gold) - highlights, secondary actions, success states
- **Neutrals**: Full grayscale palette for text and backgrounds
- **Status Colors**: Green (success), Yellow (pending), Red (errors/penalties)

### **Typography Scale** (Material Design 3)
- Display Large/Medium/Small for major headings
- Headline Large/Medium/Small for section headers  
- Title Large/Medium/Small for component titles
- Body Large/Medium/Small for content text
- Label Large/Medium/Small for UI labels

### **Component Patterns**
- **Cards**: Elevated surfaces with rounded corners and shadows
- **Buttons**: Filled, outlined, and text variants with consistent styling
- **Forms**: Input fields with proper validation and accessibility
- **Navigation**: Tab-based interfaces for complex admin functions

## 🔧 Development Notes

### **State Management Strategy**
- **AuthContext**: User authentication, sessions, role management
- **TournamentContext**: All tournament data, teams, matches, courts
- **LocalStorage**: Persistent data across browser sessions
- **Real-time Updates**: Context updates trigger UI re-renders

### **Routing Strategy**
```typescript
// Public routes
/                    # HomePage
/register           # User registration
/login             # Authentication
/bracket           # Public bracket viewing

// Protected routes (authenticated users)
/dashboard         # Personal dashboard
/court/:courtId    # Admin court management

// Public displays (no auth required)
/court/:courtId/public  # Spectator displays

// Admin routes (admin role required)
/admin            # Tournament administration
```

### **Data Models Philosophy**
- **Type Safety**: Complete TypeScript coverage prevents runtime errors
- **Extensibility**: Interfaces designed for easy backend integration  
- **Real-World Data**: Sample data from actual 2024 Michigan Cup tournament
- **Audit Trail**: Complete history of all matches, actions, and results

## 🚀 Production Readiness

### **Completed Features**
- ✅ Complete user registration and authentication
- ✅ Tournament bracket generation and visualization
- ✅ Real-time court management and scoring
- ✅ Time-based scoring with countdown timers and automatic completion
- ✅ Point tracking and proper kendo win determination hierarchy
- ✅ Overtime (encho-sen) system with player selection
- ✅ Public spectator displays with live timer and point tracking
- ✅ Material Design 3 implementation
- ✅ Mobile-responsive design
- ✅ Authentic kendo rules implementation with time limits
- ✅ Individual player action tracking

### **Ready for Backend Integration**
- All data models designed for database storage
- Context pattern easily swappable for API calls
- Complete TypeScript interfaces for backend contracts
- Sample data demonstrates expected data structures

### **Deployment Considerations**
- Vite build optimized for production
- Static hosting ready (currently using LocalStorage)
- Environment variables prepared for backend URLs
- HTTPS required for authentication features

## 🎯 Future Enhancements (Not Yet Implemented)

### **Backend Integration**
- Replace LocalStorage with REST API calls
- User authentication with JWT tokens
- Real-time WebSocket updates for live scoring
- Database schema implementation (PostgreSQL recommended)

### **Advanced Features**
- Tournament statistics and analytics
- Export functionality (CSV, PDF brackets)
- Multi-tournament management
- Advanced reporting and performance metrics
- Email notifications for tournament updates

### **Production Features**
- Offline capability with service workers
- Print-optimized bracket layouts
- Tournament streaming integration
- QR codes for easy public display access

---

## 🔍 Quick Start for Future Development

1. **Understanding the Codebase**: Start with `src/types/index.ts` for data models
2. **Key Components**: `AdminPage.tsx` and `CourtPage.tsx` contain main functionality
3. **Kendo Logic**: `utils/kendoMatchLogic.ts` contains all authentic kendo scoring rules
4. **Time-Based Scoring**: See `CourtPage.tsx` timer implementation and point tracking
5. **Overtime System**: See `CourtPage.tsx` overtime components for encho-sen implementation
6. **Tournament Flow**: Follow `utils/tournamentLogic.ts` for business rules
7. **Styling**: All custom styles in `src/index.css` with Material Design 3
8. **Sample Data**: `utils/sampleData.ts` shows expected data structures

## 🥋 **Overtime System Deep Dive**

### **Key Files for Overtime**
- `src/pages/CourtPage.tsx`: Complete overtime UI and logic
- `src/pages/PublicCourtPage.tsx`: Spectator overtime displays
- `src/types/index.ts`: OvertimeData interface and match status types

### **Overtime Flow**
1. **Match Completion Check**: When 7th set ends, check if score is 3-3
2. **Status Transition**: `match.status = 'overtime'` triggers UI change
3. **Player Selection**: `OvertimePlayerSelection` component shows all team players
4. **Overtime Start**: Creates `OvertimeData` with selected players
5. **Scoring Interface**: `OvertimeInterface` component for action recording
6. **Match Resolution**: First valid point immediately completes match
7. **Result Display**: Winner shown with overtime attribution

### **Technical Notes**
- **State Management**: Uses React state for multi-step overtime process
- **Data Persistence**: All overtime data saved to tournament context
- **UI States**: Handles selection phase, active overtime, and completion
- **Public Integration**: Real-time updates on spectator displays
- **Error Handling**: Validates player selections and action assignments

This is a production-ready kendo tournament management system with complete authentic rules including time-based scoring, proper win determination hierarchy, overtime (encho-sen), professional UI/UX, and extensible architecture ready for backend integration.

## 🕐 **Time-Based Scoring System Deep Dive**

### **Implementation Details**
- **Real-Time Timers**: Each set has a 3-minute countdown timer with start/pause controls
- **Automatic Completion**: Sets automatically complete when time expires, winner determined by point count
- **Point Tracking**: Live point counting using valid kendo actions (men, kote, tsuki, do)
- **Winner Determination**: Implements authentic kendo hierarchy (set wins > total points > overtime)
- **Time Display**: Formatted MM:SS display throughout admin and public interfaces

### **Key Functions** (`src/utils/kendoMatchLogic.ts`)
```typescript
// Calculate set winner based on points and time
export const calculateSetWinner = (
  team1Points: number,
  team2Points: number, 
  timeRemaining: number
): { winnerId?: string, result: 'win' | 'draw' | 'time_expired' }

// Determine match winner using kendo hierarchy
export const determineMatchWinner = (matchScore: MatchScore): {
  winnerId?: string
  needsOvertime: boolean
  reason: 'sets' | 'points' | 'tied'
}

// Check if set should end (2 points or time expired)
export const shouldEndSet = (
  team1Points: number, 
  team2Points: number, 
  timeRemaining: number
): boolean
```

### **UI Features**
- **Admin Interface**: Timer controls, live point display, automatic set completion
- **Public Display**: Real-time timer and point tracking for spectators
- **Match Completion**: Enhanced match result display with win reason explanation
- **Set History**: Complete tracking of points, timing, and results for each set