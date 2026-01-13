"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SearchBar } from "@/components/ui/search-bar"
import { SearchHighlight } from "@/components/ui/search-highlight"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useArtworkSearch } from "@/hooks/use-artwork-search"
import { useRealtimeArtworks } from "@/hooks/use-realtime-artworks"
import { ArtworkRecord, ArtworkCategory } from "@/types/index"

// Type assertion function to ensure category is valid
function assertArtworkRecord(data: any): ArtworkRecord {
  return {
    ...data,
    category: data.category as ArtworkCategory
  }
}
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { GalleryErrorBoundary } from '@/components/error-boundaries'
import { ArtworkImage } from '@/components/ui/artwork-image'
import { ImagePerformanceMonitor } from '@/components/ui/image-performance-monitor'
import { RealtimeNotification } from '@/components/ui/realtime-notification'
import { Eye, Heart, ChevronLeft, ChevronRight, AlertCircle, Palette, RefreshCw, Search as SearchIcon, Filter, Wifi, WifiOff } from "lucide-react"

const ITEMS_PER_PAGE = 12

// Category options for filtering
const CATEGORY_OPTIONS: { value: ArtworkCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'painting', label: 'Painting' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'photography', label: 'Photography' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'other', label: 'Other' }
]

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function PublicGalleryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [artworks, setArtworks] = useState<ArtworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [retryCount, setRetryCount] = useState(0)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory | 'all'>('all')
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const [newArtworkNotification, setNewArtworkNotification] = useState<ArtworkRecord | null>(null)

  // Initialize from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category') as ArtworkCategory | null
    const searchParam = searchParams.get('q')
    
    if (categoryParam && CATEGORY_OPTIONS.some(opt => opt.value === categoryParam)) {
      setSelectedCategory(categoryParam)
    }
    
    if (searchParam) {
      setIsSearchMode(true)
    }
  }, [searchParams])

  // Search functionality with category support
  const {
    searchResults,
    loading: searchLoading,
    error: searchError,
    currentQuery,
    currentCategory,
    search,
    searchWithCategory,
    clearSearch,
    goToPage: searchGoToPage,
    hasResults,
    isEmpty: searchIsEmpty
  } = useArtworkSearch({
    initialQuery: searchParams.get('q') || '',
    initialCategory: (searchParams.get('category') as ArtworkCategory) || 'all'
  })

  const supabase = createClient()

  // Real-time updates for new artworks and view count changes
  const { isConnected: realtimeConnected, error: realtimeError, reconnect: reconnectRealtime } = useRealtimeArtworks({
    onNewArtwork: (newArtwork) => {
      // Show notification for new artwork
      setNewArtworkNotification(newArtwork)
      
      // Only add to gallery if not in search mode and matches current category filter
      if (!isSearchMode && (selectedCategory === 'all' || newArtwork.category === selectedCategory)) {
        setArtworks(prev => {
          // Check if artwork already exists to prevent duplicates
          if (prev.some(artwork => artwork.id === newArtwork.id)) {
            return prev
          }
          // Add new artwork to the beginning of the list
          return [newArtwork, ...prev]
        })
        
        // Update pagination info
        setPagination(prev => ({
          ...prev,
          totalItems: prev.totalItems + 1,
          totalPages: Math.ceil((prev.totalItems + 1) / ITEMS_PER_PAGE)
        }))
      }
    },
    onArtworkUpdate: (updatedArtwork) => {
      // Update artwork in current list if it exists
      setArtworks(prev => prev.map(artwork => 
        artwork.id === updatedArtwork.id ? updatedArtwork : artwork
      ))
    },
    onArtworkDelete: (artworkId) => {
      // Remove artwork from current list
      setArtworks(prev => {
        const filtered = prev.filter(artwork => artwork.id !== artworkId)
        // Update pagination if we removed an item
        if (filtered.length !== prev.length) {
          setPagination(prevPag => ({
            ...prevPag,
            totalItems: Math.max(0, prevPag.totalItems - 1),
            totalPages: Math.ceil(Math.max(0, prevPag.totalItems - 1) / ITEMS_PER_PAGE)
          }))
        }
        return filtered
      })
    },
    onViewCountUpdate: (artworkId, newViewCount) => {
      // Update view count for specific artwork
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId ? { ...artwork, view_count: newViewCount } : artwork
      ))
    },
    enabled: realtimeEnabled && !isSearchMode // Only enable for gallery view, not search
  })

  const fetchArtworks = async (page: number = 1, category: ArtworkCategory | 'all' = 'all') => {
    try {
      setLoading(true)
      setError(null)

      // Calculate offset for pagination
      const offset = (page - 1) * ITEMS_PER_PAGE

      // Build query with category filter
      let queryBuilder = supabase
        .from('artworks')
        .select('*', { count: 'exact' })

      // Add category filter if not 'all'
      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      // Get total count first
      const { count, error: countError } = await queryBuilder

      if (countError) {
        throw new Error(`Failed to get artwork count: ${countError.message}`)
      }

      // Get paginated artworks with same filters
      queryBuilder = supabase
        .from('artworks')
        .select('*')

      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data, error: fetchError } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (fetchError) {
        throw new Error(`Failed to fetch artworks: ${fetchError.message}`)
      }

      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

      setArtworks((data || []).map(assertArtworkRecord))
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      })
      setRetryCount(0)
    } catch (err) {
      console.error('Error fetching artworks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artworks')
      setArtworks([])
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchArtworks(pagination.currentPage, selectedCategory)
  }

  const updateURL = (params: { q?: string; category?: string; page?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '1') {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })

    const newURL = typeof window !== 'undefined' 
      ? `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}` 
      : `?${newSearchParams.toString()}`
    router.replace(newURL, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    if (isSearchMode && searchResults) {
      // Handle search pagination
      searchGoToPage(newPage)
      updateURL({ q: currentQuery, category: currentCategory, page: newPage.toString() })
    } else {
      // Handle regular gallery pagination
      if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
        fetchArtworks(newPage, selectedCategory)
        updateURL({ category: selectedCategory, page: newPage.toString() })
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearchMode(true)
      searchWithCategory(query, selectedCategory)
      updateURL({ q: query, category: selectedCategory })
    } else {
      handleClearSearch()
    }
  }

  const handleClearSearch = () => {
    setIsSearchMode(false)
    clearSearch()
    updateURL({ category: selectedCategory })
    // Refresh gallery data if needed
    if (artworks.length === 0) {
      fetchArtworks(1, selectedCategory)
    }
  }

  const handleCategoryChange = (category: ArtworkCategory | 'all') => {
    setSelectedCategory(category)
    
    if (isSearchMode && currentQuery) {
      // Update search with new category
      searchWithCategory(currentQuery, category)
      updateURL({ q: currentQuery, category })
    } else {
      // Update gallery with new category
      setIsSearchMode(false)
      clearSearch()
      fetchArtworks(1, category)
      updateURL({ category })
    }
  }

  useEffect(() => {
    // Initialize with URL parameters or defaults
    const initialCategory = selectedCategory
    fetchArtworks(1, initialCategory)
  }, [selectedCategory]) // Re-fetch when category changes

  // Artwork Card Component with search highlighting
  const ArtworkCard = ({ artwork, index, searchQuery }: { 
    artwork: ArtworkRecord; 
    index: number; 
    searchQuery: string;
  }) => (
    <motion.div
      key={artwork.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group cursor-pointer overflow-hidden border-0 glass-card card-hover">
        <Link href={`/gallery/${artwork.id}`}>
          <div className="relative aspect-[3/4] overflow-hidden">
            <ArtworkImage
              src={artwork.image_url}
              alt={artwork.title}
              title={artwork.title}
              category={artwork.category}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              variant="galleryCard"
              enableOptimizations={true}
              aspectRatio="3/4"
              maxRetries={2}
              showLoadingTime={process.env.NODE_ENV === 'development'}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Action Buttons */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-2">
                <Button size="sm" className="btn-primary shadow-lg">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </div>
            </div>

            {/* View Count */}
            {artwork.view_count > 0 && (
              <div className="absolute top-3 right-3 glass rounded-full px-2 py-1">
                <div className="flex items-center gap-1 text-xs text-white">
                  <Eye className="w-3 h-3" />
                  <span>{artwork.view_count}</span>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                {artwork.category.replace('-', ' ')}
              </Badge>
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                <SearchHighlight 
                  text={artwork.title} 
                  searchTerm={searchQuery}
                />
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                <SearchHighlight 
                  text={artwork.description || 'No description provided'} 
                  searchTerm={searchQuery}
                />
              </p>
              <div className="flex items-center justify-between pt-2">
                <Link 
                  href={`/gallery/artist/${artwork.artist_id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  by <SearchHighlight 
                    text={artwork.artist_name} 
                    searchTerm={searchQuery}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  />
                </Link>
                <span className="text-xs text-gray-500">
                  {new Date(artwork.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="gallery-grid">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-0 glass-card">
          <Skeleton className="aspect-[3/4] w-full bg-gray-700/50" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-16 bg-gray-700/50" />
            <Skeleton className="h-5 w-3/4 bg-gray-700/50" />
            <Skeleton className="h-4 w-full bg-gray-700/50" />
            <Skeleton className="h-4 w-2/3 bg-gray-700/50" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Error component
  const ErrorDisplay = () => (
    <div className="text-center py-16">
      <div className="space-y-6">
        <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Failed to Load Gallery</h3>
          <p className="text-gray-400 max-w-md mx-auto">{error}</p>
        </div>
        <Button
          onClick={handleRetry}
          className="btn-primary"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
      </div>
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="space-y-6">
        <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
          <Palette className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">No Artworks Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            The public gallery is waiting for artists to share their creations. Be the first to upload!
          </p>
        </div>
        <Button asChild className="btn-primary">
          <Link href="/upload">
            Upload Artwork
          </Link>
        </Button>
      </div>
    </div>
  )

  // Pagination component
  const PaginationControls = () => {
    const currentPagination = isSearchMode && searchResults ? searchResults.pagination : pagination
    
    if (currentPagination.totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const { currentPage, totalPages } = currentPagination
      
      // Always show first page
      pages.push(1)
      
      // Add ellipsis if needed
      if (currentPage > 3) {
        pages.push('...')
      }
      
      // Add pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }
      
      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages)
      }
      
      return pages
    }

    const isLoading = isSearchMode ? searchLoading : loading

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPagination.currentPage - 1)}
          disabled={!currentPagination.hasPrevPage || isLoading}
          className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPagination.currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
              disabled={typeof page !== 'number' || isLoading}
              className={
                page === currentPagination.currentPage
                  ? "btn-primary min-w-[40px]"
                  : typeof page === 'number'
                  ? "glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10 min-w-[40px]"
                  : "glass border-0 bg-transparent text-gray-500 cursor-default min-w-[40px]"
              }
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPagination.currentPage + 1)}
          disabled={!currentPagination.hasNextPage || isLoading}
          className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <GalleryErrorBoundary>
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNav 
            items={[
              { label: "Community Gallery", current: true }
            ]}
          />

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-light text-white">
              Public <span className="text-gradient-blue font-medium">Gallery</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover amazing artworks from our community of talented artists. Each piece tells a unique story.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search artworks, artists, or descriptions..."
              loading={searchLoading}
              initialValue={currentQuery}
            />
          </div>

          {/* Real-time Connection Status */}
          {realtimeEnabled && !isSearchMode && (
            <div className="flex justify-center">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                realtimeConnected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {realtimeConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Live updates active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Reconnecting...</span>
                    {realtimeError && (
                      <button
                        onClick={reconnectRealtime}
                        className="ml-2 underline hover:no-underline"
                      >
                        Retry
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex justify-center">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Filter by category:</span>
                </div>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value: ArtworkCategory | 'all') => handleCategoryChange(value)}
                >
                  <SelectTrigger className="w-48 glass border-0 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-0">
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-white hover:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryChange('all')}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    Clear filter
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results Header */}
          {isSearchMode && hasResults && (
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-white">
                Search Results for "{currentQuery}"
                {currentCategory && currentCategory !== 'all' && (
                  <span className="text-gray-400"> in {CATEGORY_OPTIONS.find(opt => opt.value === currentCategory)?.label}</span>
                )}
              </h2>
              <p className="text-gray-400">
                Found {searchResults?.pagination.totalItems} artwork{searchResults?.pagination.totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Category Filter Results Header */}
          {!isSearchMode && selectedCategory !== 'all' && !loading && !error && (
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-white">
                {CATEGORY_OPTIONS.find(opt => opt.value === selectedCategory)?.label} Artworks
              </h2>
              <p className="text-gray-400">
                Showing {pagination.totalItems} artwork{pagination.totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          )}
            
          {/* Stats */}
          {!loading && !error && !isSearchMode && (
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>{pagination.totalItems} artworks</span>
              </div>
              {pagination.totalPages > 1 && (
                <div>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {/* Loading state */}
          {(loading || searchLoading) && <LoadingSkeleton />}
          
          {/* Error states */}
          {error && !loading && !isSearchMode && <ErrorDisplay />}
          {searchError && isSearchMode && (
            <div className="text-center py-16">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Search Failed</h3>
                  <p className="text-gray-400 max-w-md mx-auto">{searchError}</p>
                </div>
                <Button
                  onClick={() => search(currentQuery)}
                  className="btn-primary"
                  disabled={searchLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${searchLoading ? 'animate-spin' : ''}`} />
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Empty states */}
          {!loading && !error && artworks.length === 0 && !isSearchMode && <EmptyState />}
          {isSearchMode && searchIsEmpty && !searchLoading && !searchError && (
            <div className="text-center py-16">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">No Results Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    No artworks match your search for "{currentQuery}". Try different keywords or browse all artworks.
                  </p>
                </div>
                <Button
                  onClick={handleClearSearch}
                  className="btn-primary"
                >
                  Browse All Artworks
                </Button>
              </div>
            </div>
          )}
          
          {/* Artworks Grid - Regular Gallery */}
          {!loading && !error && artworks.length > 0 && !isSearchMode && (
            <>
              <motion.div layout className="gallery-grid">
                <AnimatePresence>
                  {artworks.map((artwork, index) => (
                    <ArtworkCard 
                      key={artwork.id} 
                      artwork={artwork} 
                      index={index}
                      searchQuery=""
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              <PaginationControls />
            </>
          )}

          {/* Artworks Grid - Search Results */}
          {isSearchMode && hasResults && searchResults && searchResults.artworks.length > 0 && !searchLoading && !searchError && (
            <>
              <motion.div layout className="gallery-grid">
                <AnimatePresence>
                  {searchResults.artworks.map((artwork, index) => (
                    <ArtworkCard 
                      key={artwork.id} 
                      artwork={artwork} 
                      index={index}
                      searchQuery={currentQuery}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              <PaginationControls />
            </>
          )}
        </motion.div>
      </div>
      
      {/* Image Performance Monitor (development only) */}
      <ImagePerformanceMonitor showDetails={true} />
      
      {/* Real-time New Artwork Notification */}
      <RealtimeNotification
        newArtwork={newArtworkNotification}
        onDismiss={() => setNewArtworkNotification(null)}
        onView={() => {
          if (newArtworkNotification) {
            router.push(`/gallery/${newArtworkNotification.id}`)
          }
        }}
      />
    </div>
    </GalleryErrorBoundary>
  )
}

export default function PublicGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <PublicGalleryPageContent />
    </Suspense>
  )
}