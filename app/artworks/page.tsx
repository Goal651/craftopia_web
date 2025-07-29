"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductModal } from "@/components/product-modal"
import { sampleArtworks } from "@/lib/data"
import { Search, Grid, List, Heart, Eye, ShoppingCart, Star } from "lucide-react"

export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [wishlist, setWishlist] = useState<string[]>([])

  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = sampleArtworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase())

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
    <div className="min-h-screen pt-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto mobile-padding py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-light text-foreground">
              Art <span className="text-gold font-medium">Collection</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover Elena Vasquez's extraordinary contemporary artworks. Each piece tells a unique story through
              color, form, and emotion.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
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
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-center text-muted-foreground">
              Showing {filteredAndSortedArtworks.length} of {sampleArtworks.length} artworks
            </div>
          </div>

          {/* Artworks Grid/List */}
          <motion.div layout className={viewMode === "grid" ? "responsive-grid" : "space-y-6"}>
            <AnimatePresence>
              {filteredAndSortedArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  {viewMode === "grid" ? (
                    <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-sm card-3d">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={artwork.images[0] || "/placeholder.svg?height=400&width=320"}
                          alt={artwork.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Action Buttons */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gradient-gold text-white shadow-lg"
                              onClick={() => setSelectedArtwork(artwork)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleWishlist(artwork.id)
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 ${wishlist.includes(artwork.id) ? "fill-red-500 text-red-500" : ""}`}
                              />
                            </Button>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute top-3 right-3 glass-effect rounded-full px-3 py-1">
                          <span className="text-sm font-semibold text-foreground">
                            ${artwork.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Featured Badge */}
                        {artwork.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-gold/20 text-gold border-gold/30">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 lg:p-6">
                        <div className="space-y-3">
                          <Badge variant="secondary" className="bg-pastel-rose/20 text-foreground text-xs">
                            {artwork.category}
                          </Badge>
                          <h3 className="text-lg lg:text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                            {artwork.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                            {artwork.description}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs lg:text-sm text-muted-foreground">{artwork.medium}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs lg:text-sm font-medium">{artwork.year}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant={artwork.inStock ? "default" : "destructive"} className="text-xs">
                              {artwork.inStock ? `${artwork.stockQuantity} in stock` : "Out of stock"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gold text-gold hover:bg-gold hover:text-white bg-transparent"
                              onClick={() => setSelectedArtwork(artwork)}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square overflow-hidden">
                          <Image
                            src={artwork.images[0] || "/placeholder.svg?height=256&width=256"}
                            alt={artwork.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 256px"
                          />

                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 glass-effect rounded-full px-3 py-1">
                            <span className="text-sm font-semibold text-foreground">
                              ${artwork.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <CardContent className="flex-1 p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-pastel-rose/20 text-foreground text-xs">
                                    {artwork.category}
                                  </Badge>
                                  {artwork.featured && (
                                    <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                                  {artwork.title}
                                </h3>
                                <p className="text-muted-foreground">by {artwork.artist}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleWishlist(artwork.id)
                                }}
                              >
                                <Heart
                                  className={`w-5 h-5 ${wishlist.includes(artwork.id) ? "fill-red-500 text-red-500" : ""}`}
                                />
                              </Button>
                            </div>

                            <p className="text-muted-foreground leading-relaxed line-clamp-3">{artwork.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Medium:</span>
                                <span className="ml-2 font-medium">{artwork.medium}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Year:</span>
                                <span className="ml-2 font-medium">{artwork.year}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Dimensions:</span>
                                <span className="ml-2 font-medium">{artwork.dimensions}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Stock:</span>
                                <Badge variant={artwork.inStock ? "default" : "destructive"} className="ml-2 text-xs">
                                  {artwork.inStock ? `${artwork.stockQuantity} available` : "Out of stock"}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <Button
                                className="gradient-gold text-white hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedArtwork(artwork)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                className="border-gold text-gold hover:bg-gold hover:text-white bg-transparent"
                                onClick={() => setSelectedArtwork(artwork)}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No Results */}
          {filteredAndSortedArtworks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No artworks found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
                <Button
                  variant="outline"
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
