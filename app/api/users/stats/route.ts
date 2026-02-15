import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const artworks = await Artwork.find({ artist_id: userId }).lean()
        const artworkCount = artworks.length
        const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.view_count || 0), 0)

        return NextResponse.json({
            artwork_count: artworkCount,
            total_views: totalViews
        })
    } catch (error) {
        console.error('Fetch user stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }
}
