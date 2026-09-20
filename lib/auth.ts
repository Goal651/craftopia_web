import { cookies } from "next/headers"
import crypto from "crypto"

/**
 * Lightweight signed-cookie sessions.
 * The cookie only ever holds public profile fields — never the password hash.
 */

export type SessionUser = {
    id: string
    email: string
    display_name: string
    phone_number?: string
    role?: string
}

const COOKIE_NAME = "craftopia_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 1 week

function getSecret(): string {
    return process.env.AUTH_SECRET || "craftopia-local-dev-secret"
}

function signPayload(payload: string): string {
    return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

export function createSessionToken(user: SessionUser): string {
    const payload = Buffer.from(JSON.stringify(user)).toString("base64url")
    return `${payload}.${signPayload(payload)}`
}

export function parseSessionToken(token: string | undefined | null): SessionUser | null {
    if (!token) return null
    const [payload, signature] = token.split(".")
    if (!payload || !signature) return null

    const expected = signPayload(payload)
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

    try {
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser
    } catch {
        return null
    }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
    const jar = await cookies()
    jar.set(COOKIE_NAME, createSessionToken(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE_SECONDS,
        path: "/",
    })
}

export async function clearSessionCookie(): Promise<void> {
    const jar = await cookies()
    jar.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
    const jar = await cookies()
    return parseSessionToken(jar.get(COOKIE_NAME)?.value)
}

/** Email addresses that are always treated as gallery partners/admins. */
export function isAdminEmail(email: string): boolean {
    const list = (process.env.ADMIN_EMAILS || "nsengiyumvasaad2020@gmail.com,bugiriwilson651@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    return list.includes(email.toLowerCase())
}

export function isAdminUser(user: SessionUser | null): boolean {
    if (!user) return false
    return user.role === "admin" || isAdminEmail(user.email)
}
