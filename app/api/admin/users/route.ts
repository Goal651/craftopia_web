import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const users = await User.find({}).select('-password').lean()

    // Get artwork counts and view counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userId = user._id.toString()
        
        const artworks = await Artwork.find({ artist_id: userId }).lean()
        const artworkCount = artworks.length
        const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.view_count || 0), 0)

        return {
          id: userId,
          email: user.email,
          display_name: user.display_name,
          avatar_url: user.avatar_url || '',
          bio: user.bio || '',
          created_at: user.createdAt,
          artwork_count: artworkCount,
          total_views: totalViews
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
