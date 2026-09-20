import type { MetadataRoute } from "next"
import { siteUrl } from "@/lib/auth-client"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/profile", "/my-artworks", "/upload", "/api/"],
            },
        ],
        sitemap: `${siteUrl()}/sitemap.xml`,
    }
}
