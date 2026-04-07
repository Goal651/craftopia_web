"use server"

import dbConnect from "@/lib/db/mongodb"
import User from "@/lib/db/models/User"
import { cookies } from "next/headers"
import crypto from "crypto"

// Simple salt for hashing - in a real app this should be in .env
const SALT = process.env.AUTH_SALT || "craftopia-default-salt"

const hashPassword = (password: string) => {
    return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex')
}

export async function signInAction(email: string, password: string) {
    try {
        await dbConnect()
        const user = await User.findOne({ email })

        if (!user) {
            return { error: "User not found" }
        }

        const hashedPassword = hashPassword(password)
        if (user.password !== hashedPassword) {
            return { error: "Invalid credentials" }
        }
        const sessionUser = {
            ...user._doc,
            id: user._id.toString()
        }



        const cookies_data = await cookies()

        cookies_data.set("session", JSON.stringify(sessionUser), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        })

        return { success: true, user: sessionUser }
    } catch (error) {
        console.error("Sign in error:", error)
        return { error: "Failed to sign in. Please try again." }
    }
}

export async function signUpAction(email: string, password: string, displayName: string, phoneNumber: string) {
    try {
        await dbConnect()
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return { error: "User already exists" }
        }

        const hashedPassword = hashPassword(password)
        const user = await User.create({
            email,
            phone_number: phoneNumber,
            password: hashedPassword,
            display_name: displayName,
        })

        const sessionUser = {
            ...user._doc,
            id: user._id.toString()
        }
        const cookies_data = await cookies()

        cookies_data.set("session", JSON.stringify(sessionUser), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        })

        return { success: true, user: sessionUser }
    } catch (error) {
        console.error("Sign up error:", error)
        return { error: "Failed to create account. Please try again." }
    }
}

export async function signOutAction() {
    const cookies_data = await cookies()
    cookies_data.delete("session")
    return { success: true }
}

export async function getSessionAction() {
    const cookies_data = await cookies()
    const session = cookies_data.get("session")
    if (!session) return null
    try {
        return JSON.parse(session.value)
    } catch {
        return null
    }
}

export async function updateProfileAction(displayName: string, bio?: string) {
    try {
        const session = await getSessionAction()
        if (!session) return { error: "Not authenticated" }

        await dbConnect()
        const updatedUser = await User.findByIdAndUpdate(
            session.id,
            { display_name: displayName, bio: bio || "" },
            { new: true }
        )

        if (!updatedUser) return { error: "User not found" }
        const sessionUser = {
            ...updatedUser.toObject(),
            id: updatedUser.toObject().id.toString()
        }
  
        const cookies_data = await cookies()
        cookies_data.set("session", JSON.stringify(sessionUser), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        })

        return { success: true, user: sessionUser }
    } catch (error) {
        console.error("Update profile error:", error)
        return { error: "Failed to update profile" }
    }
}
