import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const artworkId = id

        const updatedArtwork = await Artwork.findByIdAndUpdate(
            artworkId,
            { $inc: { view_count: 1 } },
            { new: true }
        ).lean()

        if (!updatedArtwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            view_count: updatedArtwork.view_count
        })
    } catch (error) {
        console.error('Increment view count error:', error)
        return NextResponse.json(
            { error: 'Failed to increment view count' },
            { status: 500 }
        )
    }
}
