"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { formatDateSafe, getRelativeTime } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtworkRecord } from "@/types/index"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { useAuth } from "@/contexts/AuthContext"
import {
  Heart,
  Share2,
  ExternalLink,
  Phone,
  Globe,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react"
import Head from 'next/head'
import { cn } from "@/lib/utils"
import { ArtworkFullView } from "@/components/ui/artwork-full-view"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
  const [artist, setArtist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewCountUpdated, setViewCountUpdated] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showOwnerMenu, setShowOwnerMenu] = useState(false)

  const artworkId = Array.isArray(params.id) ? params.id[0] : params.id

  // Check if current user is the owner of this artwork
  const isOwner = user && artwork && user.id === artwork.artist_id

  // Initialize view tracking when user is available
  useEffect(() => {
    if (user?.id && artworkId) {
      fetchLikeStatus()
      fetchViewStatus()
    }
  }, [user, artworkId])

  // Close owner menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOwnerMenu && !(event.target as Element).closest('.owner-menu')) {
        setShowOwnerMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showOwnerMenu])

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

  const handleDeleteArtwork = async () => {
    if (!artwork || !isOwner) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Artwork deleted successfully')
        router.push('/my-artworks')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete artwork')
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete artwork')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEditArtwork = () => {
    if (!artwork || !isOwner) return
    // Navigate to edit page or open edit modal
    router.push(`/upload?edit=${artwork.id}`)
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = 'Amazing Artwork'
    const artist = artwork?.artist_name || 'Talented Artist'
    const description = `Check out this stunning artwork by ${artist} on Craftopia!`

    switch (platform) {
      case 'twitter':
        const twitterText = `🎨 "${title}" by ${artist} - ${description.substring(0, 100)}... #Art #DigitalArt #Craftopia`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420')
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

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!artwork) return null

    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "description": `Stunning artwork by ${artwork.artist_name}`,
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
      <div className="min-h-screen bg-background py-10 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-[4/3] w-full max-h-[500px] bg-muted/20 rounded-lg" />
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-muted/20 rounded" />
                  <Skeleton className="h-8 w-3/4 bg-muted/20 rounded" />
                  <Skeleton className="h-4 w-1/2 bg-muted/20 rounded" />
                </div>
                <Skeleton className="h-24 w-full bg-muted/20 rounded" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 w-full bg-muted/20 rounded" />
                  <Skeleton className="h-20 w-full bg-muted/20 rounded" />
                </div>
                <Skeleton className="h-12 w-full bg-muted/20 rounded" />
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
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
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
  const seoDescription = `Discover this stunning artwork by ${artwork.artist_name}. Explore more amazing digital artworks on Craftopia.`
  const seoImage = artwork.image_url

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Artwork by {artwork.artist_name}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${artwork.artist_name}, digital art, artwork, craftopia, online gallery, art`} />
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

      <div className="min-h-screen bg-background py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Main Content Grid: 2/3 Left, 1/3 Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Artwork Display - 2 Columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative rounded-lg overflow-hidden glass border border-border shadow-md bg-muted/5 aspect-[4/3] max-h-[500px] flex items-center justify-center p-4"
              >
                <ArtworkImage
                  src={artwork.image_url}
                  alt="Artwork"
                  title="Artwork"
                  className="w-full h-full object-contain mx-auto transition-transform duration-700 hover:scale-105"
                  priority
                />
              </motion.div>
            </div>

            {/* Artwork Details & Commerce - 1 Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/5 text-primary border-primary/20 px-2 py-0.5 uppercase tracking-widest text-[9px] font-black rounded">
                      {artwork.category || "Fine Art"}
                    </Badge>
                    {isOwner && (
                      <div className="relative owner-menu">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowOwnerMenu(!showOwnerMenu)}
                          className="h-8 w-8 p-0 hover:bg-muted/20 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {/* Owner Dropdown Menu */}
                        {showOwnerMenu && (
                          <div className="absolute right-0 top-full mt-1 glass-strong border border-border/50 bg-card shadow-xl rounded-lg overflow-hidden z-50 min-w-[120px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditArtwork}
                              className="w-full justify-start gap-2 h-8 px-3 hover:bg-muted/20 text-xs"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowDeleteDialog(true)
                                setShowOwnerMenu(false)
                              }}
                              className="w-full justify-start gap-2 h-8 px-3 hover:bg-destructive/10 text-destructive text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-[1.2] break-words">
                    Artwork
                  </h1>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    by <span className="text-foreground font-black">{artwork.artist_name}</span>
                  </p>
                </div>


                {/* Economic Profile Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-border bg-muted/5 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-2">Amount</span>
                    <span className="text-xl font-black text-primary">${artwork.price.toLocaleString()}</span>
                  </div>
                  <div className="rounded border border-border bg-muted/5 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-2">Stock</span>
                    <span className={cn(
                      "text-xl font-black",
                      artwork.stock_quantity > 0 ? "text-foreground" : "text-destructive"
                    )}>
                      {artwork.stock_quantity > 0 ? artwork.stock_quantity : "Out"}
                    </span>
                  </div>
                </div>

                {/* Primary Interaction Area */}
                <div className="space-y-3 pt-2">
                  <Button asChild className="w-full btn-primary h-12 rounded font-black text-sm uppercase tracking-widest shadow-md">
                    <Link href={artist?.phone_number ? `tel:${artist.phone_number}` : "#"}>
                      <Phone className="w-4 h-4 mr-2" />
                      Contact via Phone
                    </Link>
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded border-border hover:bg-muted font-black text-[10px] uppercase tracking-[0.2em]"
                      onClick={handleLike}
                    >
                      <Heart className={cn("w-3.5 h-3.5 mr-2", isLiked && "fill-destructive text-destructive")} />
                      {isLiked ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 px-4 rounded border-border hover:bg-muted"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Contextual Share Menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="p-4 rounded border border-border bg-card shadow-xl space-y-3"
                      >
                        <p className="text-[8px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-2">Sharing Options</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'twitter', label: 'X', icon: <Globe className="w-3.5 h-3.5" /> },
                            { id: 'copy', label: copiedToClipboard ? 'Copied' : 'Link', icon: <ExternalLink className="w-3.5 h-3.5" /> }
                          ].map(p => (
                            <Button
                              key={p.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(p.id)}
                              className="justify-start gap-2 h-9 px-3 hover:bg-muted rounded"
                            >
                              {p.icon}
                              <span className="text-[9px] font-black uppercase tracking-wider">{p.label}</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <h3 className="text-lg font-semibold text-foreground">Delete Artwork</h3>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this artwork? This action cannot be undone and will permanently remove the artwork from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArtwork}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Artwork'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Simplified Full Screen View */}
      <ArtworkFullView
        src={artwork.image_url}
        alt="Artwork"
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </>
  )
}
