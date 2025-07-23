CREATE TABLE "courts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"current_match_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dojos" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255),
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tournament_id" varchar(255) NOT NULL,
	"team1_id" varchar(255) NOT NULL,
	"team2_id" varchar(255) NOT NULL,
	"court_id" varchar(255),
	"stage" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"current_player_set" integer DEFAULT 1 NOT NULL,
	"scores" jsonb NOT NULL,
	"winner_id" varchar(255),
	"overtime" jsonb,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"dojo_id" varchar(255) NOT NULL,
	"logo" text,
	"seed_ranking" integer,
	"final_ranking" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'registration' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_participants" integer NOT NULL,
	"seed_groups" jsonb DEFAULT '[]',
	"main_bracket" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"date_of_birth" varchar(10) NOT NULL,
	"dojo_id" varchar(255) NOT NULL,
	"team_id" varchar(255),
	"role" varchar(20) DEFAULT 'participant' NOT NULL,
	"kendo_rank" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
