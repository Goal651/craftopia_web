"use server"

import dbConnect from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import {
    setSessionCookie,
    clearSessionCookie,
    getSession,
    type SessionUser,
} from "@/lib/auth"
import crypto from "crypto"

// Salt for password hashing — override with AUTH_SALT in .env
const SALT = process.env.AUTH_SALT || "craftopia-default-salt"

const hashPassword = (password: string) => {
    return crypto.pbkdf2Sync(password, SALT, 1000, 64, "sha512").toString("hex")
}

const toSessionUser = (user: any): SessionUser => ({
    id: user._id.toString(),
    email: user.email,
    display_name: user.display_name,
    phone_number: user.phone_number,
    role: user.role,
})

export async function signInAction(email: string, password: string) {
    try {
        await dbConnect()
        const user = await User.findOne({ email: email.toLowerCase().trim() })

        if (!user) {
            return { error: "Invalid email or password" }
        }

        if (user.status === "suspended") {
            return { error: "This account has been suspended" }
        }

        const hashedPassword = hashPassword(password)
        if (user.password !== hashedPassword) {
            return { error: "Invalid email or password" }
        }

        const sessionUser = toSessionUser(user)
        await setSessionCookie(sessionUser)

        return { success: true, user: sessionUser }
    } catch (error) {
        console.error("Sign in error:", error)
        return { error: "Failed to sign in. Please try again." }
    }
}

export async function signOutAction() {
    await clearSessionCookie()
    return { success: true }
}

export async function getSessionAction(): Promise<SessionUser | null> {
    return getSession()
}

export async function updateProfileAction(displayName: string, bio?: string) {
    try {
        const session = await getSession()
        if (!session) return { error: "Not authenticated" }

        await dbConnect()
        const updatedUser = await User.findByIdAndUpdate(
            session.id,
            { display_name: displayName, bio: bio || "" },
            { new: true }
        )

        if (!updatedUser) return { error: "User not found" }

        const sessionUser = toSessionUser(updatedUser)
        await setSessionCookie(sessionUser)

        return { success: true, user: sessionUser }
    } catch (error) {
        console.error("Update profile error:", error)
        return { error: "Failed to update profile" }
    }
}
