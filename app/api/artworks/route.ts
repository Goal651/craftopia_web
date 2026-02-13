import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const category = searchParams.get('category')
        const artistId = searchParams.get('artistId')

        const skip = (page - 1) * limit
        const filter: any = {}

        if (category && category !== 'all') {
            filter.category = category
        }

        if (artistId) {
            filter.artist_id = artistId
        }

        const [artworks, totalItems] = await Promise.all([
            Artwork.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Artwork.countDocuments(filter)
        ])

        const totalPages = Math.ceil(totalItems / limit)

        return NextResponse.json({
            artworks: artworks.map((art: any) => ({
                ...art,
                id: art._id.toString(),
                _id: undefined,
                __v: undefined
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        })
    } catch (error) {
        console.error('Fetch artworks error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch artworks' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const body = await request.json()

        const { title, description, category, image_url, artist_id, artist_name } = body

        if (!title || !category || !image_url || !artist_id || !artist_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const newArtwork = await Artwork.create({
            title,
            description,
            category,
            image_url,
            artist_id,
            artist_name,
            view_count: 0
        })

        return NextResponse.json({
            message: 'Artwork created successfully',
            artwork: {
                ...newArtwork.toObject(),
                id: newArtwork._id.toString(),
                _id: undefined,
                __v: undefined
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Create artwork error:', error)
        return NextResponse.json(
            { error: 'Failed to create artwork' },
            { status: 500 }
        )
    }
}
