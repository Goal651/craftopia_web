import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'
import Order from '@/lib/db/models/Order'
import { getSession, isAdminUser } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

const orderSchema = z.object({
    artwork_id: z.string().min(1, 'Artwork is required'),
    buyer_name: z.string().trim().min(2, 'Please enter your name').max(100),
    buyer_phone: z.string().trim().min(7, 'Please enter a valid phone number').max(20),
    delivery_address: z.string().trim().min(5, 'Please enter a delivery address').max(300),
    note: z.string().trim().max(500).optional().or(z.literal('')),
})

/** Public: buyers place an order for an artwork. */
export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const body = await request.json()

        const parsed = orderSchema.safeParse(body)
        if (!parsed.success) {
            const first = parsed.error.issues[0]
            return NextResponse.json({ error: first?.message || 'Invalid order details' }, { status: 400 })
        }

        const artwork = await Artwork.findById(parsed.data.artwork_id)
        if (!artwork) {
            return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
        }

        if (artwork.stock_quantity <= 0) {
            return NextResponse.json({ error: 'This piece is currently sold out' }, { status: 400 })
        }

        const order = await Order.create({
            artwork_id: artwork._id.toString(),
            artwork_title: artwork.title || 'Untitled',
            artwork_image: artwork.image_url,
            artist_id: artwork.artist_id,
            artist_name: artwork.artist_name,
            price: artwork.price,
            buyer_name: parsed.data.buyer_name,
            buyer_phone: parsed.data.buyer_phone,
            delivery_address: parsed.data.delivery_address,
            note: parsed.data.note || '',
            status: 'new',
        })

        return NextResponse.json(
            {
                message: 'Order received',
                order: {
                    id: order._id.toString(),
                    status: order.status,
                    artwork_title: order.artwork_title,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Create order error:', error)
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
    }
}

/** Authenticated: artists see orders for their artworks; admins see all. */
export async function GET(request: NextRequest) {
    try {
        const session = (await getSession()) ?? getMobileSession(request)
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        await dbConnect()

        const filter = isAdminUser(session) ? {} : { artist_id: session.id }

        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean()

        return NextResponse.json({
            orders: orders.map((o: any) => ({
                ...o,
                id: o._id.toString(),
                _id: undefined,
                __v: undefined,
            })),
        })
    } catch (error) {
        console.error('Fetch orders error:', error)
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }
}
