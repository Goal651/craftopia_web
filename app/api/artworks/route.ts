import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import { getSession } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const category = searchParams.get('category')
        const artistId = searchParams.get('artistId')
        const search = searchParams.get('search')?.trim()

        const skip = (page - 1) * limit
        const filter: any = {}

        if (category && category !== 'all') {
            filter.category = category
        }

        if (artistId) {
            filter.artist_id = artistId
        }

        if (search) {
            const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
            filter.$or = [{ title: rx }, { artist_name: rx }, { medium: rx }]
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
        const session = (await getSession()) ?? getMobileSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        await dbConnect()
        const body = await request.json()

        const { title, description, category, image_url, images, medium, dimensions, year, artist_id, artist_name, price, stock_quantity } = body

        if (!image_url || !artist_id || !artist_name) {
            return NextResponse.json(
                { error: 'Missing required fields (image, artist information)' },
                { status: 400 }
            )
        }

        // Artists can only publish as themselves
        if (artist_id !== session.id && !isAdminUserCheck(session)) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        const newArtwork = await Artwork.create({
            title: (title || '').trim() || 'Untitled',
            description,
            category: category || 'Artwork',
            image_url,
            images: images || [],
            medium,
            dimensions,
            year,
            artist_id,
            artist_name,
            price: price || 0,
            stock_quantity: stock_quantity || 1,
            featured: false,
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

function isAdminUserCheck(session: { email: string; role?: string } | null): boolean {
    if (!session) return false
    if (session.role === 'admin') return true
    const list = (process.env.ADMIN_EMAILS || 'nsengiyumvasaad2020@gmail.com,bugiriwilson651@gmail.com')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    return list.includes(session.email.toLowerCase())
}
