-- Pagination optimization migration
-- This migration adds additional indexes to improve pagination performance

-- Composite index for artist artworks pagination
-- This will speed up queries that filter by artist_id and order by created_at
CREATE INDEX IF NOT EXISTS idx_artworks_artist_created_at ON public.artworks(artist_id, created_at DESC);

-- Composite index for category filtering with pagination
-- This will speed up queries that filter by category and order by created_at
CREATE INDEX IF NOT EXISTS idx_artworks_category_created_at ON public.artworks(category, created_at DESC);

-- Composite index for search with category filtering
-- This will speed up search queries that also filter by category
CREATE INDEX IF NOT EXISTS idx_artworks_category_search ON public.artworks(category) 
WHERE category IS NOT NULL;

-- Index for view count ordering (for popular artworks)
-- This improves performance when sorting by view_count
CREATE INDEX IF NOT EXISTS idx_artworks_view_count_created_at ON public.artworks(view_count DESC, created_at DESC);

-- Partial index for recent artworks (last 30 days)
-- This can speed up queries for recent content
CREATE INDEX IF NOT EXISTS idx_artworks_recent ON public.artworks(created_at DESC) 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Index for user profiles display name (for artist search)
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON public.user_profiles(display_name);

-- Composite index for user profiles with creation date
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- Add a function to get artwork count for an artist efficiently
CREATE OR REPLACE FUNCTION get_artist_artwork_count(artist_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.artworks 
    WHERE artist_id = artist_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Add a function to get total view count for an artist efficiently
CREATE OR REPLACE FUNCTION get_artist_total_views(artist_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(view_count), 0)::INTEGER 
    FROM public.artworks 
    WHERE artist_id = artist_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a view for artist statistics to improve performance
CREATE OR REPLACE VIEW artist_stats AS
SELECT 
  up.id,
  up.display_name,
  up.avatar_url,
  up.bio,
  up.created_at,
  up.updated_at,
  COALESCE(artwork_stats.artwork_count, 0) as artwork_count,
  COALESCE(artwork_stats.total_views, 0) as total_views,
  artwork_stats.latest_artwork_date
FROM public.user_profiles up
LEFT JOIN (
  SELECT 
    artist_id,
    COUNT(*) as artwork_count,
    SUM(view_count) as total_views,
    MAX(created_at) as latest_artwork_date
  FROM public.artworks
  GROUP BY artist_id
) artwork_stats ON up.id = artwork_stats.artist_id;

-- Grant permissions for the view
GRANT SELECT ON artist_stats TO authenticated;
GRANT SELECT ON artist_stats TO anon;