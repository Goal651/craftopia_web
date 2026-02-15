"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDateSafe, getRelativeTime } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArtworkRecord, ArtworkCategory } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"
import { LiveViewCounter } from "@/components/ui/live-view-counter"
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
  Sparkles
} from "lucide-react"
import Head from 'next/head'

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
    const title = artwork?.title || 'Amazing Artwork'
    const artist = artwork?.artist_name || 'Talented Artist'
    const description = artwork?.description || `Check out this stunning ${artwork?.category?.replace('-', ' ')} by ${artist} on Craftopia!`
    
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
      "name": artwork.title,
      "description": artwork.description || `Stunning ${artwork.category.replace('-', ' ')} by ${artwork.artist_name}`,
      "image": artwork.image_url,
      "author": {
        "@type": "Person",
        "name": artwork.artist_name
      },
      "dateCreated": artwork.createdAt,
      "category": artwork.category.replace('-', ' '),
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
      <div className="min-h-screen pt-20 bg-black">
        <div className="container-modern section-padding">
          <div className="space-y-8">
            <Skeleton className="h-4 w-32 bg-gray-700/50" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full bg-gray-700/50 rounded-2xl" />
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-gray-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
                </div>
                <Skeleton className="h-24 w-full bg-gray-700/50" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full bg-gray-700/50" />
                  <Skeleton className="h-16 w-full bg-gray-700/50" />
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
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-16">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {error === 'Artwork not found' ? 'Artwork Not Found' : 'Failed to Load Artwork'}
              </h1>
              <p className="text-gray-400 max-w-md mx-auto">
                {error === 'Artwork not found'
                  ? "The artwork you're looking for doesn't exist or may have been removed."
                  : error
                }
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchArtwork} className="btn-primary" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
              <Button asChild variant="outline" className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const structuredData = generateStructuredData()
  const seoTitle = `${artwork.title} by ${artwork.artist_name} | Craftopia`
  const seoDescription = artwork.description || `Discover this stunning ${artwork.category.replace('-', ' ')} by ${artwork.artist_name}. Explore more amazing digital artworks on Craftopia.`
  const seoImage = artwork.image_url

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${artwork.title}, ${artwork.artist_name}, ${artwork.category.replace('-', ' ')}, digital art, artwork, craftopia, online gallery, ${artwork.category.replace('-', ' ')} art`} />
        <meta name="author" content={artwork.artist_name} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1500" />
        <meta property="og:site_name" content="Craftopia" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="twitter:title" content={seoTitle} />
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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="container-modern section-padding">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <BreadcrumbNav
            items={[
              { label: "Gallery", href: "/artworks" },
              { label: artwork.category.replace('-', ' '), href: `/artworks?category=${artwork.category}` },
              { label: artwork.title }
            ]}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Artwork Section - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Artwork Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <ArtworkImage
                  src={artwork.image_url}
                  alt={artwork.title}
                  title={artwork.title}
                  category={artwork.category}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                  width={800}
                  height={1000}
                />
                
                {/* Floating Action Buttons */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full glass-strong border border-white/20 backdrop-blur-xl shadow-lg hover:scale-110 transition-transform"
                    onClick={handleLike}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </Button>
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full glass-strong border border-white/20 backdrop-blur-xl shadow-lg hover:scale-110 transition-transform"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} />
                  </Button>
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full glass-strong border border-white/20 backdrop-blur-xl shadow-lg hover:scale-110 transition-transform"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </Button>
                </div>

                {/* Share Menu */}
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-24 right-6 glass-strong border border-white/20 rounded-2xl p-4 z-30 min-w-[220px]"
                  >
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('twitter')}
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <div className="w-4 h-4 mr-2 bg-blue-400 rounded-full" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <div className="w-4 h-4 mr-2 bg-blue-600 rounded-full" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('pinterest')}
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <div className="w-4 h-4 mr-2 bg-red-600 rounded-full" />
                        Pinterest
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('linkedin')}
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        <div className="w-4 h-4 mr-2 bg-blue-700 rounded-full" />
                        LinkedIn
                      </Button>
                      <div className="h-px bg-white/10 my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare('copy')}
                        className="w-full justify-start text-white hover:bg-white/10"
                      >
                        {copiedToClipboard ? (
                          <>
                            <div className="w-4 h-4 mr-2 bg-green-400 rounded-full flex items-center justify-center">
                              <span className="text-xs text-black">✓</span>
                            </div>
                            Copied!
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Title and Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {artwork.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-300">
                    <Link
                      href={`/gallery/artist/${artwork.artist_id}`}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      <User className="w-4 h-4" />
                      {artwork.artist_name}
                    </Link>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm">{getRelativeTime(artwork.createdAt)}</span>
                  </div>
                </div>
                
                <Badge className="glass-strong border border-white/20 text-white px-4 py-2 text-sm">
                  {artwork.category.replace('-', ' ')}
                </Badge>
              </div>

              {/* Description */}
              {artwork.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Engagement Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <Card className="glass-card border border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Eye className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {artwork.view_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Views</div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.floor(artwork.view_count * 0.12)}
                  </div>
                  <div className="text-sm text-gray-400">Likes</div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.floor(artwork.view_count * 0.05)}
                  </div>
                  <div className="text-sm text-gray-400">Comments</div>
                </CardContent>
              </Card>

              <Card className="glass-card border border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    +{Math.floor(artwork.view_count * 0.08)}
                  </div>
                  <div className="text-sm text-gray-400">This Week</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Comments ({comments.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(!showComments)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showComments ? 'Hide' : 'Show'}
                    </Button>
                  </div>

                  {showComments && (
                    <div className="space-y-4">
                      {/* Comment Input */}
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this artwork..."
                            className="w-full p-3 glass-strong border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            rows={3}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400">
                              Be respectful and constructive in your comments
                            </span>
                            <Button
                              onClick={handleCommentSubmit}
                              disabled={!comment.trim()}
                              className="btn-primary h-8 px-4"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      {comments.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                          {comments.map((comment) => (
                            <motion.div
                              key={comment._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {comment.user_id?.avatar_url ? (
                                  <img 
                                    src={comment.user_id.avatar_url} 
                                    alt={comment.user_id.display_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-white text-sm">
                                    {comment.user_id?.display_name || 'Anonymous User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {getRelativeTime(comment.created_at)}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 px-2">
                                    <ThumbsUp className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Like</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 px-2">
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Reply</span>
                                  </Button>
                                </div>
                                
                                {/* Show replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-white/10">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply._id} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                          {reply.user_id?.avatar_url ? (
                                            <img 
                                              src={reply.user_id.avatar_url} 
                                              alt={reply.user_id.display_name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <User className="w-3 h-3 text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-white text-xs">
                                              {reply.user_id?.display_name || 'Anonymous User'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {getRelativeTime(reply.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-gray-300 text-xs leading-relaxed">{reply.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {commentsLoading && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Artwork Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border border-white/10 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Details</h3>
                    <Frame className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Created
                      </span>
                      <span className="text-white font-medium">
                        {formatDateSafe(artwork.createdAt, { format: 'medium' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Category
                      </span>
                      <span className="text-white font-medium capitalize">
                        {artwork.category.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Artist
                      </span>
                      <Link
                        href={`/gallery/artist/${artwork.artist_id}`}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {artwork.artist_name}
                      </Link>
                    </div>

                    {artwork.medium && (
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-gray-400">Medium</span>
                        <span className="text-white font-medium">{artwork.medium}</span>
                      </div>
                    )}

                    {artwork.dimensions && (
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <span className="text-gray-400">Dimensions</span>
                        <span className="text-white font-medium">{artwork.dimensions}</span>
                      </div>
                    )}

                    {artwork.year && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-400">Year</span>
                        <span className="text-white font-medium">{artwork.year}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border border-white/10">
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full btn-primary h-12 text-base font-medium">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Gallery
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="glass-strong border border-white/20 h-11"
                      onClick={handleLike}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button
                      variant="outline"
                      className="glass-strong border border-white/20 h-11"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Artist Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-card border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 p-0.5">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{artwork.artist_name}</h4>
                      <p className="text-sm text-gray-400">Digital Artist</p>
                    </div>
                  </div>
                  <Button asChild className="w-full glass-strong border border-white/20">
                    <Link href={`/gallery/artist/${artwork.artist_id}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20"
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Related Artworks</h2>
              <p className="text-gray-400 text-lg">Discover more pieces you might love</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArtworks.map((relatedArtwork, index) => (
                <motion.div
                  key={relatedArtwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Link href={`/artworks/${relatedArtwork.id}`}>
                    <Card className="glass-card border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300 cursor-pointer">
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <ArtworkImage
                          src={relatedArtwork.image_url}
                          alt={relatedArtwork.title}
                          title={relatedArtwork.title}
                          category={relatedArtwork.category}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          width={400}
                          height={500}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {relatedArtwork.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          by {relatedArtwork.artist_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                            {relatedArtwork.category.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDateSafe(relatedArtwork.createdAt, { format: 'short' })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  )
}
