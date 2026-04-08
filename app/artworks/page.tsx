"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductModal } from "@/components/product-modal"
import { useArt } from "@/contexts/ArtContext"
import { ArtCard } from "@/components/ui/art-card"
import { LiveVisualSearch } from "@/components/ui/live-visual-search"
import { Search, Grid, List, Filter, RefreshCw, Loader2 } from "lucide-react"

export default function ArtworksPage() {
  const { artworks, loading } = useArt()
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [wishlist, setWishlist] = useState<string[]>([])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = artworks.filter((artwork) => {
      const matchesSearch =
        artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-1000" && artwork.price < 1000) ||
        (priceFilter === "1000-3000" && artwork.price >= 1000 && artwork.price <= 3000) ||
        (priceFilter === "over-3000" && artwork.price > 3000)

      return matchesSearch && matchesPrice
    })

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return (b.year || 0) - (a.year || 0)
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })

    return filtered
  }, [artworks, searchTerm, categoryFilter, priceFilter, sortBy])

  const toggleWishlist = (artworkId: string) => {
    setWishlist((prev) => (prev.includes(artworkId) ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]))
  }

  const categories = ["all", "painting", "digital", "sculpture", "photography"]
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "under-1000", label: "Under $1,000" },
    { value: "1000-3000", label: "$1,000 - $3,000" },
    { value: "over-3000", label: "Over $3,000" },
  ]

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "title", label: "Title A-Z" },
  ]

  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <Badge className="glass px-6 py-2 border-primary/20 text-primary">Artistic Collection</Badge>
            <h1 className="text-4xl lg:text-7xl font-semibold tracking-tight text-foreground">
              Art <span className="text-gradient-primary">Exploration</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover extraordinary contemporary artworks. Each piece tells a unique story through color, form, and emotion.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 md:space-y-6">
            {/* Live Visual Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <LiveVisualSearch
                onSearch={setSearchTerm}
                onClear={() => setSearchTerm("")}
                placeholder="Search artworks, artists, or styles..."
                loading={loading}
                artworks={artworks}
                className="w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="glass-strong rounded-2xl p-6 md:p-8 border border-border/50 shadow-2xl">
              <div className="flex flex-col gap-4">
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full glass border-0 text-foreground h-11">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-0">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-foreground hover:bg-muted">
                            {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="w-full glass border-0 text-foreground h-11">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-0">
                        {priceRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value} className="text-foreground hover:bg-muted">
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full glass border-0 text-foreground h-11">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-0">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-muted">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results and View Mode Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <div className="text-center sm:text-left text-sm text-muted-foreground">
                    Showing {filteredAndSortedArtworks.length} of {artworks.length} artworks
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className={
                        viewMode === "grid"
                          ? "btn-primary h-11 w-11"
                          : "glass border-0 text-muted-foreground hover:text-foreground hover:bg-white/10 h-11 w-11"
                      }
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className={
                        viewMode === "list"
                          ? "btn-primary h-11 w-11"
                          : "glass border-0 text-muted-foreground hover:text-foreground hover:bg-white/10 h-11 w-11"
                      }
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Artworks Grid */}
          <motion.div layout className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" : "space-y-8"}>
            <AnimatePresence>
              {loading ? (
                <div className="col-span-full py-20 flex justify-center items-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading collection...</p>
                  </div>
                </div>
              ) : filteredAndSortedArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={viewMode === "list" ? "w-full" : ""}
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
          </motion.div>

          {/* No Results */}
          {filteredAndSortedArtworks.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="max-w-md mx-auto space-y-8">
                <div className="w-24 h-24 mx-auto glass-strong rounded-full flex items-center justify-center text-muted-foreground">
                  <Search className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">No masterpieces found</h3>
                  <p className="text-muted-foreground leading-relaxed">Try adjusting your search criteria or filters to discover new artistic visions.</p>
                </div>
                <Button
                  variant="outline"
                  className="glass-strong border-primary/20 text-primary hover:bg-primary/10 h-12 px-8 rounded-full font-semibold"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setPriceFilter("all")
                    setSortBy("featured")
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedArtwork && <ProductModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />}
      </AnimatePresence>
    </div>
  )
}
