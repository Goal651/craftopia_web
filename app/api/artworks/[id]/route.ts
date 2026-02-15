import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

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
        await dbConnect()
        const { id } = await params
        const body = await request.json()
        
        const updatedArtwork = await Artwork.findByIdAndUpdate(
            id,
            { ...body, updated_at: new Date() },
            { new: true }
        ).lean()

        if (!updatedArtwork) {
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
        }

        return NextResponse.json({
            message: 'Artwork updated successfully',
            artwork: {
                ...updatedArtwork,
                id: updatedArtwork._id.toString(),
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
        await dbConnect()
        const { id } = await params
        
        const deletedArtwork = await Artwork.findByIdAndDelete(id)

        if (!deletedArtwork) {
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
        }

        return NextResponse.json({
            message: 'Artwork deleted successfully'
        })
    } catch (error) {
        console.error('Delete artwork error:', error)
        return NextResponse.json({ error: 'Failed to delete artwork' }, { status: 500 })
    }
}

