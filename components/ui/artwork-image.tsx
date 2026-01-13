"use client"

import { useState, useCallback } from "react"
import { OptimizedArtworkImage } from "./optimized-image"
import { ResponsiveArtworkImage } from "./responsive-image"
import { ArtworkGenerator } from "./artwork-generator"
import { cn } from "@/lib/utils"

interface ArtworkImageProps {
  src?: string
  alt: string
  title: string
  category?: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  aspectRatio?: string
  variant?: 'galleryCard' | 'artworkDetail' | 'hero' | 'avatar'
  enableOptimizations?: boolean
  showLoadingTime?: boolean
  maxRetries?: number
  onLoad?: () => void
  onError?: (error: string) => void
}

export function ArtworkImage({ 
  src, 
  alt, 
  title, 
  category = "abstract",
  width = 400, 
  height = 400,
  fill = false,
  className = "",
  priority = false,
  sizes,
  aspectRatio,
  variant = 'galleryCard',
  enableOptimizations = true,
  showLoadingTime = false,
  maxRetries = 2,
  onLoad,
  onError
}: ArtworkImageProps) {
  const [imageError, setImageError] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Convert category to artwork style for fallback generator
  const getArtworkStyle = (cat: string): "abstract" | "digital" | "painting" | "sculpture" | "photography" | "mixed" => {
    const lowerCat = cat.toLowerCase()
    if (lowerCat.includes('digital')) return 'digital'
    if (lowerCat.includes('paint')) return 'painting'
    if (lowerCat.includes('sculpt')) return 'sculpture'
    if (lowerCat.includes('photo')) return 'photography'
    if (lowerCat.includes('mixed')) return 'mixed'
    return 'abstract'
  }

  // Generate a seed from the title for consistent artwork generation
  const seed = title + category

  const handleImageError = useCallback((error: string) => {
    setImageError(true)
    setShowFallback(true)
    onError?.(error)
  }, [onError])

  const handleImageLoad = useCallback(() => {
    setImageError(false)
    setShowFallback(false)
    onLoad?.()
  }, [onLoad])

  // If no src provided or image failed to load after retries, show generated artwork
  if (!src || showFallback) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <ArtworkGenerator
          seed={seed}
          width={width}
          height={height}
          style={getArtworkStyle(category)}
          className="w-full h-full"
        />
        {/* Overlay to indicate this is a fallback */}
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="glass rounded px-2 py-1 text-xs text-white/80">
            Generated Artwork
          </div>
        </div>
      </div>
    )
  }

  // Use optimized responsive image if optimizations are enabled
  if (enableOptimizations) {
    return (
      <ResponsiveArtworkImage
        src={src}
        artworkTitle={title}
        category={category}
        variant={variant}
        className={className}
        priority={priority}
        aspectRatio={aspectRatio}
        onLoad={handleImageLoad}
        onError={handleImageError}
        showLoadingTime={showLoadingTime}
      />
    )
  }

  // Fallback to optimized image without responsive features
  return (
    <OptimizedArtworkImage
      src={src}
      artworkTitle={title}
      category={category}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      aspectRatio={aspectRatio}
      onLoad={handleImageLoad}
      onError={handleImageError}
      showLoadingTime={showLoadingTime}
      maxRetries={maxRetries}
      enableProgressiveLoading={true}
      enableLazyLoading={!priority}
    />
  )
}
