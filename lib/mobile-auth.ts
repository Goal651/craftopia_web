import { NextRequest } from "next/server"
import { createSessionToken, parseSessionToken, type SessionUser } from "@/lib/auth"

/**
 * Token auth for the React Native app (Expo Go can't use httpOnly cookies).
 * Same signed payload format as the cookie session, just transported via the
 * `Authorization: Bearer <token>` header.
 */

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function createMobileToken(user: SessionUser): string {
    return createSessionToken(user)
}

export function createMobileTokenResponse(user: SessionUser) {
    return {
        token: createMobileToken(user),
        expiresIn: TOKEN_MAX_AGE_SECONDS,
        user,
    }
}

/** Read the session from an `Authorization: Bearer` header (mobile clients). */
export function getMobileSession(request: NextRequest): SessionUser | null {
    const header = request.headers.get("authorization") || request.headers.get("Authorization")
    if (!header) return null
    const [scheme, token] = header.split(" ")
    if (!token || scheme.toLowerCase() !== "bearer") return null
    return parseSessionToken(token.trim())
}

export function unauthorized() {
    return Response.json({ error: "Authentication required" }, { status: 401 })
}

export function forbidden() {
    return Response.json({ error: "Not allowed" }, { status: 403 })
}
