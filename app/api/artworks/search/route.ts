import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ArtworkRecord } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build the base query
    let queryBuilder = supabase
      .from('artworks')
      .select('*', { count: 'exact' })

    // Add full-text search using PostgreSQL's to_tsvector
    // Search in title, artist_name, and description fields
    const searchTerm = query.trim().replace(/[^\w\s]/g, '').split(/\s+/).join(' | ')
    
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,artist_name.ilike.%${query}%,description.ilike.%${query}%`)

    // Add category filter if provided
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // Add ordering and pagination
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: artworks, error, count } = await queryBuilder

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Failed to search artworks' },
        { status: 500 }
      )
    }

    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return NextResponse.json({
      artworks: artworks || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      query: query.trim()
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during search' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}