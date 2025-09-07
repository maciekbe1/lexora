-- Add missing columns to custom_flashcard_progress if they don't exist
DO $$ 
BEGIN
  -- Add repetition column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_flashcard_progress' AND column_name='repetition') THEN
    ALTER TABLE custom_flashcard_progress ADD COLUMN repetition INTEGER DEFAULT 0;
  END IF;
  
  -- Add easiness_factor column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_flashcard_progress' AND column_name='easiness_factor') THEN
    ALTER TABLE custom_flashcard_progress ADD COLUMN easiness_factor REAL DEFAULT 2.5;
  END IF;
  
  -- Add interval_days column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_flashcard_progress' AND column_name='interval_days') THEN
    ALTER TABLE custom_flashcard_progress ADD COLUMN interval_days INTEGER DEFAULT 1;
  END IF;
  
  -- Add created_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_flashcard_progress' AND column_name='created_at') THEN
    ALTER TABLE custom_flashcard_progress ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add updated_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_flashcard_progress' AND column_name='updated_at') THEN
    ALTER TABLE custom_flashcard_progress ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own flashcard progress" ON custom_flashcard_progress;

-- Create a simple RLS policy that allows users to manage progress for their own flashcards
CREATE POLICY "Users can manage their own flashcard progress" ON custom_flashcard_progress
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 
    FROM custom_flashcards cf
    WHERE cf.id = custom_flashcard_progress.flashcard_id
    AND cf.user_id::text = (auth.jwt() ->> 'sub')
  )
);

-- Grant necessary permissions
GRANT ALL ON custom_flashcard_progress TO authenticated;
GRANT ALL ON custom_flashcard_progress TO service_role;