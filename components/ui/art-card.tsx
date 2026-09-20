"use client"

import Link from "next/link"
import { ArtworkRecord } from "@/types"
import { ArtworkImage } from "./artwork-image"
import { cn } from "@/lib/utils"
import { formatRwf } from "@/lib/auth-client"
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
  const title = artwork.title && artwork.title !== "Artwork" ? artwork.title : "Untitled"

  return (
    <Link
      href={`/artworks/${artwork.id}`}
      className={cn(
        "group block bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/5] bg-muted/20">
        <ArtworkImage
          src={artwork.image_url}
          alt={`${title} by ${artwork.artist_name}`}
          title={title}
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

      {/* Content */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-display text-base font-semibold text-foreground truncate group-hover:text-secondary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">by {artwork.artist_name}</p>
        <div className="flex items-center justify-between pt-1.5">
          <span className="text-sm font-semibold text-foreground">
            {artwork.price > 0 ? formatRwf(artwork.price) : "Ask for price"}
          </span>
          {artwork.stock_quantity > 0 ? (
            <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
              Available
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-destructive font-semibold">
              Sold
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
