"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateSafe, getRelativeTime } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArtworkRecord } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { useAuth } from "@/contexts/AuthContext"
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink,
  Palette,
  Frame,
  Tag,
  Clock,
  TrendingUp,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Send,
  ThumbsUp,
  Users,
  Globe,
  Camera,
  Award,
  Sparkles,
  Maximize2,
  ArrowUpRight,
  ArrowRight,
  Phone
} from "lucide-react"
import Head from 'next/head'
import { cn } from "@/lib/utils"
import { ArtworkFullView } from "@/components/ui/artwork-full-view"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
  const [artist, setArtist] = useState<any | null>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<ArtworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewCountUpdated, setViewCountUpdated] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Array<any>>([])
  const [showComments, setShowComments] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const artworkId = Array.isArray(params.id) ? params.id[0] : params.id

  // Initialize view tracking when user is available
  useEffect(() => {
    if (user?.id && artworkId) {
      fetchLikeStatus()
      fetchViewStatus()
    }
  }, [user, artworkId])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/like`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.is_liked)
      }
    } catch (error) {
      console.error('Failed to fetch like status:', error)
    }
  }

  const fetchViewStatus = async () => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/views`)
      if (response.ok) {
        const data = await response.json()
        setViewCountUpdated(data.has_viewed)
      }
    } catch (error) {
      console.error('Failed to fetch view status:', error)
    }
  }

  const fetchArtwork = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/artworks/${artworkId}`)
      if (!response.ok) {
        if (response.status === 404) throw new Error('Artwork not found')
        throw new Error('Failed to fetch artwork')
      }

      const data = await response.json()
      setArtwork(data)

      // Fetch artist info for phone number
      if (data.artist_id) {
        fetchArtist(data.artist_id)
      }

      // Fetch related artworks
      const relatedRes = await fetch(`/api/artworks?category=${data.category}&limit=5`)
      if (relatedRes.ok) {
        const relatedData = await relatedRes.json()
        setRelatedArtworks(relatedData.artworks.filter((a: ArtworkRecord) => a.id !== artworkId).slice(0, 4))
      }

    } catch (err) {
      console.error('Error fetching artwork:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artwork')
    } finally {
      setLoading(false)
    }
  }

  const fetchArtist = async (id: string) => {
    try {
      const response = await fetch(`/api/artists/${id}`)
      if (response.ok) {
        const data = await response.json()
        setArtist(data)
      }
    } catch (error) {
      console.error('Failed to fetch artist profile:', error)
    }
  }

  const incrementViewCount = async () => {
    if (!artwork || viewCountUpdated) return

    try {
      const response = await fetch(`/api/artworks/${artworkId}/views`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setArtwork(prev => prev ? { ...prev, view_count: data.view_count } : null)
        setViewCountUpdated(true)
      } else if (response.status === 401) {
        // Not authenticated, don't track view
        console.log('User not authenticated, skipping view tracking')
      }
    } catch (err) {
      console.warn('Failed to increment view count:', err)
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = 'Amazing Artwork'
    const artist = artwork?.artist_name || 'Talented Artist'
    const description = artwork?.description || `Check out this stunning artwork by ${artist} on Craftopia!`

    switch (platform) {
      case 'twitter':
        const twitterText = `🎨 "${title}" by ${artist} - ${description.substring(0, 100)}... #Art #DigitalArt #Craftopia`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description)}`, '_blank', 'width=580,height=400')
        break
      case 'pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(artwork?.image_url || '')}&description=${encodeURIComponent(description)}`, '_blank', 'width=750,height=550')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=750,height=550')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          setCopiedToClipboard(true)
          setTimeout(() => setCopiedToClipboard(false), 3000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
        break
    }
    setShowShareMenu(false)
  }

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like artworks')
      return
    }

    if (user?.id === artwork?.artist_id) {
      alert('You cannot like your own artwork')
      return
    }

    if (!artworkId) {
      console.error('Artwork ID is not available')
      return
    }

    try {
      const newLikedState = !isLiked
      setIsLiked(newLikedState)

      // Make API call
      const response = await fetch(`/api/artworks/${artworkId}/like`, {
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
        setIsLiked(!newLikedState) // Revert on error
        return
      }
    } catch (error) {
      console.error('Failed to update like:', error)
      setIsLiked(!isLiked) // Revert on error
    }
  }

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      return
    }

    if (!user) {
      alert('Please log in to comment')
      return
    }

    try {
      const response = await fetch(`/api/artworks/${artworkId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment.trim()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const data = await response.json()
      // Add new comment to the beginning of the list
      setComments(prev => [data.comment, ...prev])
      setComment("")

      // Refresh comments list
      fetchComments()
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('Failed to post comment. Please try again.')
    }
  }

  const fetchComments = async () => {
    if (!artworkId) return

    setCommentsLoading(true)
    try {
      const response = await fetch(`/api/artworks/${artworkId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // Fetch comments when showing comments section
  useEffect(() => {
    if (showComments && artworkId) {
      fetchComments()
    }
  }, [showComments, artworkId])

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!artwork) return null

    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "description": artwork.description || `Stunning artwork by ${artwork.artist_name}`,
      "image": artwork.image_url,
      "author": {
        "@type": "Person",
        "name": artwork.artist_name
      },
      "dateCreated": artwork.createdAt,
      "url": window.location.href,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": Math.floor(artwork.view_count * 0.12)
      }
    }
  }

  useEffect(() => {
    if (artworkId) {
      fetchArtwork()
    }
  }, [artworkId])

  useEffect(() => {
    if (artwork && !viewCountUpdated) {
      const timer = setTimeout(incrementViewCount, 2000)
      return () => clearTimeout(timer)
    }
  }, [artwork, viewCountUpdated])

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="aspect-[4/5] w-full bg-muted/50 rounded-2xl" />
            </div>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-10 w-3/4 bg-muted/50 rounded" />
                  <Skeleton className="h-6 w-1/2 bg-muted/50 rounded" />
                </div>
                <Skeleton className="h-32 w-full bg-muted/50 rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full bg-muted/50 rounded" />
                  <Skeleton className="h-24 w-full bg-muted/50 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto px-6 text-center">
          <div className="w-24 h-24 mx-auto glass-strong rounded-full flex items-center justify-center mb-10 text-destructive">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-4 mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {error === 'Artwork not found' ? 'Masterpiece Not Found' : 'Something went wrong'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {error === 'Artwork not found'
                ? "The artistic vision you're seeking remains elusive. It may have been moved or archived."
                : error
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={fetchArtwork} className="btn-primary glow-primary px-8" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
            <Button asChild variant="outline" className="glass border-border hover:bg-muted px-8">
              <Link href="/gallery">Discover More</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const structuredData = generateStructuredData()
  const seoDescription = artwork.description || `Discover this stunning artwork by ${artwork.artist_name}. Explore more amazing digital artworks on Craftopia.`
  const seoImage = artwork.image_url

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{artwork.description}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${artwork.description}, ${artwork.artist_name}, digital art, artwork, craftopia, online gallery, art`} />
        <meta name="author" content={artwork.artist_name} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1500" />
        <meta property="og:site_name" content="Craftopia" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="twitter:description" content={seoDescription} />
        <meta property="twitter:image" content={seoImage} /> 

        {/* Additional SEO */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />

        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-background py-16 sm:py-24">
        <div className="container-modern px-6 lg:px-10">
          {/* Main Content Grid: 2/3 Left, 1/3 Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Artwork Display - 2 Columns */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded overflow-hidden glass border border-border shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <ArtworkImage
                  src={artwork.image_url}
                  alt={artwork.description}
                  title={artwork.description}
                  className="w-full h-auto object-contain mx-auto"
                  priority
                />
              </motion.div>
            </div>

            {/* Artwork Details & Commerce - 1 Column */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge className="bg-primary/5 text-primary border-primary/20 px-3 py-1 uppercase tracking-widest text-[10px] font-black rounded">
                    {artwork.category || "Fine Art"}
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-[1.1]">
                    {artwork.description || "Untitled Creation"}
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created by <span className="text-foreground font-black">{artwork.artist_name}</span>
                  </p>
                </div>

                <div className="prose prose-invert border-t border-border pt-8">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {artwork.description}
                  </p>
                </div>

                {/* Economic Profile Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded border border-border bg-muted/5 p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-3">Amount</span>
                    <span className="text-2xl font-black text-primary">${artwork.price.toLocaleString()}</span>
                  </div>
                  <div className="rounded border border-border bg-muted/5 p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-3">Stock</span>
                    <span className={cn(
                      "text-2xl font-black",
                      artwork.stock_quantity > 0 ? "text-foreground" : "text-destructive"
                    )}>
                      {artwork.stock_quantity > 0 ? artwork.stock_quantity : "Out"}
                    </span>
                  </div>
                </div>

                {/* Primary Interaction Area */}
                <div className="space-y-4 pt-6">
                  {/* Phone Contact - User Requested Primary Action */}
                  <Button asChild size="lg" className="w-full btn-primary h-16 rounded font-black text-base shadow-lg shadow-primary/10">
                    <Link href={artist?.phone_number ? `tel:${artist.phone_number}` : "#"}>
                      <Phone className="w-5 h-5 mr-3" />
                      Contact via Phone
                    </Link>
                  </Button>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 rounded border-border hover:bg-muted font-bold text-xs uppercase tracking-widest"
                      onClick={handleLike}
                    >
                      <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-destructive text-destructive")} />
                      {isLiked ? "Saved" : "Save Piece"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded px-6 border-border hover:bg-muted"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contextual Share Menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-5 rounded border border-border bg-card shadow-2xl mt-4"
                      >
                        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-muted-foreground mb-4">Sharing Options</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'twitter', label: 'X/Twitter', icon: <Globe className="w-4 h-4" /> },
                            { id: 'copy', label: copiedToClipboard ? 'Link Copied' : 'Copy URL', icon: <ExternalLink className="w-4 h-4" /> }
                          ].map(p => (
                            <Button
                              key={p.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(p.id)}
                              className="justify-start gap-3 h-12 px-4 hover:bg-muted rounded"
                            >
                              {p.icon}
                              <span className="text-[10px] font-black uppercase tracking-wider">{p.label}</span>
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Full Screen View */}
      <ArtworkFullView
        src={artwork.image_url}
        alt={artwork.description}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  )
}
