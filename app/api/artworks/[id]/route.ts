import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import { getSession, isAdminUser } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const artwork = await Artwork.findById(id).lean()

        if (!artwork) {
            return NextResponse.json(
                { error: 'Artwork not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...artwork,
            id: artwork._id.toString(),
            _id: undefined,
            __v: undefined
        })
    } catch (error) {
        console.error('Fetch artwork error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch artwork' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = (await getSession()) ?? getMobileSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        await dbConnect()
        const { id } = await params
        const body = await request.json()

        const artwork = await Artwork.findById(id)
        if (!artwork) {
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
        }

        if (artwork.artist_id !== session.id && !isAdminUser(session)) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        const allowed = ['title', 'description', 'category', 'image_url', 'images', 'medium', 'dimensions', 'year', 'price', 'stock_quantity']
        const updates: Record<string, unknown> = {}
        for (const key of allowed) {
            if (key in body) updates[key] = body[key]
        }

        const updatedArtwork = await Artwork.findByIdAndUpdate(
            id,
            { ...updates, updated_at: new Date() },
            { new: true }
        ).lean()

        return NextResponse.json({
            message: 'Artwork updated successfully',
            artwork: {
                ...updatedArtwork,
                id: updatedArtwork!._id.toString(),
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Update artwork error:', error)
        return NextResponse.json({ error: 'Failed to update artwork' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = (await getSession()) ?? getMobileSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        await dbConnect()
        const { id } = await params

        const artwork = await Artwork.findById(id)
        if (!artwork) {
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
        }

        if (artwork.artist_id !== session.id && !isAdminUser(session)) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        await Artwork.findByIdAndDelete(id)

        return NextResponse.json({
            message: 'Artwork deleted successfully'
        })
    } catch (error) {
        console.error('Delete artwork error:', error)
        return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 })
    }
}
