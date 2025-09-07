-- Create storage bucket for flashcard images
INSERT INTO storage.buckets (id, name, public)
VALUES ('flashcard-images', 'flashcard-images', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'flashcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'flashcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'flashcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public access to read images (since bucket is public)
CREATE POLICY "Public can view flashcard images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'flashcard-images');