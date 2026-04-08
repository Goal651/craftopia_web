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
  ArrowRight
} from "lucide-react"
import Head from 'next/head'
import { cn } from "@/lib/utils"
import { ArtworkFullView } from "@/components/ui/artwork-full-view"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
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

      <div className="min-h-screen bg-background">
        {/* Cinema Hero Section */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          <div className="container-modern px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative group cursor-zoom-in max-w-7xl mx-auto"
              onClick={() => setIsFullscreen(true)}
            >
              <div className="relative rounded-[2rem] overflow-hidden glass-strong border border-border/50 shadow-[0_48px_100px_-20px_rgba(0,0,0,0.6)] transition-all duration-700 hover:shadow-primary/20">
                <ArtworkImage
                  src={artwork.image_url}
                  alt={artwork.description}
                  title={artwork.description}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                  priority
                />
                
                {/* Immersive Inspect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-center pb-12 pointer-events-none">
                  <motion.div 
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-4 rounded-full shadow-2xl"
                  >
                    <Maximize2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-black uppercase tracking-[0.25em] text-white">Full View</span>
                  </motion.div>
                </div>

                {/* Floating Action Float */}
                <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "w-14 h-14 rounded-full glass-strong border border-white/10 backdrop-blur-3xl shadow-2xl transition-all duration-500",
                      isLiked ? "text-red-500 bg-red-500/20 border-red-500/30" : "text-white hover:text-red-400 hover:bg-white/10"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike()
                    }}
                  >
                    <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-14 h-14 rounded-full glass-strong border border-white/10 backdrop-blur-3xl shadow-2xl text-white transition-all duration-500 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowShareMenu(!showShareMenu)
                    }}
                  >
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>

                {/* Share Dropdown */}
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-24 right-8 glass-strong border border-white/20 rounded-2xl p-4 z-30 min-w-[240px] shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
                    >
                      <div className="space-y-2">
                        {[
                          { id: 'twitter', label: 'X / Twitter', icon: <Globe className="w-4 h-4" /> },
                          { id: 'facebook', label: 'Facebook', icon: <Users className="w-4 h-4" /> },
                          { id: 'copy', label: copiedToClipboard ? 'Link Copied!' : 'Copy Link', icon: <ExternalLink className="w-4 h-4" /> }
                        ].map(p => (
                          <Button
                            key={p.id}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShare(p.id)
                            }}
                            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 gap-3 font-medium"
                          >
                            {p.icon}
                            {p.label}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Info & Engagement Section */}
        <section className="pb-24">
          <div className="container-modern px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Primary Content (8 columns) */}
              <div className="lg:col-span-8 space-y-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-5 py-2 uppercase tracking-widest text-[11px] font-black shadow-lg shadow-primary/5">
                        {artwork.category || "Fine Art"}
                      </Badge>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        {artwork.view_count.toLocaleString()} Global Views
                      </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[1] max-w-4xl">
                      {artwork.description || "Experimental Vision"}
                    </h1>
                  </div>

                  <div className="flex items-center gap-6 p-1 pr-6 bg-muted/10 border border-border/50 rounded-full w-fit group hover:border-primary/50 transition-all duration-500">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-sm font-black text-white shadow-xl">
                      {artwork.artist_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Mastermind</p>
                      <Link
                        href={`/gallery/artist/${artwork.artist_id}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {artwork.artist_name}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                      {artwork.description}
                    </p>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="pt-12 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <Palette className="w-4 h-4" /> Technical Profile
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Medium', value: artwork.medium || 'Digital' },
                        { label: 'Dimensions', value: artwork.dimensions || 'Variable' },
                        { label: 'Edition', value: artwork.stock_quantity > 0 ? 'Limited' : 'Collection' }
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/10">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-bold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Acquisition Details
                    </h4>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center py-2 border-b border-border/10">
                          <span className="text-sm text-muted-foreground">Released</span>
                          <span className="text-sm font-bold text-foreground">{formatDateSafe(artwork.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/10">
                          <span className="text-sm text-muted-foreground">Availability</span>
                          <span className={cn("text-sm font-black", artwork.stock_quantity > 0 ? "text-emerald-500" : "text-red-500")}>
                            {artwork.stock_quantity > 0 ? "Instant Download" : "Vaulted"}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-col sm:flex-row gap-4 pt-12">
                   <Button asChild size="lg" className="h-16 px-12 text-lg font-black bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform rounded-2xl flex-1">
                      <Link href={`mailto:${artwork.artist_id}?subject=Inquiry about ${artwork.description}`}>
                        Secure Acquisition at ${artwork.price.toLocaleString()}
                        <ArrowUpRight className="ml-2 w-5 h-5" />
                      </Link>
                   </Button>
                   <Button variant="outline" size="lg" className="h-16 px-8 glass-strong border-border/50 text-foreground hover:bg-muted/20 rounded-2xl transition-all" onClick={handleLike}>
                      <Heart className={cn("w-5 h-5 mr-2", isLiked && "fill-red-500 text-red-500")} />
                      {isLiked ? 'In Collection' : 'Add to Wishlist'}
                   </Button>
                </div>
              </div>

              {/* Sidebar / Comments (4 columns) */}
              <div className="lg:col-span-4 space-y-12">
                 <div className="glass-strong border border-border/50 rounded-3xl p-8 space-y-8 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black tracking-tight">Community</h3>
                       <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-6">
                       <div className="space-y-4">
                          <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Drop a thought..."
                            className="w-full bg-muted/5 p-4 rounded-2xl border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-all resize-none h-32"
                          />
                          <Button onClick={handleCommentSubmit} disabled={!comment.trim()} className="w-full btn-primary h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10">
                             Send Pulse
                             <Send className="ml-2 w-3.5 h-3.5" />
                          </Button>
                       </div>

                       <div className="h-px bg-border/30" />

                       <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                           {comments.length > 0 ? comments.map(c => (
                             <div key={c._id} className="space-y-2 group">
                                <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[8px] font-black uppercase">
                                      {c.user_id?.display_name?.charAt(0) || 'A'}
                                   </div>
                                   <span className="text-xs font-bold text-foreground/80">{c.user_id?.display_name || 'Anonymous'}</span>
                                   <span className="text-[10px] text-muted-foreground ml-auto">{getRelativeTime(c.created_at)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-9">{c.content}</p>
                             </div>
                           )) : (
                             <div className="text-center py-12 space-y-3 opacity-30">
                                <Sparkles className="w-8 h-8 mx-auto text-primary" />
                                <p className="text-xs uppercase tracking-[0.2em] font-black">Be the first to pulse</p>
                             </div>
                           )}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Creations Section */}
        {relatedArtworks.length > 0 && (
          <section className="py-24 border-t border-border/20 bg-muted/5">
            <div className="container-modern px-6 lg:px-10">
              <div className="mb-16 flex items-end justify-between">
                <div className="space-y-2">
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Discover More</p>
                   <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Related <span className="text-gradient-primary">Creations</span></h2>
                </div>
                <Button asChild variant="ghost" className="hidden md:flex text-muted-foreground hover:text-primary">
                   <Link href="/gallery" className="flex items-center gap-2">View All Collection <ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedArtworks.map((art, i) => (
                  <motion.div
                    key={art.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/artworks/${art.id}`}>
                      <div className="group space-y-4">
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden glass border border-border/50 shadow-xl transition-all duration-500 group-hover:shadow-primary/10 group-hover:border-primary/20">
                           <ArtworkImage src={art.image_url} alt={art.description} title={art.description} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="px-2">
                           <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{art.description}</h4>
                           <p className="text-sm text-muted-foreground">by {art.artist_name}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <ArtworkFullView
        src={artwork.image_url}
        alt={artwork.description}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  )
}
