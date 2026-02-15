"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductModal } from "@/components/product-modal"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { useArt } from "@/contexts/ArtContext"
import { ArtCard } from "@/components/ui/art-card"
import { Search, Grid, List, Heart, Eye, ShoppingCart, Star, Filter, RefreshCw, Loader2 } from "lucide-react"

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
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artwork.description || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || artwork.category === categoryFilter

      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-1000" && artwork.price < 1000) ||
        (priceFilter === "1000-3000" && artwork.price >= 1000 && artwork.price <= 3000) ||
        (priceFilter === "over-3000" && artwork.price > 3000)

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "title":
          return a.title.localeCompare(b.title)
        case "newest":
          return (b.year || 0) - (a.year || 0)
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      }
    })

    return filtered
  }, [searchTerm, categoryFilter, priceFilter, sortBy])

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
    <div className="min-h-screen pt-4">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-light text-foreground">
              Art <span className="text-gradient-primary font-medium">Collection</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover extraordinary contemporary artworks. Each piece tells a unique story through color, form, and
              emotion.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search artworks, artists, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 glass border-0 text-lg focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Filter Controls */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 glass border-0 text-foreground">
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
                    <SelectTrigger className="w-40 glass border-0 text-foreground">
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
                    <SelectTrigger className="w-40 glass border-0 text-foreground">
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

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "btn-primary"
                        : "glass border-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "btn-primary"
                        : "glass border-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-center text-muted-foreground">
                Showing {filteredAndSortedArtworks.length} of {artworks.length} artworks
              </div>
            </div>
          </div>

          {/* Artworks Grid */}
          <motion.div layout className={viewMode === "grid" ? "gallery-grid" : "space-y-6"}>
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
          {filteredAndSortedArtworks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">No artworks found</h3>
                <p className="text-gray-400">Try adjusting your search criteria or filters</p>
                <Button
                  variant="outline"
                  className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                    setPriceFilter("all")
                    setSortBy("featured")
                  }}
                >
                  Clear Filters
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
