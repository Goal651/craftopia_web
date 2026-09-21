"use client"

import Link from "next/link"
import { ArtworkRecord } from "@/types"
import { ArtworkImage } from "./artwork-image"
import { cn } from "@/lib/utils"
import { Images } from "lucide-react"

interface ArtCardProps {
  artwork: ArtworkRecord
  index?: number
  className?: string
  variant?: string
  showActions?: boolean
  searchQuery?: string
  aspectRatio?: string
}

export function ArtCard({ artwork, className }: ArtCardProps) {
  // Titles and uploader names are not shown publicly.
  return (
    <Link
      href={`/artworks/${artwork.id}`}
      className={cn(
        "group block bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Framed image */}
      <div className="p-2.5 pb-0">
        <div className="relative overflow-hidden rounded-md aspect-[4/5] bg-muted/20">
        <ArtworkImage
          src={artwork.image_url}
          alt="Original artwork"
          title="Original Artwork"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Multiple images indicator */}
        {artwork.images && artwork.images.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <Images className="w-3 h-3" />
            {artwork.images.length + 1}
          </div>
        )}
        {/* Sold out overlay */}
        {artwork.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-foreground bg-card border border-border rounded px-3 py-1.5">
              Sold
            </span>
          </div>
        )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-2.5 pb-4 space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {(artwork.category || "Artwork").replace(/-/g, " ")}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Ask for price
          </span>
          {artwork.stock_quantity > 0 ? (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Available
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-destructive font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" aria-hidden="true" />
              Sold
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
