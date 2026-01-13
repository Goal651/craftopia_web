"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { ArtworkRecord } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"
import { ArrowLeft, Eye, Heart, Share2, Calendar, User, AlertCircle, RefreshCw } from "lucide-react"

export default function ArtworkDetailPage() {
  const params = useParams()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<ArtworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewCountUpdated, setViewCountUpdated] = useState(false)

  const supabase = createClient()

  const fetchArtwork = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Artwork not found')
        }
        throw new Error(`Failed to fetch artwork: ${fetchError.message}`)
      }

      setArtwork(data)

      // Fetch related artworks (same category or same artist, excluding current artwork)
      const { data: related, error: relatedError } = await supabase
        .from('artworks')
        .select('*')
        .neq('id', params.id)
        .or(`category.eq.${data.category},artist_id.eq.${data.artist_id}`)
        .order('created_at', { ascending: false })
        .limit(4)

      if (relatedError) {
        console.warn('Failed to fetch related artworks:', relatedError.message)
      } else {
        setRelatedArtworks(related || [])
      }

    } catch (err) {
      console.error('Error fetching artwork:', err)
      setError(err instanceof Error ? err.message : 'Failed to load artwork')
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async () => {
    if (!artwork || viewCountUpdated) return

    try {
      const { error } = await supabase
        .from('artworks')
        .update({ view_count: artwork.view_count + 1 })
        .eq('id', artwork.id)

      if (!error) {
        setArtwork(prev => prev ? { ...prev, view_count: prev.view_count + 1 } : null)
        setViewCountUpdated(true)
      }
    } catch (err) {
      console.warn('Failed to increment view count:', err)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchArtwork()
    }
  }, [params.id])

  useEffect(() => {
    if (artwork && !viewCountUpdated) {
      // Increment view count after a short delay to ensure the user is actually viewing
      const timer = setTimeout(incrementViewCount, 2000)
      return () => clearTimeout(timer)
    }
  }, [artwork, viewCountUpdated])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <div className="space-y-8">
            {/* Breadcrumb skeleton */}
            <Skeleton className="h-4 w-32 bg-gray-700/50" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full bg-gray-700/50 rounded-lg" />
              </div>
              
              {/* Details skeleton */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24 bg-gray-700/50" />
                  <Skeleton className="h-8 w-3/4 bg-gray-700/50" />
                  <Skeleton className="h-6 w-1/2 bg-gray-700/50" />
                  <Skeleton className="h-20 w-full bg-gray-700/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-16">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto glass rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                {error === 'Artwork not found' ? 'Artwork Not Found' : 'Failed to Load Artwork'}
              </h1>
              <p className="text-gray-400 max-w-md mx-auto">
                {error === 'Artwork not found' 
                  ? "The artwork you're looking for doesn't exist or may have been removed."
                  : error
                }
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchArtwork} className="btn-primary" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Try Again
              </Button>
              <Button asChild variant="outline" className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                <Link href="/gallery">Browse Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container mx-auto container-padding py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <BreadcrumbNav 
              items={[
                { label: "Community Gallery", href: "/gallery" },
                { label: artwork.title, current: true }
              ]}
            />
            <BackButton href="/gallery" label="Back to Gallery" />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg glass">
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=600&width=600"
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 capitalize">
                      {artwork.category.replace('-', ' ')}
                    </Badge>
                    <h1 className="text-3xl lg:text-4xl font-light text-white">{artwork.title}</h1>
                    <Link 
                      href={`/gallery/artist/${artwork.artist_id}`}
                      className="text-xl text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      by {artwork.artist_name}
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {artwork.description && (
                  <p className="text-gray-300 leading-relaxed text-lg">{artwork.description}</p>
                )}
              </div>

              {/* Artwork Metadata */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Artwork Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                    <div className="font-medium text-white">
                      {new Date(artwork.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Eye className="w-4 h-4" />
                      <span>Views</span>
                    </div>
                    <div className="font-medium text-white">
                      {artwork.view_count.toLocaleString()}
                    </div>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <User className="w-4 h-4" />
                      <span>Artist</span>
                    </div>
                    <Link 
                      href={`/gallery/artist/${artwork.artist_id}`}
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {artwork.artist_name}
                    </Link>
                  </div>

                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Badge className="w-4 h-4 bg-transparent border-0 p-0" />
                      <span>Category</span>
                    </div>
                    <div className="font-medium text-white capitalize">
                      {artwork.category.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full btn-primary">
                  <Link href={`/gallery/artist/${artwork.artist_id}`}>
                    View More by {artwork.artist_name}
                  </Link>
                </Button>
              </div>

              {/* Share URL */}
              <Card className="glass border-0">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium text-white">Share this artwork</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={typeof window !== 'undefined' ? window.location.href : ''}
                        readOnly
                        className="flex-1 bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-gray-300 text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.href)
                          }
                        }}
                        className="btn-primary"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Artworks */}
          {relatedArtworks.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl lg:text-3xl font-light text-white">Related Artworks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArtworks.map((relatedArtwork) => (
                  <Card key={relatedArtwork.id} className="group overflow-hidden border-0 glass-card card-hover">
                    <Link href={`/gallery/${relatedArtwork.id}`}>
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={relatedArtwork.image_url}
                          alt={relatedArtwork.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=400&width=300"
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* View Count */}
                        {relatedArtwork.view_count > 0 && (
                          <div className="absolute top-3 right-3 glass rounded-full px-2 py-1">
                            <div className="flex items-center gap-1 text-xs text-white">
                              <Eye className="w-3 h-3" />
                              <span>{relatedArtwork.view_count}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                            {relatedArtwork.category.replace('-', ' ')}
                          </Badge>
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {relatedArtwork.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {relatedArtwork.description || 'No description provided'}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-blue-400">
                              by {relatedArtwork.artist_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(relatedArtwork.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
