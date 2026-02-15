"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, Star, Mail, ArrowUpRight, User } from "lucide-react"
import { ArtworkRecord } from "@/types"
import { ArtworkImage } from "./artwork-image"
import { Badge } from "./badge"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

interface PremiumArtCardProps {
  artwork: ArtworkRecord
  index?: number
  className?: string
}

export function PremiumArtCard({ artwork, index = 0, className }: PremiumArtCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [artistInfo, setArtistInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleContactOwner = async () => {
    setShowContactDialog(true)
    if (!artistInfo && artwork.artist_id) {
      setLoading(true)
      try {
        const response = await fetch(`/api/artists/${artwork.artist_id}`)
        if (response.ok) {
          const data = await response.json()
          setArtistInfo(data)
        }
      } catch (error) {
        console.error('Failed to fetch artist info:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn("group perspective-1000", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-shadow duration-500 hover:shadow-primary/20 h-full flex flex-col"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4]">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full h-full"
          >
            <ArtworkImage
              src={artwork.image_url}
              alt={artwork.title}
              title={artwork.title}
              category={artwork.category}
              fill
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Gradient Overlay */}
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-lg">
              {artwork.category}
            </Badge>
          </div>

          {/* Quick Actions */}
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute top-4 right-4 flex flex-col gap-2 z-10"
          >
            <Button
              size="icon"
              className="bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg h-10 w-10"
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="bg-background/90 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg h-10 w-10"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* View Count */}
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-10"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{artwork.view_count}</span>
          </motion.div>

          {/* Rating */}
          <motion.div
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute bottom-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-10"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{(4.5 + (artwork.view_count % 5) / 10).toFixed(1)}</span>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <Link href={`/artworks/${artwork.id}`} className="group/link">
              <h3 className="text-xl font-bold mb-2 group-hover/link:text-primary transition-colors line-clamp-2">
                {artwork.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">by {artwork.artist_name}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <span className="text-2xl font-bold text-gradient-primary">
                Gallery
              </span>
            </div>
            <Button
              onClick={handleContactOwner}
              className="btn-primary group/btn"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
              <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Button>
          </div>
        </div>

        {/* 3D Effect Shine */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"
          style={{
            transform: "translateZ(50px)"
          }}
        />
      </motion.div>

      {/* Contact Artist Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="glass-strong border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Artist</DialogTitle>
            <DialogDescription>
              Get in touch with the artist about "{artwork.title}"
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : artistInfo ? (
            <div className="space-y-6">
              {/* Artist Info */}
              <div className="flex items-center gap-4 p-4 glass rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={artistInfo.avatar_url} alt={artistInfo.display_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {artistInfo.display_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{artistInfo.display_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {artistInfo.artwork_count || 0} artworks • {artistInfo.total_views || 0} total views
                  </p>
                </div>
              </div>

              {/* Bio */}
              {artistInfo.bio && (
                <div className="p-4 glass rounded-xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    About the Artist
                  </h4>
                  <p className="text-sm text-muted-foreground">{artistInfo.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-4 glass rounded-xl space-y-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <a 
                      href={`mailto:${artistInfo.email}?subject=Inquiry about "${artwork.title}"`}
                      className="text-primary hover:underline"
                    >
                      {artistInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  asChild
                  className="btn-primary flex-1"
                >
                  <a href={`mailto:${artistInfo.email}?subject=Inquiry about "${artwork.title}"`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <Link href={`/gallery/artist/${artwork.artist_id}`}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load artist information
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
