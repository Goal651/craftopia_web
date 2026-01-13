-- Storage bucket setup for Public Art Upload System
-- This migration creates the storage bucket and sets up storage policies

-- Create the artworks storage bucket
-- This bucket will store all uploaded artwork images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks', 
  true,  -- Public bucket for easy image access
  10485760,  -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- Only allow image files
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the artworks bucket
-- These policies control who can upload, view, and manage files

-- Policy 1: Anyone can view artwork images (public access)
CREATE POLICY "Anyone can view artwork images" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

-- Policy 2: Authenticated users can upload artwork images to their own folder
-- Files must be stored in a folder named with the user's UUID
CREATE POLICY "Authenticated users can upload artwork images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update their own artwork images
CREATE POLICY "Users can update own artwork images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artworks' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Users can delete their own artwork images
CREATE POLICY "Users can delete own artwork images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artworks' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;