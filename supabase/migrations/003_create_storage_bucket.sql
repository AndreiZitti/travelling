-- Migration: Create storage bucket for visit photos
-- Run this in the Supabase SQL Editor

-- Create the storage bucket for visit photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visit-photos',
  'visit-photos',
  false,  -- Private bucket, requires signed URLs
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS Policy: Users can upload photos to their own folder
-- Path format: {user_id}/{location_id}/{filename}
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'visit-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'visit-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: Run this migration in the Supabase Dashboard SQL Editor
-- Go to: Project Settings > SQL Editor > New Query
-- Paste this SQL and click "Run"
