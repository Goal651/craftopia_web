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

        // Get the request body to determine if it's a like or unlike
        const body = await request.json()
        const { liked } = body

        // For now, we'll just return a success response
        // In a real implementation, you would:
        // 1. Check if user is authenticated
        // 2. Store likes in a separate collection (e.g., UserLikes)
        // 3. Update the artwork's like count
        // 4. Return the updated like count

        // Since we don't have a likes field in the Artwork model yet,
        // we'll simulate it for now
        const artwork = await Artwork.findById(artworkId).lean()
        
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        // For now, just return a simulated like count
        // In a real app, this would come from the database
        const simulatedLikeCount = Math.floor(artwork.view_count * 0.12)

        return NextResponse.json({
            liked: liked,
            like_count: simulatedLikeCount,
            message: liked ? 'Artwork liked successfully' : 'Artwork unliked successfully'
        })
    } catch (error) {
        console.error('Like artwork error:', error)
        return NextResponse.json(
            { error: 'Failed to update like status' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const artworkId = id

        const artwork = await Artwork.findById(artworkId).lean()
        
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        // For now, return simulated like count
        const simulatedLikeCount = Math.floor(artwork.view_count * 0.12)

        return NextResponse.json({
            like_count: simulatedLikeCount
        })
    } catch (error) {
        console.error('Get like count error:', error)
        return NextResponse.json(
            { error: 'Failed to get like count' },
            { status: 500 }
        )
    }
}
