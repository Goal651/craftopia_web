import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Artwork from '@/lib/db/models/Artwork'
import { getSession, isAdminUser } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

export async function GET(request: NextRequest) {
  try {
    // Admins only — this endpoint exposes platform-wide numbers and artist names.
    const session = (await getSession()) ?? getMobileSession(request)
    if (!isAdminUser(session)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await dbConnect()

    // Get all artworks and users
    const [artworks, users] = await Promise.all([
      Artwork.find({}).lean(),
      User.find({}).lean()
    ])

    // Calculate statistics
    const totalArtworks = artworks.length
    const totalUsers = users.length
    const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.view_count || 0), 0)
    const activeArtists = new Set(artworks.map(a => a.artist_id)).size

    // Category counts — normalized to lowercase to match the UI's category ids
    // (legacy documents stored capitalized names like 'Photography')
    const categoryCounts = artworks.reduce((acc: any, artwork) => {
      const category = (artwork.category || 'other').toLowerCase()
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Recent activity (last 10 artworks) — documents use Mongoose `createdAt` timestamps
    const recentArtworks = artworks
      .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())
      .slice(0, 10)
      .map(artwork => ({
        id: artwork._id.toString(),
        title: artwork.title,
        artist_name: artwork.artist_name,
        created_at: artwork.createdAt,
        view_count: artwork.view_count || 0
      }))

    // Top viewed artworks
    const topArtworks = artworks
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
      .map(artwork => ({
        id: artwork._id.toString(),
        title: artwork.title,
        artist_name: artwork.artist_name,
        view_count: artwork.view_count || 0,
        image_url: artwork.image_url
      }))

    return NextResponse.json({
      stats: {
        totalArtworks,
        totalUsers,
        totalViews,
        activeArtists
      },
      categoryCounts,
      recentArtworks,
      topArtworks
    })
  } catch (error) {
    console.error('Fetch admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
