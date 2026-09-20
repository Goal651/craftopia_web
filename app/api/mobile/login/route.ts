import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import dbConnect from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { isAdminEmail } from '@/lib/auth'
import { createMobileTokenResponse } from '@/lib/mobile-auth'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Please enter your password'),
})

/**
 * Mobile login for gallery admins (ADMIN_EMAILS). Artists keep using the website.
 * Returns a signed bearer token the app stores in SecureStore.
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect()
        const body = await request.json()

        const parsed = loginSchema.safeParse(body)
        if (!parsed.success) {
            const first = parsed.error.issues[0]
            return NextResponse.json(
                { error: first?.message || 'Invalid login details' },
                { status: 400 }
            )
        }

        const user = await User.findOne({
            email: parsed.data.email.toLowerCase().trim(),
        })

        if (!user || user.status === 'suspended') {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        if (!isAdminEmail(user.email)) {
            return NextResponse.json(
                { error: 'This account does not have admin access' },
                { status: 403 }
            )
        }

        const hashedPassword = crypto
            .pbkdf2Sync(
                parsed.data.password,
                process.env.AUTH_SALT || 'craftopia-default-salt',
                1000,
                64,
                'sha512'
            )
            .toString('hex')
        if (user.password !== hashedPassword) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        const sessionUser = {
            id: user._id.toString(),
            email: user.email,
            display_name: user.display_name,
            phone_number: user.phone_number,
            role: user.role || 'admin',
        }

        return NextResponse.json(createMobileTokenResponse(sessionUser))
    } catch (error) {
        console.error('Mobile login error:', error)
        return NextResponse.json({ error: 'Failed to sign in. Please try again.' }, { status: 500 })
    }
}
