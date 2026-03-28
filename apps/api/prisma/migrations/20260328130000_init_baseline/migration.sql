-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserAuthType" AS ENUM ('guest', 'local');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('playing', 'finished');

-- CreateEnum
CREATE TYPE "MatchEndReason" AS ENUM ('last_player_remaining', 'all_others_bankrupt', 'all_others_abandoned', 'manual_termination_dev_only');

-- CreateEnum
CREATE TYPE "EliminationReason" AS ENUM ('bankrupt', 'abandoned');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('property_purchase', 'rent', 'tax', 'start_salary', 'bankruptcy_summary');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_type" "UserAuthType" NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_key" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "source_lobby_id" TEXT,
    "board_config_key" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'playing',
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "end_reason" "MatchEndReason",
    "winner_user_id" UUID,
    "player_count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_players" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name_snapshot" TEXT NOT NULL,
    "turn_order" INTEGER NOT NULL,
    "start_balance" INTEGER NOT NULL,
    "final_balance" INTEGER,
    "final_position" INTEGER,
    "final_rank" INTEGER,
    "is_bankrupt" BOOLEAN NOT NULL DEFAULT false,
    "is_abandoned" BOOLEAN NOT NULL DEFAULT false,
    "elimination_reason" "EliminationReason",
    "eliminated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "match_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "turn_number" INTEGER,
    "transaction_type" "TransactionType" NOT NULL,
    "from_user_id" UUID,
    "to_user_id" UUID,
    "property_key" TEXT,
    "tile_index" INTEGER,
    "amount" INTEGER NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_stats" (
    "user_id" UUID NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "bankruptcies" INTEGER NOT NULL DEFAULT 0,
    "abandons" INTEGER NOT NULL DEFAULT 0,
    "last_match_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "leaderboard_stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "profiles_display_name_idx" ON "profiles"("display_name");

-- CreateIndex
CREATE INDEX "matches_started_at_idx" ON "matches"("started_at");

-- CreateIndex
CREATE INDEX "matches_finished_at_idx" ON "matches"("finished_at");

-- CreateIndex
CREATE INDEX "matches_winner_user_id_idx" ON "matches"("winner_user_id");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "match_players_user_id_idx" ON "match_players"("user_id");

-- CreateIndex
CREATE INDEX "match_players_match_id_final_rank_idx" ON "match_players"("match_id", "final_rank");

-- CreateIndex
CREATE UNIQUE INDEX "match_players_match_id_user_id_key" ON "match_players"("match_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_players_match_id_turn_order_key" ON "match_players"("match_id", "turn_order");

-- CreateIndex
CREATE INDEX "transactions_match_id_created_at_idx" ON "transactions"("match_id", "created_at");

-- CreateIndex
CREATE INDEX "transactions_from_user_id_idx" ON "transactions"("from_user_id");

-- CreateIndex
CREATE INDEX "transactions_to_user_id_idx" ON "transactions"("to_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_match_id_sequence_no_key" ON "transactions"("match_id", "sequence_no");

-- CreateIndex
CREATE INDEX "leaderboard_stats_wins_idx" ON "leaderboard_stats"("wins");

-- CreateIndex
CREATE INDEX "leaderboard_stats_matches_played_idx" ON "leaderboard_stats"("matches_played");

-- CreateIndex
CREATE INDEX "leaderboard_stats_last_match_at_idx" ON "leaderboard_stats"("last_match_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_players" ADD CONSTRAINT "match_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_stats" ADD CONSTRAINT "leaderboard_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- CustomCheckConstraints
ALTER TABLE "matches"
ADD CONSTRAINT "matches_player_count_check"
CHECK ("player_count" BETWEEN 4 AND 6);

ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_amount_check"
CHECK ("amount" > 0);