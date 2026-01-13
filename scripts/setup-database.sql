-- Complete database setup script for Public Art Upload System
-- Run this script in your Supabase SQL editor to set up the database schema and storage

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'painting', 'digital-art', 'photography', 
    'sculpture', 'mixed-media', 'drawing', 'other'
  )),
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_view_count ON public.artworks(view_count DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_artworks_search ON public.artworks USING gin(
  to_tsvector('english', title || ' ' || artist_name || ' ' || COALESCE(description, ''))
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at 
  BEFORE UPDATE ON public.artworks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Artworks policies
CREATE POLICY "Anyone can view artworks" ON public.artworks
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert artworks" ON public.artworks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = artist_id
  );

CREATE POLICY "Users can update own artworks" ON public.artworks
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Users can delete own artworks" ON public.artworks
  FOR DELETE USING (auth.uid() = artist_id);

-- Special policy for view count updates
CREATE POLICY "Anyone can increment view count" ON public.artworks
  FOR UPDATE USING (true)
  WITH CHECK (
    OLD.id = NEW.id
    AND OLD.title = NEW.title
    AND OLD.description = NEW.description
    AND OLD.category = NEW.category
    AND OLD.image_url = NEW.image_url
    AND OLD.image_path = NEW.image_path
    AND OLD.artist_id = NEW.artist_id
    AND OLD.artist_name = NEW.artist_name
    AND OLD.created_at = NEW.created_at
    AND NEW.view_count >= OLD.view_count
  );

-- Storage bucket setup
-- Create the artworks storage bucket for image uploads
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
-- Anyone can view artwork images (public access)
CREATE POLICY "Anyone can view artwork images" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks');

-- Authenticated users can upload artwork images to their own folder
CREATE POLICY "Authenticated users can upload artwork images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artworks' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own artwork images
CREATE POLICY "Users can update own artwork images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artworks' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own artwork images
CREATE POLICY "Users can delete own artwork images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artworks' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;