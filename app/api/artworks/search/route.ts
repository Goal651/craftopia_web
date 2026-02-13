import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

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

    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {
      $text: { $search: query }
    }

    if (category && category !== 'all') {
      filter.category = category
    }

    // Execute query with count
    const [artworks, totalItems] = await Promise.all([
      Artwork.find(filter)
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Artwork.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return NextResponse.json({
      artworks: artworks.map((art: any) => ({
        ...art,
        id: art._id.toString(),
        _id: undefined,
        __v: undefined
      })),
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