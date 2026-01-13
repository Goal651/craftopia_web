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

-- Note: Storage policies need to be created through the Supabase Dashboard
-- Go to Storage > Policies in your Supabase dashboard and create these policies:

-- Policy 1: "Anyone can view artwork images"
-- Operation: SELECT
-- Target roles: public
-- USING expression: bucket_id = 'artworks'

-- Policy 2: "Authenticated users can upload artwork images"  
-- Operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression: bucket_id = 'artworks' AND (storage.foldername(name))[1] = auth.uid()::text

-- Policy 3: "Users can update own artwork images"
-- Operation: UPDATE  
-- Target roles: authenticated
-- USING expression: bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]

-- Policy 4: "Users can delete own artwork images"
-- Operation: DELETE
-- Target roles: authenticated  
-- USING expression: bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]