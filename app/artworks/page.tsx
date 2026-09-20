import type { Metadata } from "next"
import { Suspense } from "react"
import { ArtworksBrowser } from "./artworks-browser"

export const metadata: Metadata = {
    title: "Gallery — Browse Original Artworks",
    description:
        "Browse original paintings, drawings, digital art, photography and sculpture by Rwandan artists. Filter by category and price, order online, delivered to your door.",
}

export default function ArtworksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ArtworksBrowser />
        </Suspense>
    )
}
