-- Initial database schema for Public Art Upload System
-- This migration creates the core tables and sets up Row Level Security

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
-- This extends the auth.users table with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks table
-- Stores all uploaded artwork metadata and references
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

-- Full-text search index for artwork search functionality
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

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at 
  BEFORE UPDATE ON public.artworks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();