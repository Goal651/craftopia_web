import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        // In a real app, you would get the user ID from the session/JWT
        // For now, we'll use a query param or placeholder
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const user = await User.findById(userId).select('-password').lean()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...user,
            id: user._id.toString(),
            _id: undefined
        })
    } catch (error) {
        console.error('Fetch profile error:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect()
        const body = await request.json()
        const { userId, display_name, bio } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { display_name, bio, updated_at: new Date() },
            { new: true }
        ).select('-password').lean()

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                ...updatedUser,
                id: updatedUser._id.toString(),
                _id: undefined
            }
        })
    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
