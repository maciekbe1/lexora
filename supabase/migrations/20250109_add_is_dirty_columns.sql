-- Add is_dirty columns for synchronization tracking
-- These columns are used to track which records need to be synced from local to cloud

-- Add is_dirty to user_decks
ALTER TABLE public.user_decks 
ADD COLUMN IF NOT EXISTS is_dirty BOOLEAN DEFAULT false;

-- Add is_dirty to custom_decks
ALTER TABLE public.custom_decks 
ADD COLUMN IF NOT EXISTS is_dirty BOOLEAN DEFAULT false;

-- Add is_dirty to custom_flashcards
ALTER TABLE public.custom_flashcards 
ADD COLUMN IF NOT EXISTS is_dirty BOOLEAN DEFAULT false;

-- Add is_dirty to custom_flashcard_progress
ALTER TABLE public.custom_flashcard_progress 
ADD COLUMN IF NOT EXISTS is_dirty BOOLEAN DEFAULT false;

-- Create indexes for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_user_decks_is_dirty ON public.user_decks(is_dirty) WHERE is_dirty = true;
CREATE INDEX IF NOT EXISTS idx_custom_decks_is_dirty ON public.custom_decks(is_dirty) WHERE is_dirty = true;
CREATE INDEX IF NOT EXISTS idx_custom_flashcards_is_dirty ON public.custom_flashcards(is_dirty) WHERE is_dirty = true;
CREATE INDEX IF NOT EXISTS idx_custom_flashcard_progress_is_dirty ON public.custom_flashcard_progress(is_dirty) WHERE is_dirty = true;

-- Add RLS policies for is_dirty column
-- Users can only update their own records' is_dirty flag

-- User decks is_dirty policy
CREATE POLICY "Users can update is_dirty on their own user_decks"
ON public.user_decks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Custom decks is_dirty policy  
CREATE POLICY "Users can update is_dirty on their own custom_decks"
ON public.custom_decks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Custom flashcards is_dirty policy
CREATE POLICY "Users can update is_dirty on their own custom_flashcards"
ON public.custom_flashcards
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Custom flashcard progress is_dirty policy (based on user_deck ownership)
CREATE POLICY "Users can update is_dirty on their own progress"
ON public.custom_flashcard_progress
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_decks ud
    WHERE ud.id = custom_flashcard_progress.user_deck_id
    AND ud.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_decks ud
    WHERE ud.id = custom_flashcard_progress.user_deck_id
    AND ud.user_id = auth.uid()
  )
);

-- Create deletion_queue table for tracking deleted entities
-- This is needed to sync deletions from local to cloud
CREATE TABLE IF NOT EXISTS public.deletion_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('user_deck', 'custom_deck', 'custom_flashcard', 'progress')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, entity_id, user_id)
);

-- Enable RLS on deletion_queue
ALTER TABLE public.deletion_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for deletion_queue
CREATE POLICY "Users can insert their own deletions"
ON public.deletion_queue
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletions"
ON public.deletion_queue
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deletion records"
ON public.deletion_queue
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient deletion queue queries
CREATE INDEX IF NOT EXISTS idx_deletion_queue_user_id ON public.deletion_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_created_at ON public.deletion_queue(created_at);

COMMENT ON COLUMN public.user_decks.is_dirty IS 'Indicates if this record has local changes that need to be synced to the cloud';
COMMENT ON COLUMN public.custom_decks.is_dirty IS 'Indicates if this record has local changes that need to be synced to the cloud';
COMMENT ON COLUMN public.custom_flashcards.is_dirty IS 'Indicates if this record has local changes that need to be synced to the cloud';
COMMENT ON COLUMN public.custom_flashcard_progress.is_dirty IS 'Indicates if this record has local changes that need to be synced to the cloud';
COMMENT ON TABLE public.deletion_queue IS 'Tracks entities deleted locally that need to be synced to the cloud';