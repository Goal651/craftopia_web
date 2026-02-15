import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import ArtworkComment from '@/lib/db/models/ArtworkComment'
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
        const { content, parent_id } = body

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            )
        }

        if (content.length > 1000) {
            return NextResponse.json(
                { error: 'Comment cannot exceed 1000 characters' },
                { status: 400 }
            )
        }

        // Check if artwork exists
        const artwork = await Artwork.findById(artworkId)
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        // If parent_id is provided, check if parent comment exists
        if (parent_id) {
            const parentComment = await ArtworkComment.findById(parent_id)
            if (!parentComment || parentComment.artwork_id !== artworkId) {
                return NextResponse.json(
                    { error: 'Parent comment not found' },
                    { status: 404 }
                )
            }
        }

        // Create comment
        const comment = await ArtworkComment.create({
            artwork_id: artworkId,
            user_id: userId,
            content: content.trim(),
            parent_id: parent_id || null
        })

        // Populate user information
        const populatedComment = await ArtworkComment.findById(comment._id)
            .populate('user_id', 'display_name avatar_url')
            .lean()

        return NextResponse.json({
            comment: populatedComment,
            message: 'Comment posted successfully'
        })
    } catch (error) {
        console.error('Post comment error:', error)
        return NextResponse.json(
            { error: 'Failed to post comment' },
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

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sortBy = searchParams.get('sortBy') || 'created_at'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        // Check if artwork exists
        const artwork = await Artwork.findById(artworkId)
        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        // Build sort object
        const sort: any = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1

        // Get comments with pagination
        const comments = await ArtworkComment.find({
            artwork_id: artworkId,
            parent_id: null, // Only get top-level comments
            is_deleted: false
        })
        .populate('user_id', 'display_name avatar_url')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await ArtworkComment.find({
                    parent_id: comment._id,
                    is_deleted: false
                })
                .populate('user_id', 'display_name avatar_url')
                .sort({ created_at: 1 })
                .lean()

                return {
                    ...comment,
                    replies
                }
            })
        )

        // Get total count
        const totalCount = await ArtworkComment.countDocuments({
            artwork_id: artworkId,
            parent_id: null,
            is_deleted: false
        })

        return NextResponse.json({
            comments: commentsWithReplies,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        console.error('Get comments error:', error)
        return NextResponse.json(
            { error: 'Failed to get comments' },
            { status: 500 }
        )
    }
}
