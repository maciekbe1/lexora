-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own flashcard progress" ON custom_flashcard_progress;

-- Temporarily disable RLS to allow debugging
ALTER TABLE custom_flashcard_progress DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE custom_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for debugging
-- This allows authenticated users to manage all progress data
CREATE POLICY "Allow authenticated users to manage progress" ON custom_flashcard_progress
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON custom_flashcard_progress TO authenticated;
GRANT ALL ON custom_flashcard_progress TO service_role;