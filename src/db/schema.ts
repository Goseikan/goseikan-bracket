import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  dateOfBirth: varchar('date_of_birth', { length: 10 }).notNull(),
  dojoId: varchar('dojo_id', { length: 255 }).notNull(),
  teamId: varchar('team_id', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('participant'),
  kendoRank: varchar('kendo_rank', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Dojos table
export const dojos = pgTable('dojos', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  logo: text('logo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Teams table
export const teams = pgTable('teams', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  dojoId: varchar('dojo_id', { length: 255 }).notNull(),
  logo: text('logo'),
  seedRanking: integer('seed_ranking'),
  finalRanking: integer('final_ranking'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Tournaments table
export const tournaments = pgTable('tournaments', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('registration'),
  isActive: boolean('is_active').notNull().default(true),
  maxParticipants: integer('max_participants').notNull(),
  seedGroups: jsonb('seed_groups').default('[]'),
  mainBracket: jsonb('main_bracket'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Courts table
export const courts = pgTable('courts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  currentMatchId: varchar('current_match_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Matches table
export const matches = pgTable('matches', {
  id: varchar('id', { length: 255 }).primaryKey(),
  tournamentId: varchar('tournament_id', { length: 255 }).notNull(),
  team1Id: varchar('team1_id', { length: 255 }).notNull(),
  team2Id: varchar('team2_id', { length: 255 }).notNull(),
  courtId: varchar('court_id', { length: 255 }),
  stage: varchar('stage', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('scheduled'),
  currentPlayerSet: integer('current_player_set').notNull().default(1),
  scores: jsonb('scores').notNull(),
  winnerId: varchar('winner_id', { length: 255 }),
  overtime: jsonb('overtime'),
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  dojo: one(dojos, {
    fields: [users.dojoId],
    references: [dojos.id]
  }),
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id]
  })
}))

export const dojosRelations = relations(dojos, ({ many }) => ({
  teams: many(teams),
  users: many(users)
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  dojo: one(dojos, {
    fields: [teams.dojoId],
    references: [dojos.id]
  }),
  players: many(users)
}))

export const matchesRelations = relations(matches, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id]
  }),
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id]
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id]
  }),
  court: one(courts, {
    fields: [matches.courtId],
    references: [courts.id]
  })
}))

export const courtsRelations = relations(courts, ({ many }) => ({
  matches: many(matches)
}))

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  matches: many(matches)
}))