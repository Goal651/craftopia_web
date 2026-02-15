"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, X, Loader2, Eye, Heart, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArtworkRecord } from "@/types"
import { ArtCard } from "./art-card"
import { motion, AnimatePresence } from "framer-motion"

interface LiveVisualSearchProps {
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  initialValue?: string
  loading?: boolean
  debounceMs?: number
  artworks?: ArtworkRecord[]
}

interface SearchResult {
  artwork: ArtworkRecord
  relevanceScore: number
  matchedFields: string[]
}

export function LiveVisualSearch({
  onSearch,
  onClear,
  placeholder = "Search artworks, artists, or styles...",
  className,
  initialValue = "",
  loading = false,
  debounceMs = 300,
  artworks = []
}: LiveVisualSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enhanced search algorithm with relevance scoring
  const calculateRelevance = useCallback((artwork: ArtworkRecord, searchQuery: string): SearchResult => {
    const query = searchQuery.toLowerCase()
    const title = artwork.title.toLowerCase()
    const artist = artwork.artist_name.toLowerCase()
    const description = (artwork.description || "").toLowerCase()
    const category = artwork.category.toLowerCase()

    let score = 0
    const matchedFields: string[] = []

    // Exact title match (highest score)
    if (title === query) {
      score += 100
      matchedFields.push("title")
    }
    // Title starts with query
    else if (title.startsWith(query)) {
      score += 80
      matchedFields.push("title")
    }
    // Title contains query
    else if (title.includes(query)) {
      score += 60
      matchedFields.push("title")
    }

    // Exact artist match
    if (artist === query) {
      score += 90
      matchedFields.push("artist")
    }
    // Artist contains query
    else if (artist.includes(query)) {
      score += 50
      matchedFields.push("artist")
    }

    // Category match
    if (category === query || category.includes(query)) {
      score += 40
      matchedFields.push("category")
    }

    // Description contains query
    if (description.includes(query)) {
      score += 20
      matchedFields.push("description")
    }

    // Word-by-word matching
    const queryWords = query.split(" ").filter(word => word.length > 2)
    queryWords.forEach(word => {
      if (title.includes(word)) score += 10
      if (artist.includes(word)) score += 8
      if (description.includes(word)) score += 5
    })

    return {
      artwork,
      relevanceScore: score,
      matchedFields
    }
  }, [])

  // Perform live search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || artworks.length === 0) {
      setSearchResults([])
      return
    }

    const results = artworks
      .map(artwork => calculateRelevance(artwork, searchQuery))
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6) // Show top 6 results

    setSearchResults(results)
  }, [artworks, calculateRelevance])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialValue) {
      onSearch(debouncedQuery)
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch, initialValue, performSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || searchResults.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % searchResults.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev <= 0 ? searchResults.length - 1 : prev - 1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0) {
            // Navigate to selected artwork
            window.location.href = `/artworks/${searchResults[selectedIndex].artwork.id}`
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          inputRef.current?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, selectedIndex])

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    setSearchResults([])
    setSelectedIndex(-1)
    onClear?.()
  }, [onClear])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length > 0)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsOpen(true)
    }
  }

  const getMatchBadge = (matchedFields: string[]) => {
    if (matchedFields.includes("title")) return <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">Title</Badge>
    if (matchedFields.includes("artist")) return <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">Artist</Badge>
    if (matchedFields.includes("category")) return <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Category</Badge>
    return <Badge className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">Description</Badge>
  }

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-12 pr-12 h-12 sm:h-14 glass border-border/50 bg-background/50 text-base sm:text-lg focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />

        {/* Loading indicator or clear button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : query.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Live Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-strong border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {searchResults.length} artwork{searchResults.length !== 1 ? 's' : ''} found
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.artwork.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-all duration-200 group",
                      selectedIndex === index 
                        ? "bg-primary/10 border border-primary/30" 
                        : "hover:bg-white/5 border border-transparent"
                    )}
                    onClick={() => {
                      window.location.href = `/artworks/${result.artwork.id}`
                    }}
                  >
                    <div className="flex gap-3">
                      {/* Artwork Thumbnail */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={result.artwork.image_url}
                          alt={result.artwork.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-1 right-1">
                          {getMatchBadge(result.matchedFields)}
                        </div>
                      </div>

                      {/* Artwork Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {result.artwork.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          by {result.artwork.artist_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            {result.artwork.view_count}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Heart className="w-3 h-3" />
                            {Math.floor(result.artwork.view_count * 0.1)}
                          </div>
                          <Badge variant="outline" className="text-xs border-border/50">
                            {result.artwork.category}
                          </Badge>
                        </div>
                      </div>

                      {/* Relevance Indicator */}
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary/60" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* View All Results */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-primary hover:bg-primary/10"
                  onClick={() => {
                    onSearch(query)
                    setIsOpen(false)
                  }}
                >
                  <span>View all results for "{query}"</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
