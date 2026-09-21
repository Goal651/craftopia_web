import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { getSession } from '@/lib/auth'
import { getMobileSession } from '@/lib/mobile-auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Admins only — accepts web cookie or mobile bearer token. */
async function requireAdmin(request: NextRequest) {
    const session = (await getSession()) ?? getMobileSession(request)
    if (!session) return null
    if (session.role !== 'admin' && !isAdminEmailSession(session.email)) return null
    return session
}

function isAdminEmailSession(email: string): boolean {
    const list = (process.env.ADMIN_EMAILS || 'nsengiyumvasaad2020@gmail.com,bugiriwilson651@gmail.com')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    return list.includes(email.toLowerCase())
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin(request)
        if (!session) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        await dbConnect()
        const { id } = await params
        const body = await request.json()

        // Password reset for an account (admin panel action)
        if (body.new_password !== undefined) {
            const newPassword = String(body.new_password)
            if (newPassword.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
            }
            const hashed = crypto
                .pbkdf2Sync(newPassword, process.env.AUTH_SALT || 'craftopia-default-salt', 1000, 64, 'sha512')
                .toString('hex')
            const updated = await User.findByIdAndUpdate(id, { $set: { password: hashed } }, { new: true })
                .select('-password').lean()
            if (!updated) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }
            return NextResponse.json({
                message: 'Password reset successfully',
                user: { ...updated, id: (updated as any)._id.toString(), _id: undefined },
            })
        }

        const updateData: any = {}

        if (body.role !== undefined) {
            if (!['user', 'staff', 'admin'].includes(body.role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
            }
            updateData.role = body.role
        }
        if (body.status !== undefined) {
            if (!['active', 'suspended'].includes(body.status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
            }
            updateData.status = body.status
        }
        if (body.display_name !== undefined) {
            const name = String(body.display_name).trim()
            if (name.length < 2) {
                return NextResponse.json({ error: 'Name is too short' }, { status: 400 })
            }
            updateData.display_name = name
        }
        if (body.phone_number !== undefined) {
            const phone = String(body.phone_number).trim()
            if (phone.length < 7) {
                return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
            }
            updateData.phone_number = phone
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        // Guard: an admin cannot demote or suspend their own account
        if (id === session.id && (updateData.role === 'user' || updateData.role === 'staff' || updateData.status === 'suspended')) {
            return NextResponse.json(
                { error: 'You cannot demote or suspend your own account' },
                { status: 400 }
            )
        }

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
                id: (updatedUser as any)._id.toString(),
                _id: undefined
            }
        })
    } catch (error: any) {
        console.error('Update user error:', error)
        if (error?.name === 'CastError') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}
