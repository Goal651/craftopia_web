"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { getArtistStats, getArtistArtworks, generatePageNumbers } from "@/lib/supabase/pagination"
import { ArtworkRecord, UserProfile } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { 
  ArrowLeft, 
  Eye, 
  Calendar, 
  User, 
  Palette,
  AlertCircle, 
  RefreshCw,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const ITEMS_PER_PAGE = 12

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function ArtistProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [artist, setArtist] = useState<UserProfile | null>(null)
  const [artworks, setArtworks] = useState<ArtworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [artworksLoading, setArtworksLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const supabase = createClient()
  const artistId = params.id as string

  // Get current page from URL parameters
  const currentPage = parseInt(searchParams.get('page') || '1')

  const fetchArtistProfile = async () => {
    try {
      const artistStats = await getArtistStats(artistId)
      setArtist(artistStats)
    } catch (err) {
      console.error('Error fetching artist profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artist profile')
    }
  }

  const fetchArtworks = async (page: number = 1) => {
    try {
      setArtworksLoading(true)
      
      const result = await getArtistArtworks(artistId, {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: 'newest'
      })

      setArtworks(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Error fetching artworks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artworks')
    } finally {
      setArtworksLoading(false)
    }
  }

  const fetchArtistData = async () => {
    try {
      setLoading(true)
      setError(null)

      await fetchArtistProfile()
      await fetchArtworks(currentPage)
    } catch (err) {
      // Error handling is done in individual functions
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !artworksLoading) {
      // Update URL with new page parameter
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (newPage > 1) {
        newSearchParams.set('page', newPage.toString())
      } else {
        newSearchParams.delete('page')
      }
      
      const newURL = typeof window !== 'undefined' 
        ? `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}` 
        : `?${newSearchParams.toString()}`
      router.replace(newURL, { scroll: false })
      
      // Fetch new page data
      fetchArtworks(newPage)
      
      // Scroll to artworks section
      const artworksSection = document.getElementById('artworks-section')
      if (artworksSection) {
        artworksSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    if (artistId) {
      fetchArtistData()
    }
  }, [artistId])

  // Handle page changes from URL
  useEffect(() => {
    if (artist && currentPage !== pagination.currentPage) {
      fetchArtworks(currentPage)
    }
  }, [currentPage, artist])

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <div className="space-y-8">
            {/* Back button skeleton */}
            <Skeleton className="h-10 w-32 bg-gray-700/50" />
            
            {/* Profile header skeleton */}
            <Card className="border-0 glass-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="w-32 h-32 rounded-full bg-gray-700/50" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-1/3 bg-gray-700/50" />
                    <Skeleton className="h-4 w-1/4 bg-gray-700/50" />
                    <Skeleton className="h-16 w-full bg-gray-700/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Artworks grid skeleton */}
            <div className="gallery-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border-0 glass-card">
                  <Skeleton className="aspect-[3/4] w-full bg-gray-700/50" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-16 bg-gray-700/50" />
                    <Skeleton className="h-5 w-3/4 bg-gray-700/50" />
                    <Skeleton className="h-4 w-full bg-gray-700/50" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <div className="text-center py-16">
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Artist Not Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">{error}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <BackButton label="Go Back" />
                <Button
                  onClick={fetchArtistData}
                  className="btn-primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return null
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto container-padding py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-8"
        >
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <BreadcrumbNav 
              items={[
                { label: "Community Gallery", href: "/gallery" },
                { label: "Artists", href: "/gallery" },
                { label: artist.display_name, current: true }
              ]}
            />
            <BackButton href="/gallery" label="Back to Gallery" />
          </div>

          {/* Artist Profile Header */}
          <Card className="border-0 glass-card">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden glass">
                    {artist.avatar_url ? (
                      <ArtworkImage
                        src={artist.avatar_url}
                        alt={artist.display_name}
                        title={artist.display_name}
                        category="avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        variant="avatar"
                        enableOptimizations={true}
                        aspectRatio="1/1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-green-500/20">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Artist Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-light text-white mb-2">
                      {artist.display_name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        <span>{artist.artwork_count || 0} artwork{(artist.artwork_count || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Joined {new Date(artist.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {artist.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                      <p className="text-gray-300 leading-relaxed">
                        {artist.bio}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {artist.total_views?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-gray-400">Total Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {artist.artwork_count || 0}
                      </p>
                      <p className="text-sm text-gray-400">Artworks</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artworks Section */}
          <div id="artworks-section" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">
                Artworks by <span className="text-gradient-blue">{artist.display_name}</span>
              </h2>
              {pagination.totalItems > 0 && (
                <div className="flex items-center gap-4 text-gray-400">
                  <p>
                    {pagination.totalItems} artwork{pagination.totalItems !== 1 ? 's' : ''}
                  </p>
                  {pagination.totalPages > 1 && (
                    <p className="text-sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Loading state for artworks */}
            {artworksLoading && (
              <div className="gallery-grid">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <Card key={index} className="overflow-hidden border-0 glass-card">
                    <Skeleton className="aspect-[3/4] w-full bg-gray-700/50" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-16 bg-gray-700/50" />
                      <Skeleton className="h-5 w-3/4 bg-gray-700/50" />
                      <Skeleton className="h-4 w-full bg-gray-700/50" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Artworks Grid */}
            {!artworksLoading && artworks.length > 0 ? (
              <>
                <motion.div layout className="gallery-grid">
                  <AnimatePresence>
                    {artworks.map((artwork, index) => (
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
                              />

                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              {/* Action Buttons */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button size="sm" className="btn-primary shadow-lg">
                                  <Eye className="w-4 h-4 mr-1" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
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
                                  {artwork.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                                  {artwork.description || 'No description provided'}
                                </p>
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(artwork.created_at).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Eye className="w-3 h-3" />
                                    <span>{artwork.view_count}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage || artworksLoading}
                      className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {generatePageNumbers(pagination.currentPage, pagination.totalPages).map((page, index) => (
                        <Button
                          key={index}
                          variant={page === pagination.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                          disabled={typeof page !== 'number' || artworksLoading}
                          className={
                            page === pagination.currentPage
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
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || artworksLoading}
                      className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : !artworksLoading && artworks.length === 0 ? (
              // Empty state for no artworks
              <div className="text-center py-16">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">No Artworks Yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {artist.display_name} hasn't uploaded any artworks to the gallery yet.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                    <Link href="/gallery">
                      Browse Other Artists
                    </Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  )
}