import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const { id } = await params
        const body = await request.json()
        const { role, status } = body

        const updateData: any = {}
        if (role) updateData.role = role
        if (status) updateData.status = status

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password').lean()

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            message: 'User updated successfully',
            user: {
                ...updatedUser,
                id: updatedUser._id.toString(),
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}
