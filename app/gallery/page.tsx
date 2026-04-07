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
      <div className="min-h-screen pt-4">
        <div className="container mx-auto px-4 py-12">
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
      <div className="min-h-screen pt-4">
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
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
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PublicGalleryPageContent />
    </Suspense>
  )
}
