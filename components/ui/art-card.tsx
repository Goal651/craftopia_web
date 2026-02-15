"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, ShoppingCart } from "lucide-react"
import { ArtworkRecord } from "@/types"
import { ArtworkImage } from "./artwork-image"
import { Badge } from "./badge"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { SearchHighlight } from "./search-highlight"
import { cn } from "@/lib/utils"

interface ArtCardProps {
  artwork: ArtworkRecord
  index?: number
  searchQuery?: string
  variant?: "default" | "compact" | "dashboard"
  className?: string
  showActions?: boolean
  aspectRatio?: "3/4" | "square" | "video"
}

export function ArtCard({
  artwork,
  index = 0,
  searchQuery = "",
  variant = "default",
  className,
  showActions = true,
  aspectRatio = "3/4",
}: ArtCardProps) {
  const isDashboard = variant === "dashboard"
  const isCompact = variant === "compact"

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, delay: index * 0.05 }
    }
  }

  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "group h-full cursor-pointer overflow-hidden border-border/50 glass-card card-hover bg-card/30",
        isDashboard && "bg-card/10 border-white/5 shadow-none"
      )}>
        <Link href={`/gallery/${artwork.id}`}>
          <div className={cn(
            "relative overflow-hidden",
            aspectRatio === "3/4" && "aspect-[3/4]",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "video" && "aspect-video"
          )}>
            <ArtworkImage
              src={artwork.image_url}
              alt={artwork.title}
              title={artwork.title}
              category={artwork.category}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              variant="galleryCard"
              enableOptimizations={true}
              aspectRatio={aspectRatio === "3/4" ? "3/4" : "1/1"}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {showActions && !isCompact && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <Button size="sm" className="btn-primary shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Badges & Stats */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge variant="secondary" className="bg-background/60 backdrop-blur-md text-xs border-white/10">
                {artwork.category.replace('-', ' ')}
              </Badge>
            </div>

            {artwork.view_count > 0 && !isCompact && (
              <div className="absolute top-3 right-3 glass-strong rounded-full px-2 py-1 border-white/10">
                <div className="flex items-center gap-1 text-[10px] text-foreground font-medium">
                  <Eye className="w-3 h-3 text-primary" />
                  <span>{artwork.view_count}</span>
                </div>
              </div>
            )}
          </div>

          <CardContent className={cn("p-4", isCompact && "p-3")}>
            <div className="space-y-2">
              <h3 className={cn(
                "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1",
                isCompact ? "text-sm" : "text-lg"
              )}>
                <SearchHighlight
                  text={artwork.title}
                  searchTerm={searchQuery}
                />
              </h3>
              
              {!isCompact && (
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  <SearchHighlight
                    text={artwork.description || 'No description provided'}
                    searchTerm={searchQuery}
                  />
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <div 
                  className="text-xs text-primary hover:text-primary/80 transition-colors truncate max-w-[60%]"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.href = `/gallery/artist/${artwork.artist_id}`
                  }}
                >
                  by <SearchHighlight
                    text={artwork.artist_name}
                    searchTerm={searchQuery}
                    className="text-xs text-primary font-medium"
                  />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {artwork.price ? `$${artwork.price.toLocaleString()}` : 'Price on request'}
                </span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}
