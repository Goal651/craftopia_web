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
import { sampleArtworks } from "@/lib/data"
import { Search, Grid, List, Heart, Eye, ShoppingCart, Star, Filter } from "lucide-react"

export default function ArtworksPage() {
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
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto container-padding py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNav 
            items={[
              { label: "Curated Collection", current: true }
            ]}
          />

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-light text-white">
              Art <span className="text-gradient-blue font-medium">Collection</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover extraordinary contemporary artworks. Each piece tells a unique story through color, form, and
              emotion.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search artworks, artists, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 glass border-0 text-lg focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Filter Controls */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Filters:</span>
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 glass border-0 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-0">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-40 glass border-0 text-white">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-0">
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="text-white hover:bg-white/10">
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 glass border-0 text-white">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-0">
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
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
                        : "glass border-0 text-gray-300 hover:text-white hover:bg-white/10"
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
                        : "glass border-0 text-gray-300 hover:text-white hover:bg-white/10"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-center text-gray-400">
                Showing {filteredAndSortedArtworks.length} of {sampleArtworks.length} artworks
              </div>
            </div>
          </div>

          {/* Artworks Grid */}
          <motion.div layout className={viewMode === "grid" ? "gallery-grid" : "space-y-6"}>
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
                    <Card className="group cursor-pointer overflow-hidden border-0 glass-card card-hover">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={artwork.images[0] || "/placeholder.svg?height=400&width=300"}
                          alt={artwork.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Action Buttons */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="btn-primary shadow-lg"
                              onClick={() => setSelectedArtwork(artwork)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass border-0 hover:bg-white/20 bg-transparent text-white"
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
                        <div className="absolute top-3 right-3 glass rounded-full px-3 py-1">
                          <span className="text-sm font-semibold text-white">${artwork.price.toLocaleString()}</span>
                        </div>

                        {/* Featured Badge */}
                        {artwork.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                            {artwork.category}
                          </Badge>
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {artwork.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{artwork.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">{artwork.medium}</span>
                            <span className="text-xs font-medium text-gray-400">{artwork.year}</span>
                          </div>
                          <Button size="sm" className="w-full btn-primary" onClick={() => setSelectedArtwork(artwork)}>
                            <ShoppingCart className="w-3 h-3 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="group cursor-pointer overflow-hidden border-0 glass-card hover:shadow-xl transition-all duration-300">
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
                          <div className="absolute top-3 right-3 glass rounded-full px-3 py-1">
                            <span className="text-sm font-semibold text-white">${artwork.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <CardContent className="flex-1 p-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                                    {artwork.category}
                                  </Badge>
                                  {artwork.featured && (
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                  {artwork.title}
                                </h3>
                                <p className="text-gray-400">by {artwork.artist}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-white hover:bg-white/10"
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

                            <p className="text-gray-400 leading-relaxed line-clamp-3">{artwork.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Medium:</span>
                                <span className="ml-2 font-medium text-gray-300">{artwork.medium}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Year:</span>
                                <span className="ml-2 font-medium text-gray-300">{artwork.year}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Dimensions:</span>
                                <span className="ml-2 font-medium text-gray-300">{artwork.dimensions}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Stock:</span>
                                <Badge variant={artwork.inStock ? "default" : "destructive"} className="ml-2 text-xs">
                                  {artwork.inStock ? `${artwork.stockQuantity} available` : "Out of stock"}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                              <Button className="btn-primary" onClick={() => setSelectedArtwork(artwork)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                className="glass border-0 hover:bg-blue-500/10 bg-transparent text-gray-300 hover:text-white"
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
