import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()
        const artwork = await Artwork.findById(params.id).lean()

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
