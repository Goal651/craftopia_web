"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ImageOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImagePerformance } from './image-performance-monitor'

// Generate a simple blur data URL for progressive loading
function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#3b82f6') // primary-like
  gradient.addColorStop(0.5, '#10b981') // secondary-like
  gradient.addColorStop(1, '#3b82f6')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}

// Generate blur data URL on server side (fallback)
const DEFAULT_BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: (error: string) => void
  maxRetries?: number
  retryDelay?: number
  enableProgressiveLoading?: boolean
  enableLazyLoading?: boolean
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

interface ImageState {
  isLoading: boolean
  hasError: boolean
  retryCount: number
  isRetrying: boolean
  currentSrc: string
  loadStartTime: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  maxRetries = 2,
  retryDelay = 1000,
  enableProgressiveLoading = true,
  enableLazyLoading = true,
  aspectRatio,
  objectFit = 'cover',
  ...props
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: true,
    hasError: false,
    retryCount: 0,
    isRetrying: false,
    currentSrc: src,
    loadStartTime: Date.now()
  })

  const [blurData, setBlurData] = useState<string>(blurDataURL || DEFAULT_BLUR_DATA_URL)
  const imageRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Performance monitoring
  const performanceContext = useImagePerformance()

  // Register image for monitoring
  useEffect(() => {
    if (performanceContext?.registerImage) {
      performanceContext.registerImage(src)
    }
  }, [src, performanceContext])

  // Generate blur data URL on client side for better quality
  useEffect(() => {
    if (enableProgressiveLoading && !blurDataURL && typeof window !== 'undefined') {
      const generatedBlur = generateBlurDataURL()
      if (generatedBlur) {
        setBlurData(generatedBlur)
      }
    }
  }, [blurDataURL, enableProgressiveLoading])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageState.isLoading) {
            // Image is in viewport, start loading
            setImageState(prev => ({ ...prev, loadStartTime: Date.now() }))
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.1
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enableLazyLoading, priority, imageState.isLoading])

  const handleImageLoad = useCallback(() => {
    const loadTime = Date.now() - imageState.loadStartTime

    setImageState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false,
      isRetrying: false
    }))

    // Track performance
    if (performanceContext?.trackImageLoad) {
      performanceContext.trackImageLoad(src, loadTime)
    }

    onLoad?.()

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image loaded in ${loadTime}ms:`, src)
    }
  }, [imageState.loadStartTime, onLoad, src, performanceContext])

  const handleImageError = useCallback(() => {
    const now = Date.now()

    setImageState(prevState => {
      // If we haven't reached max retries and enough time has passed
      if (prevState.retryCount < maxRetries && (now - prevState.loadStartTime) > retryDelay) {
        const cacheBustingSrc = `${src}?retry=${prevState.retryCount + 1}&t=${now}`

        return {
          ...prevState,
          currentSrc: cacheBustingSrc,
          retryCount: prevState.retryCount + 1,
          isRetrying: true,
          loadStartTime: now
        }
      } else {
        // Max retries reached
        const errorMessage = `Failed to load image after ${prevState.retryCount} retries`

        // Track error
        if (performanceContext?.trackImageError) {
          performanceContext.trackImageError(src, errorMessage)
        }

        onError?.(errorMessage)

        return {
          ...prevState,
          hasError: true,
          isLoading: false,
          isRetrying: false
        }
      }
    })
  }, [src, maxRetries, retryDelay, onError, performanceContext])

  const handleManualRetry = useCallback(() => {
    const now = Date.now()
    const cacheBustingSrc = `${src}?manual_retry=${now}`

    setImageState(prev => ({
      ...prev,
      currentSrc: cacheBustingSrc,
      hasError: false,
      isLoading: true,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      loadStartTime: now
    }))
  }, [src])

  // Error state UI
  if (imageState.hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-muted/30 border border-border/50 rounded-lg",
          fill ? "absolute inset-0" : "",
          aspectRatio && `aspect-[${aspectRatio}]`,
          className
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div className="text-center p-4 space-y-3">
          <div className="w-12 h-12 mx-auto glass rounded-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Image failed to load
            </p>
            <p className="text-xs text-muted-foreground">
              Tried {imageState.retryCount} time{imageState.retryCount !== 1 ? 's' : ''}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRetry}
            disabled={imageState.isRetrying}
            className="glass border-border/50 bg-background/50 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn(
              "w-3 h-3 mr-1",
              imageState.isRetrying && "animate-spin"
            )} />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Prepare image props
  const imageProps = {
    ref: imageRef,
    src: imageState.currentSrc,
    alt,
    onLoad: handleImageLoad,
    onError: handleImageError,
    quality,
    sizes,
    priority,
    placeholder: enableProgressiveLoading ? placeholder : 'empty' as const,
    blurDataURL: enableProgressiveLoading ? blurData : undefined,
    className: cn(
      `object-${objectFit} transition-opacity duration-500`,
      imageState.isLoading && enableProgressiveLoading ? 'opacity-0' : 'opacity-100',
      imageState.isRetrying && 'opacity-50',
      className
    ),
    ...props
  }

  // Container for aspect ratio and loading states
  const containerProps = {
    className: cn(
      "relative overflow-hidden",
      aspectRatio && `aspect-[${aspectRatio}]`,
      !fill && !aspectRatio && width && height && `w-[${width}px] h-[${height}px]`
    ),
    style: aspectRatio ? { aspectRatio } : undefined
  }

  if (fill) {
    return (
      <div {...containerProps}>
        {/* Loading skeleton */}
        {imageState.isLoading && enableProgressiveLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse" />
        )}

        <Image {...imageProps} fill />

        {/* Loading indicator */}
        {imageState.isRetrying && (
          <div className="absolute top-2 right-2 glass rounded-full p-1">
            <RefreshCw className="w-3 h-3 text-primary animate-spin" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div {...containerProps}>
      {/* Loading skeleton */}
      {imageState.isLoading && enableProgressiveLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse" />
      )}

      <Image
        {...imageProps}
        width={width}
        height={height}
      />

      {/* Loading indicator */}
      {imageState.isRetrying && (
        <div className="absolute top-2 right-2 glass rounded-full p-1">
          <RefreshCw className="w-3 h-3 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}

// Specialized component for artwork images with optimizations
interface OptimizedArtworkImageProps extends Omit<OptimizedImageProps, 'alt'> {
  artworkTitle: string
  category?: string
  showLoadingTime?: boolean
}

export function OptimizedArtworkImage({
  artworkTitle,
  category,
  showLoadingTime = false,
  ...props
}: OptimizedArtworkImageProps) {
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const startTime = useRef<number>(Date.now())

  const handleLoad = useCallback(() => {
    const time = Date.now() - startTime.current
    setLoadTime(time)
    props.onLoad?.()
  }, [props])

  return (
    <div className="relative">
      <OptimizedImage
        {...props}
        alt={`${artworkTitle}${category ? ` - ${category}` : ''}`}
        onLoad={handleLoad}
        // Artwork-specific optimizations
        quality={85} // Higher quality for artwork
        enableProgressiveLoading={true}
        enableLazyLoading={!props.priority}
      />

      {/* Load time indicator (development only) */}
      {showLoadingTime && loadTime && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 glass rounded px-2 py-1 text-xs text-foreground/80">
          {loadTime}ms
        </div>
      )}
    </div>
  )
}

// Hook for managing multiple image loading states
export function useOptimizedImageLoader(images: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    images.reduce((acc, src) => ({ ...acc, [src]: true }), {})
  )

  const handleImageLoad = useCallback((src: string) => {
    setLoadingStates(prev => ({ ...prev, [src]: false }))
  }, [])

  const allLoaded = Object.values(loadingStates).every(loading => !loading)
  const loadedCount = Object.values(loadingStates).filter(loading => !loading).length
  const totalCount = images.length
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0

  return {
    loadingStates,
    handleImageLoad,
    allLoaded,
    loadedCount,
    totalCount,
    progress
  }
}