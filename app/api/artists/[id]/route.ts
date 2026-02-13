import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()
        const artist = await User.findById(params.id).select('-password').lean()

        if (!artist) {
            return NextResponse.json(
                { error: 'Artist not found' },
                { status: 404 }
            )
        }

        // Calculate stats
        const [artworkCount, totalViewsResult] = await Promise.all([
            Artwork.countDocuments({ artist_id: params.id }),
            Artwork.aggregate([
                { $match: { artist_id: params.id } },
                { $group: { _id: null, totalViews: { $sum: "$view_count" } } }
            ])
        ])

        const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0

        return NextResponse.json({
            ...artist,
            id: artist._id.toString(),
            _id: undefined,
            artwork_count: artworkCount,
            total_views: totalViews
        })
    } catch (error) {
        console.error('Fetch artist stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch artist stats' },
            { status: 500 }
        )
    }
}
