-- Add stats columns to user_decks table
-- These columns track learning progress for spaced repetition

ALTER TABLE user_decks 
ADD COLUMN IF NOT EXISTS stats_new INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_learning INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_review INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_mastered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Initialize stats for existing template decks
UPDATE user_decks 
SET 
  stats_new = COALESCE(deck_flashcard_count, 0),
  stats_learning = 0,
  stats_review = 0,
  stats_mastered = 0,
  stats_updated_at = NOW()
WHERE template_deck_id IS NOT NULL AND stats_new IS NULL;