/** Client-safe helpers for session/admin decisions (no server-only imports). */

export function isAdminEmail(email: string): boolean {
    const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "nsengiyumvasaad2020@gmail.com,bugiriwilson651@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    return list.includes(email.toLowerCase())
}

export const SITE = {
    name: "CRAFTOPIA",
    tagline: "Original art from Rwandan artists",
    description:
        "CRAFTOPIA is a curated gallery of original paintings, drawings, sculpture and mixed media by Rwandan artists. Browse the collection, order a piece, and we deliver it to your door.",
    phones: ["+250 788 821 939", "+250 785 244 612"],
    location: "Kigali, Rwanda",
    hours: "Every day, 7 AM – 8 PM (GMT+2)",
}

export function siteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || "https://craftopia-arts.vercel.app").replace(/\/$/, "")
}

export function formatRwf(amount: number): string {
    return `RWF ${amount.toLocaleString()}`
}

export function whatsappLink(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, "")
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
