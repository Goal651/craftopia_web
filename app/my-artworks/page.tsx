"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useArt } from "@/contexts/ArtContext"
import { ArtCard } from "@/components/ui/art-card"
import { formatRwf, whatsappLink } from "@/lib/auth-client"
import {
  Plus,
  Search,
  Grid,
  List,
  Trash2,
  Eye,
  Package,
  ShoppingBag,
  MessageCircle,
  Loader2,
  ImageIcon,
} from "lucide-react"
import { getSafeTimestamp } from "@/lib/utils/date-utils"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface OrderRecord {
  id: string
  artwork_id: string
  artwork_title: string
  artwork_image?: string
  artist_id: string
  artist_name: string
  price: number
  buyer_name: string
  buyer_phone: string
  delivery_address: string
  note?: string
  status: "new" | "contacted" | "delivered" | "cancelled"
  createdAt: string
}

const STATUS_META: Record<OrderRecord["status"], { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary border-primary/30" },
  contacted: { label: "Contacted", className: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  delivered: { label: "Delivered", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
}

const NEXT_STATUS: Record<OrderRecord["status"], OrderRecord["status"][]> = {
  new: ["contacted", "delivered", "cancelled"],
  contacted: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: ["contacted"],
}

export default function MyArtworksPage() {
  const { user } = useAuth()
  const { artworks, loading, fetchArtworks } = useArt()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [deletingArtwork, setDeletingArtwork] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Filter artworks by current user
  const userArtworks = artworks.filter(artwork => artwork.artist_id === user?.id)

  const fetchOrders = useCallback(async () => {
    if (!user) return
    try {
      setOrdersLoading(true)
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredArtworks = userArtworks
    .filter(artwork => {
      const term = searchTerm.toLowerCase()
      return (
        artwork.title?.toLowerCase().includes(term) ||
        artwork.artist_name.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return getSafeTimestamp(b.created_at || b.createdAt) - getSafeTimestamp(a.created_at || a.createdAt)
        case "oldest":
          return getSafeTimestamp(a.created_at || a.createdAt) - getSafeTimestamp(b.created_at || b.createdAt)
        case "views":
          return b.view_count - a.view_count
        case "title":
          return (a.title || "").localeCompare(b.title || "")
        default:
          return 0
      }
    })

  const handleDeleteArtwork = async (id: string) => {
    setDeletingArtwork(id)
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Artwork deleted")
        await fetchArtworks()
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete artwork")
    } finally {
      setDeletingArtwork(null)
      setConfirmDeleteId(null)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderRecord["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)))
        toast.success(`Order marked as ${status}`)
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to update")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order")
    }
  }

  const newOrders = orders.filter(o => o.status === "new")
  const totalViews = userArtworks.reduce((sum, artwork) => sum + artwork.view_count, 0)

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">Please log in to view your artworks.</p>
            <Button asChild className="btn-primary">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                My <span className="text-secondary">Studio</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your artworks and orders
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="btn-primary">
                <Link href="/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <Eye className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="artworks" className="space-y-8">
          <TabsList>
            <TabsTrigger value="artworks" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Artworks ({userArtworks.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
              {newOrders.length > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground px-1.5 min-w-5 h-5 text-[10px]">
                  {newOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Artworks</p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">{userArtworks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Total Views</p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">{totalViews.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">New Orders</p>
                    <p className="text-3xl font-bold text-foreground tabular-nums">{newOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-11"
                  />
                </div>
              </div>
              <div className="lg:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "btn-primary" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "btn-primary" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Artworks Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredArtworks.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-8"}>
                <AnimatePresence>
                  {filteredArtworks.map((artwork, index) => (
                    <motion.div
                      key={artwork.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative group/artwork"
                    >
                      <ArtCard artwork={artwork} index={index} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 h-8 w-8 bg-black/50 hover:bg-destructive/80 text-white rounded-full opacity-0 group-hover/artwork:opacity-100 transition-opacity z-10"
                        onClick={() => setConfirmDeleteId(artwork.id)}
                        disabled={deletingArtwork === artwork.id}
                        aria-label="Delete artwork"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="max-w-md mx-auto space-y-8">
                  <div className="w-24 h-24 mx-auto bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground">
                    <Plus className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">
                      {searchTerm ? "No artworks found" : "Your gallery is empty"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "Upload your first piece and it will appear here for buyers to order."
                      }
                    </p>
                  </div>
                  {!searchTerm && (
                    <Button asChild className="btn-primary h-12 px-8 font-semibold shadow-lg">
                      <Link href="/upload">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Your First Artwork
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-24">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-24 h-24 mx-auto bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">No orders yet</h3>
                  <p className="text-muted-foreground">
                    When someone orders one of your artworks, their name, phone and delivery address will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-5">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted/20">
                          {order.artwork_image ? (
                            <img src={order.artwork_image} alt={order.artwork_title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={STATUS_META[order.status].className + " border"}>
                              {STATUS_META[order.status].label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground truncate">{order.artwork_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-medium">{order.buyer_name}</span> · {order.buyer_phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Deliver to: <span className="text-foreground">{order.delivery_address}</span>
                          </p>
                          {order.note && (
                            <p className="text-sm italic text-muted-foreground">"{order.note}"</p>
                          )}
                          <p className="text-sm font-semibold text-foreground">{formatRwf(order.price)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 flex-shrink-0">
                          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <a
                              href={whatsappLink(
                                order.buyer_phone,
                                `Hello ${order.buyer_name}! This is about your order of "${order.artwork_title}" on CRAFTOPIA. Let's arrange payment and delivery.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </a>
                          </Button>
                          {NEXT_STATUS[order.status].map((status) => (
                            <Button
                              key={status}
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, status)}
                            >
                              Mark {STATUS_META[status].label.toLowerCase()}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete artwork?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the artwork from the gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => confirmDeleteId && handleDeleteArtwork(confirmDeleteId)}
            >
              {deletingArtwork ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
