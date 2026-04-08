"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useArt } from "@/contexts/ArtContext"
import { ArtCard } from "@/components/ui/art-card"
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  Heart,
  Calendar,
  BarChart3
} from "lucide-react"
import { formatDateSafe, getSafeTimestamp } from "@/lib/utils/date-utils"
import Link from "next/link"

export default function MyArtworksPage() {
  const { user } = useAuth()
  const { artworks, loading } = useArt()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter artworks by current user
  const userArtworks = artworks.filter(artwork => artwork.artist_id === user?.id)

  // Filter and sort artworks
  const filteredArtworks = userArtworks
    .filter(artwork =>
      artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at)
        case "oldest":
          return getSafeTimestamp(a.created_at) - getSafeTimestamp(b.created_at)
        case "views":
          return b.view_count - a.view_count
        case "title":
          return a.artist_name.localeCompare(b.artist_name)
        default:
          return 0
      }
    })

  const totalViews = userArtworks.reduce((sum, artwork) => sum + artwork.view_count, 0)
  const totalLikes = Math.floor(totalViews * 0.1) // Simulated likes

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="glass-strong border-0 max-w-md w-full">
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
                My <span className="text-gradient-primary">Artworks</span>
              </h1>
              <p className="text-muted-foreground">
                Manage and showcase your artistic collection
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="btn-primary">
                <Link href="/upload">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New
                </Link>
              </Button>
              <Button variant="outline" asChild className="glass-strong">
                <Link href="/dashboard">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          <Card className="glass-strong border-border/50 group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Total Artworks</p>
                  <p className="text-4xl font-black text-foreground tabular-nums">{userArtworks.length}</p>
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong border-border/50 group hover:border-secondary/30 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Total Views</p>
                  <p className="text-4xl font-black text-foreground tabular-nums">{totalViews.toLocaleString()}</p>
                </div>
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-strong border-border/50 group hover:border-accent/30 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Total Likes</p>
                  <p className="text-4xl font-black text-foreground tabular-nums">{totalLikes.toLocaleString()}</p>
                </div>
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 md:p-8 border border-border/50 shadow-2xl mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-11 glass border-0 bg-background/50"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 glass border-0 bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-0">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "btn-primary" : "glass border-0"}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "btn-primary" : "glass border-0"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Artworks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] glass-strong rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredArtworks.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10" : "space-y-8"}>
              <AnimatePresence>
                {filteredArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ArtCard
                      artwork={artwork}
                      index={index}
                      searchQuery={searchTerm}
                      variant={viewMode === "list" ? "compact" : "default"}
                      aspectRatio={viewMode === "list" ? "video" : "3/4"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="max-w-md mx-auto space-y-8">
                <div className="w-24 h-24 mx-auto glass-strong rounded-full flex items-center justify-center text-muted-foreground">
                  <Plus className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {searchTerm ? "No masterpieces found" : "Your gallery is empty"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {searchTerm
                      ? "Try adjusting your search terms to locate your specific visions."
                      : "The world is waiting for your next masterpiece. Start your journey today!"
                    }
                  </p>
                </div>
                <Button asChild className="btn-primary h-12 px-8 rounded-full font-semibold shadow-xl">
                  <Link href="/upload">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Your First Artwork
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
