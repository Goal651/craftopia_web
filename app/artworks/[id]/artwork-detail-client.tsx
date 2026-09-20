"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArtworkRecord } from "@/types/index"
import { ArtworkGallery } from "@/components/ui/artwork-gallery"
import { useAuth } from "@/contexts/AuthContext"
import { formatRwf, whatsappLink, siteUrl, SITE } from "@/lib/auth-client"
import {
  Heart,
  Share2,
  ExternalLink,
  Phone,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export function ArtworkDetailClient({ artworkId }: { artworkId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
  const [artist, setArtist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Order dialog state
  const [orderOpen, setOrderOpen] = useState(false)
  const [orderForm, setOrderForm] = useState({ buyer_name: "", buyer_phone: "", delivery_address: "", note: "" })
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const isOwner = user && artwork && user.id === artwork.artist_id

  useEffect(() => {
    if (user?.id && artworkId) {
      fetchLikeStatus()
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

  const fetchArtwork = useCallback(async () => {
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

      if (data.artist_id) {
        fetchArtist(data.artist_id)
      }
    } catch (err) {
      console.error('Error fetching artwork:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artwork')
    } finally {
      setLoading(false)
    }
  }, [artworkId])

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
    router.push(`/upload?edit=${artwork.id}`)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to save artworks')
      return
    }

    if (user?.id === artwork?.artist_id) {
      toast.error('You cannot save your own artwork')
      return
    }

    if (!artworkId) return

    try {
      const newLikedState = !isLiked
      setIsLiked(newLikedState)

      const response = await fetch(`/api/artworks/${artworkId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: newLikedState }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update like status')
      }
    } catch (error) {
      console.error('Failed to update like:', error)
      setIsLiked(!isLiked)
      toast.error(error instanceof Error ? error.message : 'Failed to update like')
    }
  }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artwork) return

    setOrderSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artwork_id: artwork.id,
          buyer_name: orderForm.buyer_name,
          buyer_phone: orderForm.buyer_phone,
          delivery_address: orderForm.delivery_address,
          note: orderForm.note,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      setOrderPlaced(true)
      toast.success('Order received! The artist will contact you shortly.')
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setOrderSubmitting(false)
    }
  }

  const closeOrderDialog = () => {
    setOrderOpen(false)
    if (orderPlaced) {
      setOrderPlaced(false)
      setOrderForm({ buyer_name: "", buyer_phone: "", delivery_address: "", note: "" })
    }
  }

  const whatsappBuyerMessage = artwork
    ? `Hi! I just ordered "${artwork.title || 'Untitled'}" on ${SITE.name}. Let me know how to pay and when it can be delivered.`
    : ""

  useEffect(() => {
    if (artworkId) {
      fetchArtwork()
    }
  }, [artworkId, fetchArtwork])

  const title = artwork?.title && artwork.title !== "Artwork" ? artwork.title : "Untitled"

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
          <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-10 text-destructive">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-4 mb-12">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {error === 'Artwork not found' ? 'Artwork not found' : 'Something went wrong'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {error === 'Artwork not found'
                ? "This piece may have been sold or removed from the gallery."
                : error
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={fetchArtwork} className="btn-primary px-8" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
            <Button asChild variant="outline" className="border-border hover:bg-muted px-8">
              <Link href="/artworks">Discover More</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const soldOut = artwork.stock_quantity <= 0

  return (
    <div className="min-h-screen bg-background py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artwork Display */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ArtworkGallery
                images={artwork.images}
                mainImage={artwork.image_url}
                alt={`${title} by ${artwork.artist_name}`}
              />
            </motion.div>

            {artwork.description && (
              <div className="mt-8 space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">About this piece</h2>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{artwork.description}</p>
              </div>
            )}
          </div>

          {/* Artwork Details & Commerce */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/5 text-primary border-primary/20 px-2 py-0.5 uppercase tracking-widest text-[9px] font-bold rounded">
                    {(artwork.category || "Artwork").replace(/-/g, " ")}
                  </Badge>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted/20 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={handleEditArtwork} className="cursor-pointer">
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="cursor-pointer text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-[1.2] break-words">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  by <span className="text-foreground font-semibold">{artwork.artist_name}</span>
                  {artwork.year ? ` · ${artwork.year}` : ""}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-border bg-muted/5 p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2">Price</span>
                  <span className="text-xl font-bold text-foreground">
                    {artwork.price > 0 ? formatRwf(artwork.price) : "Ask"}
                  </span>
                </div>
                <div className="rounded border border-border bg-muted/5 p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-2">Availability</span>
                  <span className={cn(
                    "text-xl font-bold",
                    soldOut ? "text-destructive" : "text-emerald-600"
                  )}>
                    {soldOut ? "Sold" : "Available"}
                  </span>
                </div>
              </div>

              {(artwork.medium || artwork.dimensions) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {artwork.medium && <span>Medium: <span className="text-foreground">{artwork.medium}</span></span>}
                  {artwork.dimensions && <span>Size: <span className="text-foreground">{artwork.dimensions}</span></span>}
                </div>
              )}

              {/* Primary Actions */}
              <div className="space-y-3 pt-2">
                {soldOut ? (
                  <Button disabled className="w-full btn-primary h-12 rounded font-semibold">
                    Sold Out
                  </Button>
                ) : (
                  <Button
                    className="w-full btn-primary h-12 rounded font-semibold text-sm uppercase tracking-wider shadow-md"
                    onClick={() => setOrderOpen(true)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Order this piece
                  </Button>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded border-border hover:bg-muted font-semibold text-xs uppercase tracking-wider"
                    onClick={handleLike}
                  >
                    <Heart className={cn("w-3.5 h-3.5 mr-2", isLiked && "fill-destructive text-destructive")} />
                    {isLiked ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-4 rounded border-border hover:bg-muted"
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                  {artist?.phone_number && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-11 px-4 rounded border-border hover:bg-muted"
                          aria-label="Contact artist"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`tel:${artist.phone_number}`} className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Call the artist
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={whatsappLink(
                              artist.phone_number,
                              `Hi! I'm interested in "${title}" on ${SITE.name}. Is it still available?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp the artist
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <AnimatePresence>
                  {copiedToClipboard && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-600 text-center"
                    >
                      Link copied to clipboard
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={(open) => !open && closeOrderDialog()}>
        <DialogContent className="sm:max-w-md">
          {orderPlaced ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Order received!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you, {orderForm.buyer_name.split(" ")[0]}. The artist has your details and will
                  contact you to arrange payment and delivery.
                </p>
              </div>
              {artist?.phone_number && (
                <Button asChild className="btn-primary w-full h-11">
                  <a
                    href={whatsappLink(artist.phone_number, whatsappBuyerMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat now on WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={closeOrderDialog} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Order "{title}"</DialogTitle>
                <DialogDescription>
                  {artwork.price > 0 && `${formatRwf(artwork.price)} · `}
                  Fill in your details and the artist will contact you to arrange payment and delivery.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submitOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buyer_name">Your name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="buyer_name"
                      value={orderForm.buyer_name}
                      onChange={(e) => setOrderForm({ ...orderForm, buyer_name: e.target.value })}
                      placeholder="Full name"
                      className="pl-10"
                      required
                      minLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer_phone">Phone number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="buyer_phone"
                      type="tel"
                      value={orderForm.buyer_phone}
                      onChange={(e) => setOrderForm({ ...orderForm, buyer_phone: e.target.value })}
                      placeholder="+250 7..."
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">Delivery address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1.5 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="delivery_address"
                      value={orderForm.delivery_address}
                      onChange={(e) => setOrderForm({ ...orderForm, delivery_address: e.target.value })}
                      placeholder="Sector, district, landmark — anything that helps us find you"
                      className="pl-10 min-h-[70px] resize-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_note">Note (optional)</Label>
                  <Input
                    id="order_note"
                    value={orderForm.note}
                    onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                    placeholder="Preferred delivery time, questions..."
                  />
                </div>
                <Button type="submit" className="btn-primary w-full h-11" disabled={orderSubmitting}>
                  {orderSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Placing order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Place order
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center">
                  No online payment yet — you agree on payment with the artist directly.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <h3 className="text-lg font-semibold text-foreground">Delete Artwork</h3>
            <AlertDialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArtwork}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Artwork"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
