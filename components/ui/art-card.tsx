"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, Star, Mail, User, MessageSquare, Edit } from "lucide-react"
import { ArtworkRecord } from "@/types"
import { ArtworkImage } from "./artwork-image"
import { Badge } from "./badge"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
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
  const { user } = useAuth()
  const isDashboard = variant === "dashboard"
  const isCompact = variant === "compact"
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [artistInfo, setArtistInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [viewCount, setViewCount] = useState(artwork.view_count)
  const [hasViewed, setHasViewed] = useState(false)

  // Check if current user is the owner of this artwork
  const isOwner = user && artwork.artist_id === user.id

  // Fetch like status when user is available
  useEffect(() => {
    if (user?.id && !isOwner) {
      fetchLikeStatus()
      fetchViewStatus()
    }
  }, [user, artwork.id, isOwner])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/artworks/${artwork.id}/like`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.is_liked)
        setLikeCount(data.like_count)
      }
    } catch (error) {
      console.error('Failed to fetch like status:', error)
    }
  }

  const fetchViewStatus = async () => {
    try {
      const response = await fetch(`/api/artworks/${artwork.id}/views`)
      if (response.ok) {
        const data = await response.json()
        setHasViewed(data.has_viewed)
        setViewCount(data.view_count)
      }
    } catch (error) {
      console.error('Failed to fetch view status:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: index * 0.1 }
    }
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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Prevent card click
    
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to like artworks')
      return
    }

    if (isOwner) {
      alert('You cannot like your own artwork')
      return
    }

    try {
      // Update local state immediately for better UX
      const newLikedState = !isLiked
      setIsLiked(newLikedState)
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)

      // Make API call to update like status
      const response = await fetch(`/api/artworks/${artwork.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liked: newLikedState }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error === 'Cannot like your own artwork') {
          alert('You cannot like your own artwork')
        } else {
          throw new Error('Failed to update like status')
        }
        // Revert state on error
        setIsLiked(!newLikedState)
        setLikeCount(prev => newLikedState ? prev - 1 : prev + 1)
        return
      }

      const data = await response.json()
      // Update like count with server response
      setLikeCount(data.like_count)
    } catch (error) {
      console.error('Failed to update like:', error)
      // Revert state on error - use the opposite of current state
      setIsLiked(isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    }
  }

  const handleView = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Prevent card click
    
    if (!user) {
      // For non-logged in users, just navigate to the artwork
      if (typeof window !== 'undefined') {
        window.location.href = `/artworks/${artwork.id}`
      }
      return
    }

    // Check if user has already viewed this artwork
    if (!hasViewed) {
      try {
        // Update local state immediately for better UX
        setViewCount(prev => prev + 1)
        setHasViewed(true)

        // Make API call to track view
        const response = await fetch(`/api/artworks/${artwork.id}/views`, {
          method: 'POST',
        })

        if (!response.ok) {
          // If already viewed, just get current count
          if (response.status === 401) {
            // Not authenticated, just navigate
            if (typeof window !== 'undefined') {
              window.location.href = `/artworks/${artwork.id}`
            }
            return
          }
          throw new Error('Failed to track view')
        }

        const data = await response.json()
        // Update view count with server response
        setViewCount(data.view_count)
        setHasViewed(data.already_viewed)
      } catch (error) {
        console.error('Failed to track view:', error)
        // Revert state on error
        setViewCount(prev => prev - 1)
        setHasViewed(false)
      }
    }

    // Navigate to artwork detail page
    if (typeof window !== 'undefined') {
      window.location.href = `/artworks/${artwork.id}`
    }
  }

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/artworks/${artwork.id}`
    }
  }

  const handleEdit = () => {
    // Navigate to upload page with edit mode - we'll need to modify this later
    // For now, let's go to upload page and handle editing there
    if (typeof window !== 'undefined') {
      window.location.href = `/upload?edit=${artwork.id}`
    }
  }

  return (
    <motion.div
      key={artwork.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div 
        className="glass-enhanced rounded-xl sm:rounded-2xl overflow-hidden border-0 card-hover text-md h-full flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative overflow-hidden">
          <ArtworkImage
            src={artwork.image_url}
            alt={artwork.title}
            title={artwork.title}
            category={artwork.category}
            fill
            className="w-full h-48 sm:h-56 md:h-64 lg:h-72 transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action Buttons */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              className={`glass w-8 h-8 sm:w-10 sm:h-10 hover:bg-white/20 transition-colors ${
                isLiked ? 'bg-red-500/20 hover:bg-red-500/30' : ''
              }`} 
              aria-label="Add to wishlist"
              onClick={handleLike}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              className="glass w-8 h-8 sm:w-10 sm:h-10 hover:bg-white/20 transition-colors" 
              aria-label="Quick view"
              onClick={handleView}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Category Badge */}
          <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-blue-500 to-green-500 text-white border-0 text-xs sm:text-sm px-2 sm:px-3 py-1">
            {artwork.category}
          </Badge>

          {/* Rating (Simulated if missing) */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-1 glass px-2 sm:px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-green-400 text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-white">{(4.5 + (artwork.view_count % 5) / 10).toFixed(1)}</span>
            <span className="text-xs text-white/70">({likeCount})</span>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors truncate">
                {artwork.title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate">by {artwork.artist_name}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0 ml-2">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{viewCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-4">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-gradient-primary">
              Gallery Piece
            </span>

            {showContactButton && (
              isOwner ? (
                <Button
                  onClick={handleEdit}
                  className="btn-primary text-xs sm:text-sm md:text-base"
                  size="sm"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit Artwork</span>
                </Button>
              ) : (
                <Button
                  onClick={handleContactOwner}
                  className="btn-primary text-xs sm:text-sm md:text-base"
                  size="sm"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline sm:hidden">Contact</span>
                  <span className="hidden sm:inline">Contact Artist</span>
                </Button>
              )
            )}
          </div>
        </div>
      </div>

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
                  <span className="text-xs text-muted-foreground">
                    {new Date(artwork.createdAt || artwork.created_at || Date.now()).toLocaleDateString()}
                  </span>
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
