-- Row Level Security (RLS) policies for Public Art Upload System
-- This migration sets up security policies to control data access

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- User profiles policies
-- Allow users to view all profiles (for artist discovery)
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Artworks policies
-- Allow anyone to view artworks (public gallery)
CREATE POLICY "Anyone can view artworks" ON public.artworks
  FOR SELECT USING (true);

-- Allow authenticated users to insert artworks (must be their own)
CREATE POLICY "Authenticated users can insert artworks" ON public.artworks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = artist_id
  );

-- Allow users to update their own artworks
CREATE POLICY "Users can update own artworks" ON public.artworks
  FOR UPDATE USING (auth.uid() = artist_id);

-- Allow users to delete their own artworks
CREATE POLICY "Users can delete own artworks" ON public.artworks
  FOR DELETE USING (auth.uid() = artist_id);

-- Special policy for view count updates (can be updated by anyone viewing)
-- This allows the system to increment view counts without authentication
CREATE POLICY "Anyone can increment view count" ON public.artworks
  FOR UPDATE USING (true)
  WITH CHECK (
    -- Only allow updating the view_count column
    -- All other columns must remain unchanged
    OLD.id = NEW.id
    AND OLD.title = NEW.title
    AND OLD.description = NEW.description
    AND OLD.category = NEW.category
    AND OLD.image_url = NEW.image_url
    AND OLD.image_path = NEW.image_path
    AND OLD.artist_id = NEW.artist_id
    AND OLD.artist_name = NEW.artist_name
    AND OLD.created_at = NEW.created_at
    -- Only view_count and updated_at can change
    AND NEW.view_count >= OLD.view_count
  );