import type { Metadata } from "next"
import { ArtworkDetailClient } from "./artwork-detail-client"
import { siteUrl, SITE } from "@/lib/auth-client"

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params

    let artwork: any = null
    try {
        const { default: dbConnect } = await import("@/lib/db/mongodb")
        const { default: Artwork } = await import("@/lib/db/models/Artwork")
        await dbConnect()
        artwork = await Artwork.findById(id).lean()
    } catch {
        artwork = null
    }

    if (!artwork) {
        return { title: `Artwork not found` }
    }

    // Titles and uploader names are hidden publicly, so metadata stays generic.
    const title = "Original Artwork"
    const url = `${siteUrl()}/artworks/${id}`
    const description = `${title} from the ${SITE.name} gallery. ${artwork.description || ""}`
        .trim()
        .slice(0, 200)

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            images: artwork.image_url ? [{ url: artwork.image_url }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: artwork.image_url ? [artwork.image_url] : undefined,
        },
        alternates: { canonical: url },
    }
}

export default async function ArtworkDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <ArtworkDetailClient artworkId={id} />
}
