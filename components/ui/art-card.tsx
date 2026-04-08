"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, Star, Phone, ArrowUpRight, User2, MessageCircle } from "lucide-react"
import { ArtworkRecord, User } from "@/types"
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

interface ArtCardProps {
  artwork: ArtworkRecord
  index?: number
  className?: string
  variant?: string
  showActions?: boolean
  searchQuery?: string
  aspectRatio?: string
}

export function ArtCard({ artwork, index = 0, className }: ArtCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [artistInfo, setArtistInfo] = useState<User | null>(null)
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
      className={cn("group perspective-1000 ", className)}
    >
      <motion.div
        className="relative bg-card/50 backdrop-blur-xl rounded overflow-hidden border border-border/50 shadow-2xl transition-shadow duration-500 hover:shadow-primary/20 h-[28rem] flex flex-col cursor-pointer"
        onClick={() => window.location.href = `/artworks/${artwork.id}`}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/5] flex">
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full h-full"
          >
            <ArtworkImage
              src={artwork.image_url}
              alt="Artwork"
              title="Artwork"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Multiple Images Indicator */}
          {artwork.images && artwork.images.length > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 4-8z"/>
              </svg>
              {artwork.images.length + 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gradient-primary">
                {artwork.price > 0 ? `RWF ${artwork.price.toLocaleString()}` : "Not for Sale"}
              </span>
              {artwork.stock_quantity > 0 ? (
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">
                  {artwork.stock_quantity} in stock
                </span>
              ) : (
                <span className="text-[10px] uppercase tracking-widest text-red-500 font-semibold">
                  Sold Out
                </span>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleContactOwner()
              }}
              className="btn-primary group/btn"
              size="sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
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
              Get in touch with the artist about this artwork
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : artistInfo ? (
            <div className="space-y-6">
              {/* Artist Info */}
              <div className="flex items-center gap-4 p-4 glass rounded">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={artistInfo.avatar_url} alt={artistInfo.display_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {artistInfo.display_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

              </div>

              {/* Bio */}
              {artistInfo.bio && (
                <div className="p-4 glass rounded">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User2 className="w-4 h-4" />
                    About the Artist
                  </h4>
                  <p className="text-sm text-muted-foreground">{artistInfo.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-4 glass rounded space-y-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Telephone:</span>
                    <a
                      href={`tel:${artistInfo.phone_number}`}
                      className="text-primary hover:underline"
                    >
                      {artistInfo.phone_number}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <a
                      href={`mailto:${artistInfo.email}?subject=Inquiry about Artwork`}
                      className="text-primary hover:underline"
                    >
                      {artistInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="btn-primary flex-1"
                >
                  <a href={`tel:${artistInfo.phone_number}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <a 
                    href={`https://wa.me/${artistInfo.phone_number.replace(/\D/g, '')}?text=Hi!%20I'm%20interested%20in%20your%20artwork%20on%20CRAFTOPIA.%20View%20it%20here:%20https://craftopia-arts.vercel.app/artworks/${artwork.id}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <Link href={`/gallery/artist/${artwork.artist_id}`}>
                    <User2 className="w-4 h-4 mr-2" />
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
