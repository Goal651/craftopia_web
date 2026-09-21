import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Artwork from '@/lib/db/models/Artwork'
import { getSession } from '@/lib/auth'

const hashPassword = (password: string) =>
    crypto.pbkdf2Sync(password, process.env.AUTH_SALT || 'craftopia-default-salt', 1000, 64, 'sha512').toString('hex')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Admins only — without this anyone could list accounts or promote themselves. */
async function requireAdmin() {
    const session = await getSession()
    if (!session) return null
    if (session.role !== 'admin' && !isAdminEmailSession(session.email)) return null
    return session
}

function isAdminEmailSession(email: string): boolean {
    const list = (process.env.ADMIN_EMAILS || 'nsengiyumvasaad2020@gmail.com,bugiriwilson651@gmail.com')
        .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    return list.includes(email.toLowerCase())
}

export async function GET(request: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        await dbConnect()

        const users = await User.find({}).select('-password').lean()

        // Get artwork counts and view counts for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const userId = user._id.toString()

                const artworks = await Artwork.find({ artist_id: userId }).lean()
                const artworkCount = artworks.length
                const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.view_count || 0), 0)

                return {
                    id: userId,
                    email: user.email,
                    display_name: user.display_name,
                    phone_number: user.phone_number || '',
                    avatar_url: user.avatar_url || '',
                    bio: user.bio || '',
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    created_at: user.createdAt,
                    updated_at: user.updatedAt,
                    role: user.role || 'user',
                    status: user.status || 'active',
                    artwork_count: artworkCount,
                    total_views: totalViews
                }
            })
        )

        return NextResponse.json({ users: usersWithStats })
    } catch (error) {
        console.error('Fetch users error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

/** Create a new artist / staff / admin account (admin panel "Add account"). */
export async function POST(request: NextRequest) {
    try {
        const session = await requireAdmin()
        if (!session) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        await dbConnect()
        const body = await request.json()
        const email = String(body.email || '').trim().toLowerCase()
        const display_name = String(body.display_name || '').trim()
        const phone_number = String(body.phone_number || '').trim()
        const password = String(body.password || '')
        const role = ['user', 'staff', 'admin'].includes(body.role) ? body.role : 'user'

        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
        }
        if (display_name.length < 2) {
            return NextResponse.json({ error: 'Please enter the artist\'s name' }, { status: 400 })
        }
        if (phone_number.length < 7) {
            return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        }

        const existing = await User.findOne({ $or: [{ email }, { phone_number }] })
        if (existing) {
            return NextResponse.json(
                { error: existing.email === email ? 'An account with this email already exists' : 'An account with this phone number already exists' },
                { status: 409 }
            )
        }

        const user = await User.create({
            email,
            display_name,
            phone_number,
            password: hashPassword(password),
            role,
            status: 'active',
        })

        return NextResponse.json({
            message: 'Account created successfully',
            user: {
                id: user._id.toString(),
                email: user.email,
                display_name: user.display_name,
                phone_number: user.phone_number,
                role: user.role,
                status: user.status,
                artwork_count: 0,
                total_views: 0,
            },
        }, { status: 201 })
    } catch (error) {
        console.error('Create user error:', error)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
}
