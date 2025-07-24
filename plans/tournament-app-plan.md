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
- [ ] Main stage: Double elimination bracket
- [ ] Smooth progression with clear status indicators
- [ ] Ranking system and easy-to-follow advancement

### 4. Admin Features
- [ ] Tournament configuration (groups, courts)
- [ ] User management interface
- [ ] Court management dashboard
- [ ] Match scheduling and results entry
- [ ] Tournament archival and new tournament creation

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
  createdAt: string;
  completedAt?: string;
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
  currentPlayerSet: number; // 1-7
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

### Phase 4: Court Management
- [ ] Admin court management
- [ ] Real-time scoring system
- [ ] Match tracking interface
- [ ] Public display views

### Phase 5: Polish & Deployment
- [ ] Responsive design optimization
- [ ] WCAG 2.1 AA compliance
- [ ] Historical results system
- [ ] Performance optimization
- [ ] Vercel deployment

## Database Choice
**Recommendation**: Vercel Postgres for structured relational data with easy Vercel integration.

Ready to proceed with implementation!