# Kendo Tournament Registration and Bracket App - Implementation Plan

## Project Overview
A comprehensive React TypeScript application for managing kendo tournament registrations, bracket visualization, and real-time court management with admin controls.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with @apply patterns and BEM naming
- **State Management**: React Context + useReducer
- **Authentication**: Custom JWT-based auth
- **Database**: Vercel KV (Redis) or Vercel Postgres (simple setup with Vercel)
- **API**: Next.js API routes or Vercel Functions
- **Testing**: BDD scenarios only
- **Deployment**: Vercel

## Scale Expectations
- **Current**: ~100 participants, 15 teams, 10 dojos
- **Future**: Up to 200-300 participants
- **Tournaments**: Single active tournament, with historical results tracking

## Core Features & User Flows

### 1. User Registration & Authentication
- [ ] Registration form with validation (name, dojo, team, DOB)
- [ ] Dojo creation/selection with autocomplete
- [ ] Team creation/selection within chosen dojo
- [ ] Account creation and login system
- [ ] Protected routes and auth context

### 2. User Dashboard
- [ ] Personal profile display (name, dojo, team)
- [ ] Dojo members list with team breakdown
- [ ] Tournament bracket visualization
- [ ] Personal ranking and seed information
- [ ] Court assignment display

### 3. Tournament Structure
- [ ] Seed stage: Round-robin groups with dojo separation logic
- [ ] Main stage: Configurable single or double elimination bracket
- [ ] Smooth progression with clear status indicators
- [ ] Ranking system and easy-to-follow advancement
- [ ] Tournament overview page with comprehensive results display
- [ ] PDF export functionality for tournament results

### 4. Admin Features
- [ ] Tournament configuration (groups, courts)
- [ ] User management interface
- [ ] Court management dashboard
- [ ] Match scheduling and results entry
- [ ] Tournament archival and new tournament creation
- [ ] Tournament settings management (seed stage configuration, team size settings)
- [ ] Super admin controls for tournament parameters
- [ ] Main bracket configuration (single/double elimination)
- [ ] Tournament results overview and PDF export

### 5. Court Management System
- [ ] Real-time match tracking interface
- [ ] Kendo scoring system (men, kote, tsuki, do, hansoku)
- [ ] Player order management (1v1, 2v2, etc.)
- [ ] Match result determination
- [ ] Public court display view

### 6. Historical Results
- [ ] Past tournament results storage
- [ ] Participant history tracking
- [ ] Dojo/team performance over time

## Data Models

### User
```typescript
interface User {
  id: string;
  fullName: string;
  dateOfBirth: string;
  dojoId: string;
  teamId: string;
  role: 'participant' | 'admin';
  createdAt: string;
}
```

### Tournament
```typescript
interface Tournament {
  id: string;
  name: string;
  status: 'registration' | 'seed' | 'main' | 'completed';
  isActive: boolean;
  seedGroups: Group[];
  mainBracket: Bracket;
  courts: Court[];
  settings: TournamentSettings;
  createdAt: string;
  completedAt?: string;
}
```

### Tournament Settings
```typescript
interface TournamentSettings {
  id: string;
  tournamentId: string;
  enableSeedStage: boolean;
  maxTeamsPerGroup: number; // Default: 4
  playersPerTeam: number; // Default: 5, previously hardcoded to 7
  seedGroupGenerationMode: 'auto' | 'manual';
  mainBracketType: 'single' | 'double'; // Elimination bracket type
  eliminationQualifiers: number; // Number of teams advancing per group
  overtimeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Match
```typescript
interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  courtId: string;
  stage: 'seed' | 'main';
  status: 'scheduled' | 'in_progress' | 'completed';
  currentPlayerSet: number; // 1-N (based on tournament settings)
  scores: MatchScore;
  winnerId?: string;
}
```

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS configuration
- [x] Vercel Postgres/KV setup
- [x] API routes setup
- [x] Authentication system
- [x] User registration flow

### Phase 2: Core Features ✅ COMPLETED
- [x] Dojo and team management
- [x] User dashboard
- [x] Basic bracket visualization
- [x] Tournament creation and management

### Phase 3: Tournament Logic ✅ COMPLETED
- [x] Seed stage group generation with dojo separation
- [x] Round-robin tournament logic
- [x] Double elimination bracket
- [x] Smooth progression system
- [x] Strategic seeding system (all teams advance)
- [x] Seed group review and approval workflow

### Phase 4: Court Management ✅ COMPLETED
- [x] Match result reporting for seed stage
- [x] Kendo scoring system with individual match tracking
- [x] Team lineup management with drag-and-drop reordering
- [x] Overtime functionality with representative selection
- [x] Match result modal with auto-save capabilities
- [x] Real-time match status updates

### Phase 4.5: Tournament Settings & Configuration 🚧 IN PROGRESS
- [ ] Super admin tournament settings interface
- [ ] Configurable seed stage (enable/disable)
- [ ] Dynamic team size configuration (5-7 players)
- [ ] Max teams per group setting
- [ ] Main bracket type selection (single vs double elimination)
- [ ] Tournament parameter validation and migration
- [ ] Apply dynamic team size across all existing components

### Phase 4.6: Tournament Results & Export 📋 PLANNED
- [ ] Tournament overview/results page
- [ ] Comprehensive results display (seed stage + main bracket)
- [ ] Tournament progression visualization
- [ ] PDF export functionality for results
- [ ] Print-optimized tournament bracket layouts
- [ ] Results archival and historical data management

### Phase 5: Polish & Deployment
- [ ] Responsive design optimization
- [ ] WCAG 2.1 AA compliance
- [ ] Historical results system
- [ ] Performance optimization
- [ ] Vercel deployment

## Database Choice
**Recommendation**: Vercel Postgres for structured relational data with easy Vercel integration.

## Tournament Settings Management

### Super Admin Tournament Configuration
The tournament settings system allows super administrators to configure key tournament parameters that affect the entire tournament structure and gameplay.

#### Key Settings:
1. **Seed Stage Configuration**
   - Enable/disable initial seed round robin stage
   - Set maximum teams per group (default: 4)
   - Control group generation logic

2. **Team Size Configuration**
   - Set number of players per team (default: 5, previously hardcoded to 7)
   - Dynamically applied across all components:
     - Team roster management
     - Match result reporting
     - Individual match slots
     - Team lineup displays

3. **Tournament Structure**
   - Main bracket type (single or double elimination)
   - Number of qualifying teams per seed group
   - Overtime functionality toggle
   - Match progression rules

#### Implementation Impact:
- **DojoManagement**: Dynamic position count based on `playersPerTeam` setting
- **MatchResultModal**: Variable individual match slots (1-N instead of hardcoded 1-7)
- **BracketVisualization**: Responsive to group size settings
- **Team displays**: Show N positions instead of fixed 7
- **Database**: Migration required for existing teams with 7-player structure

#### Migration Strategy:
1. Add tournament settings table/interface
2. Create super admin settings management UI
3. Update all components to read from tournament settings
4. Migrate existing data to support variable team sizes
5. Validate and test with different configurations

## Tournament Results Overview & Export System

### Tournament Results Page
A comprehensive single-page view displaying the complete tournament state and results, combining both seed stage and main bracket information.

#### Key Features:
1. **Unified Tournament View**
   - Complete tournament progression on one page
   - Seed stage results with group standings
   - Main bracket visualization (single or double elimination)
   - Real-time match status updates
   - Tournament timeline and progression indicators

2. **Results Display Components**
   - **Seed Stage Section**: Group standings, completed matches, team advancement
   - **Main Bracket Section**: Elimination bracket with match results and progression
   - **Statistics Panel**: Tournament statistics, completion rates, standings
   - **Legend/Key**: Tournament format explanation and status indicators

3. **PDF Export Functionality**
   - Print-optimized layout design
   - Comprehensive tournament results export
   - Multiple export formats (full tournament, seed only, bracket only)
   - Professional tournament report generation
   - Historical archival capabilities

#### Implementation Components:
- **TournamentResultsPage**: Main results overview component
- **SeedStageResults**: Displays all seed groups with final standings
- **MainBracketResults**: Shows elimination bracket with match progression
- **TournamentExportService**: Handles PDF generation and formatting
- **PrintOptimizedLayouts**: CSS optimized for print/export media

#### Export Features:
- **Full Tournament Report**: Complete results including seed and main stages
- **Bracket-Only Export**: Clean bracket visualization for display
- **Team Performance Summary**: Individual team statistics and progression
- **Historical Archive Format**: Standardized format for tournament records

#### Technical Requirements:
- **PDF Library**: Integration with react-pdf or similar for export functionality
- **Print CSS**: Media queries and print-specific styling
- **Data Aggregation**: Comprehensive tournament state collection
- **Export Controls**: User interface for export options and formatting

Ready to proceed with implementation!