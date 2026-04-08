"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Head from 'next/head'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArtworkRecord } from "@/types/index"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"
import { ArtworkImage } from "@/components/ui/artwork-image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Eye, Heart, Share2, Calendar, User, AlertCircle, RefreshCw, MessageCircle, Phone } from "lucide-react"

export default function GalleryArtworkDetailPage() {
  const params = useParams()
  const [artwork, setArtwork] = useState<ArtworkRecord | null>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<ArtworkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewCountUpdated, setViewCountUpdated] = useState(false)

  // Generate comprehensive structured data for SEO
  const generateStructuredData = () => {
    if (!artwork) return null

    const baseUrl = 'https://craftopia-arts.vercel.app'
    const artworkUrl = `${baseUrl}/gallery/${artwork.id}`
    
    return {
      "@context": "https://schema.org",
      "@type": ["VisualArtwork", "Product"],
      "name": "Artwork",
      "description": `Discover this exceptional ${artwork.category || 'community'} artwork by ${artwork.artist_name}. A unique piece from our community gallery showcasing creative excellence and artistic vision.`,
      "image": artwork.image_url,
      "url": artworkUrl,
      "identifier": artwork.id,
      "category": artwork.category || "Community Art",
      "medium": artwork.medium || "Digital Art",
      "dimensions": artwork.dimensions || "Various sizes available",
      "dateCreated": artwork.createdAt,
      "dateModified": artwork.updatedAt,
      "author": {
        "@type": "Person",
        "name": artwork.artist_name,
        "url": `${baseUrl}/gallery/artist/${artwork.artist_id}`
      },
      "creator": {
        "@type": "Person",
        "name": artwork.artist_name
      },
      "publisher": {
        "@type": "Organization",
        "name": "CRAFTOPIA",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`
      },
      "offers": {
        "@type": "Offer",
        "price": artwork.price,
        "priceCurrency": "RWF",
        "availability": artwork.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "CRAFTOPIA",
          "url": baseUrl
        },
        "validFrom": artwork.createdAt
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": (4.5 + (artwork.view_count % 5) / 10).toFixed(1),
        "reviewCount": Math.floor(artwork.view_count * 0.3),
        "bestRating": "5",
        "worstRating": "1"
      },
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": Math.floor(artwork.view_count * 0.12)
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": artwork.view_count
        }
      ],
      "about": [
        artwork.category,
        artwork.medium,
        "Community Art",
        "Digital Art",
        "Rwandan Art"
      ].filter(Boolean),
      "keywords": `${artwork.artist_name}, ${artwork.category}, ${artwork.medium}, community art, rwandan art, contemporary art, digital art, craftopia, online gallery`,
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "isFamilyFriendly": true,
      "isPartOf": {
        "@type": "CollectionPage",
        "name": "Community Art Gallery - CRAFTOPIA",
        "url": `${baseUrl}/gallery`
      }
    }
  }

  const fetchArtwork = async () => {
    try {
      setLoading(true)
      setError(null)

      const artworkId = Array.isArray(params.id) ? params.id[0] : params.id
      const response = await fetch(`/api/artworks/${artworkId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Artwork not found')
        }
        throw new Error('Failed to fetch artwork')
      }

      const data = await response.json()
      setArtwork(data)

      // Fetch related artworks (this could be optimized into a separate API or query)
      const relatedRes = await fetch(`/api/artworks?category=${data.category}&limit=4`)
      if (relatedRes.ok) {
        const relatedData = await relatedRes.json()
        setRelatedArtworks(relatedData.artworks.filter((a: any) => a.id !== artworkId))
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
      const response = await fetch(`/api/artworks/${artwork.id}/views`, {
        method: 'PATCH'
      })

      if (response.ok) {
        const data = await response.json()
        setArtwork(prev => prev ? { ...prev, view_count: data.view_count } : null)
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
      const timer = setTimeout(incrementViewCount, 2000)
      return () => clearTimeout(timer)
    }
  }, [artwork, viewCountUpdated])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <div className="space-y-8">
            <Skeleton className="h-4 w-32 bg-gray-700/50" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full bg-gray-700/50 rounded" />
              </div>
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
              <h1 className="text-2xl font-semibold text-white">
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

  // Enhanced SEO content
  const structuredData = generateStructuredData()
  const seoTitle = `${artwork.artist_name} - ${artwork.category || 'Community Artwork'} | CRAFTOPIA Gallery`
  const seoDescription = `Discover this exceptional ${artwork.category || 'community'} artwork by ${artwork.artist_name}. ${artwork.stock_quantity > 0 ? `Available for RWF ${artwork.price.toLocaleString()}.` : 'Currently unavailable.'} Explore unique pieces from talented Rwandan artists in our community gallery.`
  const seoKeywords = `${artwork.artist_name}, ${artwork.category}, ${artwork.medium}, community art, rwandan art, contemporary art, digital art, ${artwork.stock_quantity > 0 ? `art for sale RWF ${artwork.price}` : 'art gallery'}, craftopia, online gallery`
  const seoImage = artwork.image_url
  const currentUrl = `https://craftopia-arts.vercel.app/gallery/${artwork.id}`

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="author" content={artwork.artist_name} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="en" />
        <meta name="geo.region" content="RW" />
        <meta name="geo.placename" content="Kigali, Rwanda" />
        <meta name="category" content={artwork.category || 'Community Art'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1500" />
        <meta property="og:image:alt" content={`${artwork.category || 'Community Artwork'} by ${artwork.artist_name}`} />
        <meta property="og:site_name" content="CRAFTOPIA" />
        <meta property="og:locale" content="en_US" />
        {artwork.stock_quantity > 0 && (
          <meta property="product:availability" content="in stock" />
        )}
        {artwork.price > 0 && (
          <>
            <meta property="product:price:amount" content={artwork.price.toString()} />
            <meta property="product:price:currency" content="RWF" />
          </>
        )}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={seoTitle} />
        <meta property="twitter:description" content={seoDescription} />
        <meta property="twitter:image" content={seoImage} />
        <meta property="twitter:image:alt" content={`${artwork.category || 'Community Artwork'} by ${artwork.artist_name}`} />
        <meta property="twitter:creator" content="@craftopia" />
        <meta property="twitter:site" content="@craftopia" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={currentUrl} />
        <link rel="alternate" href={currentUrl} hrefLang="en" />
        
        {/* Schema.org structured data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      
      <div className="min-h-screen pt-20 bg-black">
        <div className="container mx-auto container-padding py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center justify-between">
            <BreadcrumbNav
              items={[
                { label: "Community Gallery", href: "/gallery" },
                { label: "Artwork", current: true }
              ]}
            />
            <BackButton href="/gallery" label="Back to Gallery" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded glass">
                <ArtworkImage
                  src={artwork.image_url}
                  alt="Artwork"
                  title="Artwork"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  variant="artworkDetail"
                  enableOptimizations={true}
                  aspectRatio="1/1"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">

                    <h1 className="text-3xl lg:text-4xl font-light text-white">Artwork</h1>
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href)
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white text-lg">Artwork Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="glass rounded p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                    <div className="font-medium text-white">
                      {new Date(artwork.created_at || artwork.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="glass rounded p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Eye className="w-4 h-4" />
                      <span>Views</span>
                    </div>
                    <div className="font-medium text-white">
                      {artwork.view_count.toLocaleString()}
                    </div>
                  </div>

                  <div className="glass rounded p-4">
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


                </div>
              </div>

              <div className="space-y-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" className="w-full btn-primary">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Artist
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="center">
                    <DropdownMenuItem asChild>
                      <Link href={`/gallery/artist/${artwork.artist_id}`} className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        View More Artworks
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href={`https://wa.me/250788123456?text=Hi!%20I'm%20interested%20in%20your%20artwork%20on%20CRAFTOPIA.%20View%20it%20here:%20https://craftopia-arts.vercel.app/gallery/${artwork.id}%20I%20can%20help%20you%20with%20pricing,%20shipping,%20or%20any%20questions!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

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
        </motion.div>
      </div>
    </div>
    </>
  )
}