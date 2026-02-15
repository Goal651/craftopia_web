import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import ArtworkLike from '@/lib/db/models/ArtworkLike'
import { getSessionAction } from '@/lib/actions/user.actions'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const artworkId = id

        // Get user session using custom auth
        const session = await getSessionAction()
        
        if (!session?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = session.id
        const body = await request.json()
        const { liked } = body

        // Check if artwork exists
        const artwork = await Artwork.findById(artworkId)
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        // Prevent users from liking their own artwork
        if (artwork.artist_id === userId) {
            return NextResponse.json(
                { error: 'Cannot like your own artwork' },
                { status: 400 }
            )
        }

        if (liked) {
            // Add like
            try {
                await ArtworkLike.create({
                    artwork_id: artworkId,
                    user_id: userId
                })
            } catch (error) {
                // Handle duplicate key error (already liked)
                if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
                    // Already liked, just return current state
                } else {
                    throw error
                }
            }
        } else {
            // Remove like
            await ArtworkLike.deleteOne({
                artwork_id: artworkId,
                user_id: userId
            })
        }

        // Get current like count
        const likeCount = await ArtworkLike.countDocuments({
            artwork_id: artworkId
        })

        return NextResponse.json({
            liked: liked,
            like_count: likeCount,
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

        // Get user session using custom auth
        const session = await getSessionAction()
        
        let isLiked = false
        let likeCount = 0

        // Get like count
        likeCount = await ArtworkLike.countDocuments({
            artwork_id: artworkId
        })

        // Check if current user has liked this artwork
        if (session?.id) {
            const existingLike = await ArtworkLike.findOne({
                artwork_id: artworkId,
                user_id: session.id
            })
            isLiked = !!existingLike
        }

        return NextResponse.json({
            like_count: likeCount,
            is_liked: isLiked
        })
    } catch (error) {
        console.error('Get like count error:', error)
        return NextResponse.json(
            { error: 'Failed to get like count' },
            { status: 500 }
        )
    }
}
