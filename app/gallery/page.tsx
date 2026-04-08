"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Head from 'next/head'
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LiveVisualSearch } from "@/components/ui/live-visual-search"
import { SearchHighlight } from "@/components/ui/search-highlight"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArtworkSearch } from "@/hooks/use-artwork-search"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { ArtworkImage } from '@/components/ui/artwork-image'
import { ArtCard } from "@/components/ui/art-card"
import { Eye, Heart, ChevronLeft, ChevronRight, AlertCircle, Palette, RefreshCw, Search as SearchIcon, Filter } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"

const ITEMS_PER_PAGE = 12

function PublicGalleryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchArtworks, artworks, loading, error } = useArt()
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const page = parseInt(searchParams.get('page') || '1', 10)

  // SEO: Generate structured data for gallery
  const generateStructuredData = () => {
    const baseUrl = 'https://craftopia-arts.vercel.app'
    
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Community Art Gallery - CRAFTOPIA",
      "description": "Explore our community gallery featuring diverse artworks from talented artists. Discover paintings, digital art, photography, and more in our curated collection.",
      "url": `${baseUrl}/gallery`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": artworks.length,
        "itemListElement": artworks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((artwork, index) => ({
          "@type": "VisualArtwork",
          "position": index + 1,
          "name": "Artwork",
          "creator": {
            "@type": "Person",
            "name": artwork.artist_name
          },
          "image": artwork.image_url,
          "url": `${baseUrl}/gallery/${artwork.id}`,
          "offers": {
            "@type": "Offer",
            "price": artwork.price,
            "priceCurrency": "RWF",
            "availability": artwork.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }))
      }
    }
  }

  const structuredData = generateStructuredData()


  useEffect(() => {
    const loadArtworks = async () => {
      try {
        await fetchArtworks()
      } catch (err) {
        console.error('Failed to load artworks:', err)
      }
    }

    loadArtworks()
  }, [page, fetchArtworks])

  const handleCategoryChange = (newCategory: string) => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    router.push(`/gallery?category=${newCategory}&page=1`)
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
    router.push(`/gallery?page=${newPage}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <Alert variant="destructive" className="glass border-destructive/50 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load artworks. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Community Art Gallery - Explore Artworks | CRAFTOPIA</title>
        <meta name="description" content="Explore our community gallery featuring diverse artworks from talented artists. Discover paintings, digital art, photography, and more in our curated collection." />
        <meta name="keywords" content="community art gallery, public art, art collection, contemporary artworks, artist community, online gallery, art discovery" />
        <meta name="author" content="CRAFTOPIA" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://craftopia-arts.vercel.app/gallery" />
        <meta property="og:title" content="Community Art Gallery - Explore Artworks | CRAFTOPIA" />
        <meta property="og:description" content="Explore our community gallery featuring diverse artworks from talented artists." />
        <meta property="og:image" content="https://craftopia-arts.vercel.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="CRAFTOPIA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://craftopia-arts.vercel.app/gallery" />
        <meta property="twitter:title" content="Community Art Gallery - CRAFTOPIA" />
        <meta property="twitter:description" content="Explore our community gallery featuring diverse artworks from talented artists." />
        <meta property="twitter:image" content="https://craftopia-arts.vercel.app/og-image.jpg" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://craftopia-arts.vercel.app/gallery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <header className="text-center space-y-6">
              <Badge className="glass px-6 py-2 border-primary/20 text-primary" aria-label="Artistic exploration badge">Artistic Exploration</Badge>
              <h1 className="text-4xl lg:text-7xl font-semibold tracking-tight text-foreground">
                Public <span className="text-gradient-primary">Gallery</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover amazing artworks from our community of talented artists. Each piece tells a unique story through creative expression and artistic vision.
              </p>
            </header>


          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {artworks.length} artworks
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="wait">
              {artworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <ArtCard
                    artwork={artwork}
                    index={index}
                    className="h-full transform transition-all duration-300 hover:scale-105"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PublicGalleryPageContent />
    </Suspense>
  )
}
