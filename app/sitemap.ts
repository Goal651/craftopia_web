import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/auth-client"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = siteUrl()

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: base, changeFrequency: "weekly", priority: 1 },
        { url: `${base}/artworks`, changeFrequency: "daily", priority: 0.9 },
        { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ]

    let artworkRoutes: MetadataRoute.Sitemap = []
    try {
        const { default: dbConnect } = await import("@/lib/db/mongodb")
        const { default: Artwork } = await import("@/lib/db/models/Artwork")
        await dbConnect()
        const artworks = await Artwork.find({})
            .select("id updatedAt updated_at")
            .limit(500)
            .lean()
        artworkRoutes = artworks.map((a: any) => ({
            url: `${base}/artworks/${a._id.toString()}`,
            lastModified: a.updatedAt || a.updated_at || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }))
    } catch {
        // Sitemap still returns static routes if the DB is unreachable
    }

    return [...staticRoutes, ...artworkRoutes]
}
