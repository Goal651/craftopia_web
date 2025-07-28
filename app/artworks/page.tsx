"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { sampleArtworks } from "@/lib/data"
import { Search, Filter } from "lucide-react"

export default function ArtworksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")

  const categories = ["painting", "digital", "sculpture", "photography"]

  const filteredAndSortedArtworks = useMemo(() => {
    const filtered = sampleArtworks.filter((artwork) => {
      const matchesSearch =
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(artwork.category)

      const matchesPrice = (() => {
        switch (priceRange) {
          case "under-500":
            return artwork.price < 500
          case "500-1000":
            return artwork.price >= 500 && artwork.price <= 1000
          case "1000-2000":
            return artwork.price >= 1000 && artwork.price <= 2000
          case "over-2000":
            return artwork.price > 2000
          default:
            return true
        }
      })()

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "featured":
          return b.featured ? 1 : -1
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedCategories, priceRange, sortBy])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Browse Artworks</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of {sampleArtworks.length} artworks from talented artists worldwide.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Categories</Label>
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={category} className="text-sm capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="over-2000">Over $2,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedArtworks.length} of {sampleArtworks.length} artworks
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedArtworks.map((artwork) => (
                <Card key={artwork.id} className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={artwork.images[0] || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {artwork.featured && <Badge className="absolute top-2 left-2">Featured</Badge>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {artwork.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-1">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{artwork.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold">${artwork.price.toLocaleString()}</span>
                        <Button size="sm" asChild>
                          <Link href={`/artworks/${artwork.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAndSortedArtworks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No artworks found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategories([])
                    setPriceRange("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
