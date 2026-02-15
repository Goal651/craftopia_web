import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import ArtworkView from '@/lib/db/models/ArtworkView'
import { getSessionAction } from '@/lib/actions/user.actions'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let artworkId: string = ''
    try {
        await dbConnect()
        const { id } = await params
        artworkId = id

        // Get user session using custom auth
        const session = await getSessionAction()
        
        if (!session?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userId = session.id

        // Check if user has already viewed this artwork
        const existingView = await ArtworkView.findOne({
            artwork_id: artworkId,
            user_id: userId
        })

        if (existingView) {
            // User already viewed, return current view count
            const artwork = await Artwork.findById(artworkId).lean()
            return NextResponse.json({
                view_count: artwork?.view_count || 0,
                already_viewed: true
            })
        }

        // Create new view record
        await ArtworkView.create({
            artwork_id: artworkId,
            user_id: userId,
            ip_address: (request as any).ip || request.headers.get('x-forwarded-for'),
            user_agent: request.headers.get('user-agent')
        })

        // Increment artwork view count
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
            view_count: updatedArtwork.view_count,
            already_viewed: false
        })
    } catch (error) {
        console.error('Increment view count error:', error)
        
        // Handle duplicate key error (user already viewed)
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            const artwork = await Artwork.findById(artworkId).lean()
            return NextResponse.json({
                view_count: artwork?.view_count || 0,
                already_viewed: true
            })
        }
        
        return NextResponse.json(
            { error: 'Failed to increment view count' },
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
        
        let hasViewed = false
        if (session?.id) {
            const existingView = await ArtworkView.findOne({
                artwork_id: artworkId,
                user_id: session.id
            })
            hasViewed = !!existingView
        }

        const artwork = await Artwork.findById(artworkId).lean()
        
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            view_count: artwork.view_count,
            has_viewed: hasViewed
        })
    } catch (error) {
        console.error('Get view count error:', error)
        return NextResponse.json(
            { error: 'Failed to get view count' },
            { status: 500 }
        )
    }
}
