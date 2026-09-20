import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { getSession, isAdminUser } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

const allowedStatuses = ['new', 'contacted', 'delivered', 'cancelled'] as const
type OrderStatus = (typeof allowedStatuses)[number]

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
        const status = body?.status as OrderStatus

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const order = await Order.findById(id)
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        if (!isAdminUser(session) && order.artist_id !== session.id) {
            return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
        }

        order.status = status
        await order.save()

        return NextResponse.json({
            message: 'Order updated',
            order: { id: order._id.toString(), status: order.status },
        })
    } catch (error) {
        console.error('Update order error:', error)
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }
}
