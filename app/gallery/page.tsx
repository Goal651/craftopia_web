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
import { useArtworkSearch } from "@/hooks/use-artwork-search"
import { ArtworkRecord, ArtworkCategory } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { GalleryErrorBoundary } from '@/components/error-boundaries'
import { ArtworkImage } from '@/components/ui/artwork-image'
import { ArtCard } from "@/components/ui/art-card"
import { Eye, Heart, ChevronLeft, ChevronRight, AlertCircle, Palette, RefreshCw, Search as SearchIcon, Filter } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"

const ITEMS_PER_PAGE = 12

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
  const { fetchArtworks, artworks, loading, error } = useArt()

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [selectedCategory, setSelectedCategory] = useState<ArtworkCategory | 'all'>('all')

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

  const [isSearchMode, setIsSearchMode] = useState(false)

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




  const LoadingSkeleton = () => (
    <div className="gallery-grid">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-border/50 glass-card bg-card/30">
          <Skeleton className="aspect-[3/4] w-full bg-muted/50" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-16 bg-muted/50" />
            <Skeleton className="h-5 w-3/4 bg-muted/50" />
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-4 w-2/3 bg-muted/50" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ErrorDisplay = () => (
    <div className="text-center py-16">
      <div className="space-y-6">
        <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Failed to Load Gallery</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
        </div>
        <Button
          onClick={()=>{}}
          className="btn-primary"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Try Again
        </Button>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="space-y-6">
        <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
          <Palette className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">No Artworks Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
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

  const PaginationControls = () => {
    const currentPagination = isSearchMode && searchResults ? searchResults.pagination : pagination

    if (currentPagination.totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const { currentPage, totalPages } = currentPagination
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages)
      return pages
    }

    const isLoading = isSearchMode ? searchLoading : loading

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { }}
          disabled={!currentPagination.hasPrevPage || isLoading}
          className="glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted"
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
              onClick={() => typeof page === 'number' ? {}: undefined}
              disabled={typeof page !== 'number' || isLoading}
              className={
                page === currentPagination.currentPage
                  ? "btn-primary min-w-[40px]"
                  : typeof page === 'number'
                    ? "glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted min-w-[40px]"
                    : "glass border-0 bg-transparent text-muted-foreground/30 cursor-default min-w-[40px]"
              }
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => { }}
          disabled={!currentPagination.hasNextPage || isLoading}
          className="glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <GalleryErrorBoundary>
      <div className="min-h-screen pt-4">
        <div className="container mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-light text-foreground">
                Public <span className="text-gradient-primary font-medium">Gallery</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover amazing artworks from our community of talented artists. Each piece tells a unique story.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSearch={() => { }}
                onClear={() => { }}
                placeholder="Search artworks, artists, or descriptions..."
                loading={searchLoading}
                initialValue={currentQuery}
              />
            </div>

            <div className="flex justify-center">
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>
                  </div>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value: ArtworkCategory | 'all') => { }}
                  >
                    <SelectTrigger className="w-48 glass border-border/50 bg-background/50 text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50">
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-foreground hover:bg-muted"
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
                      onClick={() =>  { }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {isSearchMode && hasResults && (
              <div className="text-center space-y-2">
                <h2 className="text-xl font-medium text-foreground">
                  Search Results for "{currentQuery}"
                  {currentCategory && currentCategory !== 'all' && (
                    <span className="text-muted-foreground"> in {CATEGORY_OPTIONS.find(opt => opt.value === currentCategory)?.label}</span>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  Found {searchResults?.pagination.totalItems} artwork{searchResults?.pagination.totalItems !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {!isSearchMode && selectedCategory !== 'all' && !loading && !error && (
              <div className="text-center space-y-2">
                <h2 className="text-xl font-medium text-foreground">
                  {CATEGORY_OPTIONS.find(opt => opt.value === selectedCategory)?.label} Artworks
                </h2>
                <p className="text-muted-foreground">
                  Showing {pagination.totalItems} artwork{pagination.totalItems !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {!loading && !error && !isSearchMode && (
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
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

            {(loading || searchLoading) && <LoadingSkeleton />}

            {error && !loading && !isSearchMode && <ErrorDisplay />}

            {searchError && isSearchMode && (
              <div className="text-center py-16">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Search Failed</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">{searchError}</p>
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

            {!loading && !error && artworks.length === 0 && !isSearchMode && <EmptyState />}

            {isSearchMode && searchIsEmpty && !searchLoading && !searchError && (
              <div className="text-center py-16">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">No Results Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No artworks match your search for "{currentQuery}". Try different keywords or browse all artworks.
                    </p>
                  </div>
                  <Button
                    onClick={()=>{}}
                    className="btn-primary"
                  >
                    Browse All Artworks
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && artworks.length > 0 && !isSearchMode && (
              <>
                <motion.div layout className="gallery-grid">
                  <AnimatePresence>
                    {artworks.map((artwork, index) => (
                      <ArtCard
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

            {isSearchMode && hasResults && searchResults && searchResults.artworks.length > 0 && !searchLoading && !searchError && (
              <>
                <motion.div layout className="gallery-grid">
                  <AnimatePresence>
                    {searchResults.artworks.map((artwork, index) => (
                      <ArtCard
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
      </div>
    </GalleryErrorBoundary>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PublicGalleryPageContent />
    </Suspense>
  )
}