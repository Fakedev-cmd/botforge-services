
-- Create a storage bucket for avatars if it doesn't exist.
-- This bucket will be public to allow displaying images easily.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Add an 'avatar_url' column to the 'users' table to store the link to the profile picture.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Drop existing policies if they exist to avoid conflicts.
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous avatar uploads." ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous avatar updates." ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous avatar deletes." ON storage.objects;

-- Create policies for the avatars bucket.
-- These policies are permissive due to the current authentication setup.
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Allow anonymous avatar uploads."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Allow anonymous avatar updates."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Allow anonymous avatar deletes."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' );
