"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, Star, Mail } from "lucide-react"
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
  showContactButton?: boolean
}

export function ArtCard({
  artwork,
  index = 0,
  searchQuery = "",
  variant = "default",
  className,
  showActions = true,
  aspectRatio = "3/4",
  showContactButton = true,
}: ArtCardProps) {
  const isDashboard = variant === "dashboard"
  const isCompact = variant === "compact"

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: index * 0.1 }
    }
  }

  const handleContactOwner = (artworkTitle: string, artist: string) => {
    window.location.href = `/contact?artwork=${encodeURIComponent(artworkTitle)}&artist=${encodeURIComponent(artist)}`
  }

  return (
    <motion.div
      key={artwork.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-52"
    >
      <Card className="glass-enhanced rounded-2xl overflow-hidden border-0 card-hover text-md"
      >
        <div className="relative overflow-hidden">
          <ArtworkImage
            src={artwork.image_url}
            alt={artwork.title}
            title={artwork.title}
            category={artwork.category}
            fill
            className="w-full h-72 transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="icon" className="glass w-10 h-10 hover:bg-white/20" aria-label="Add to wishlist">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="icon" className="glass w-10 h-10 hover:bg-white/20" aria-label="Quick view">
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Badge */}
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-green-500 text-white border-0">
            {artwork.category}
          </Badge>

          {/* Rating (Simulated if missing) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 glass px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="w-4 h-4 fill-green-400 text-green-400" />
            <span className="text-sm font-medium text-white">{(4.5 + (artwork.view_count % 5) / 10).toFixed(1)}</span>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                {artwork.title}
              </h3>
              <p className="text-muted-foreground">by {artwork.artist_name}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{artwork.view_count}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gradient-primary">
              Gallery Piece
            </span>

            <Button
              onClick={() => handleContactOwner(artwork.title, artwork.artist_name)}
              className="btn-primary"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Artist
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
