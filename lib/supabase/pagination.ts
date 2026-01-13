import { createClient } from '@/lib/supabase/client'
import type { ArtworkRecord, ArtworkCategory } from '@/types'

export interface PaginationOptions {
  page?: number
  limit?: number
  category?: ArtworkCategory | 'all'
  artistId?: string
  sortBy?: 'newest' | 'oldest' | 'most_viewed'
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
  }
}

/**
 * Efficiently paginate artworks with various filters and sorting options
 */
export async function paginateArtworks({
  page = 1,
  limit = 12,
  category = 'all',
  artistId,
  sortBy = 'newest'
}: PaginationOptions): Promise<PaginationResult<ArtworkRecord>> {
  const supabase = createClient()
  
  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query
  let queryBuilder = supabase.from('artworks').select('*', { count: 'exact' })

  // Add filters
  if (category && category !== 'all') {
    queryBuilder = queryBuilder.eq('category', category)
  }

  if (artistId) {
    queryBuilder = queryBuilder.eq('artist_id', artistId)
  }

  // Add sorting
  switch (sortBy) {
    case 'oldest':
      queryBuilder = queryBuilder.order('created_at', { ascending: true })
      break
    case 'most_viewed':
      queryBuilder = queryBuilder.order('view_count', { ascending: false })
      queryBuilder = queryBuilder.order('created_at', { ascending: false }) // Secondary sort
      break
    case 'newest':
    default:
      queryBuilder = queryBuilder.order('created_at', { ascending: false })
      break
  }

  // Apply pagination
  queryBuilder = queryBuilder.range(offset, offset + limit - 1)

  const { data, error, count } = await queryBuilder

  if (error) {
    throw new Error(`Failed to fetch artworks: ${error.message}`)
  }

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / limit)

  return {
    data: (data || []).map(item => ({ ...item, category: item.category as ArtworkCategory })),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    }
  }
}

/**
 * Get artist statistics efficiently using the artist_stats view
 */
export async function getArtistStats(artistId: string) {
  const supabase = createClient()
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', artistId)
    .single()

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      throw new Error('Artist not found')
    }
    throw new Error(`Failed to fetch artist profile: ${profileError.message}`)
  }

  // Get artwork count and total views
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('view_count')
    .eq('artist_id', artistId)

  if (artworksError) {
    throw new Error(`Failed to fetch artist artworks: ${artworksError.message}`)
  }

  const artwork_count = artworks?.length || 0
  const total_views = artworks?.reduce((sum, artwork) => sum + artwork.view_count, 0) || 0

  return {
    ...profile,
    artwork_count,
    total_views
  }
}

/**
 * Search artworks with pagination
 */
export async function searchArtworks({
  query,
  page = 1,
  limit = 12,
  category = 'all'
}: {
  query: string
  page?: number
  limit?: number
  category?: ArtworkCategory | 'all'
}): Promise<PaginationResult<ArtworkRecord> & { query: string }> {
  const supabase = createClient()
  
  if (!query.trim()) {
    throw new Error('Search query is required')
  }

  // Calculate offset
  const offset = (page - 1) * limit

  // Build search query
  let queryBuilder = supabase
    .from('artworks')
    .select('*', { count: 'exact' })

  // Add full-text search
  queryBuilder = queryBuilder.or(`title.ilike.%${query}%,artist_name.ilike.%${query}%,description.ilike.%${query}%`)

  // Add category filter if provided
  if (category && category !== 'all') {
    queryBuilder = queryBuilder.eq('category', category)
  }

  // Add ordering and pagination
  queryBuilder = queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await queryBuilder

  if (error) {
    throw new Error(`Search failed: ${error.message}`)
  }

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / limit)

  return {
    data: (data || []).map(item => ({ ...item, category: item.category as ArtworkCategory })),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    },
    query: query.trim()
  }
}

/**
 * Get paginated artworks for a specific artist
 */
export async function getArtistArtworks(
  artistId: string,
  options: Omit<PaginationOptions, 'artistId'> = {}
): Promise<PaginationResult<ArtworkRecord>> {
  return paginateArtworks({
    ...options,
    artistId
  })
}

/**
 * Utility function to generate page numbers for pagination UI
 */
export function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | string)[] {
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    // Calculate range around current page
    const start = Math.max(2, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages - 1, start + maxVisible - 3)
    
    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...')
    }
    
    // Add pages around current page
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('...')
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  }
  
  return pages
}