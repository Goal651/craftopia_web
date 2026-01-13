"use client"

import React, { useMemo } from 'react'
import { OptimizedImage, OptimizedArtworkImage } from './optimized-image'
import { cn } from '@/lib/utils'

// Responsive breakpoints matching Tailwind CSS
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface ResponsiveImageConfig {
  breakpoint: Breakpoint
  width: number
  height?: number
  quality?: number
}

interface ResponsiveImageProps {
  src: string
  alt: string
  configs: ResponsiveImageConfig[]
  defaultConfig: ResponsiveImageConfig
  className?: string
  priority?: boolean
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: (error: string) => void
  enableProgressiveLoading?: boolean
  enableLazyLoading?: boolean
}

export function ResponsiveImage({
  src,
  alt,
  configs,
  defaultConfig,
  className,
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
  enableProgressiveLoading = true,
  enableLazyLoading = true
}: ResponsiveImageProps) {
  // Generate sizes string for responsive images
  const sizes = useMemo(() => {
    const sortedConfigs = [...configs].sort((a, b) => 
      BREAKPOINTS[a.breakpoint] - BREAKPOINTS[b.breakpoint]
    )

    const sizeStrings = sortedConfigs.map(config => {
      const breakpointPx = BREAKPOINTS[config.breakpoint]
      return `(min-width: ${breakpointPx}px) ${config.width}px`
    })

    // Add default size
    sizeStrings.push(`${defaultConfig.width}px`)

    return sizeStrings.join(', ')
  }, [configs, defaultConfig])

  // Generate srcSet for different densities
  const generateSrcSet = useMemo(() => {
    const densities = [1, 1.5, 2, 3] // Support various device pixel ratios
    
    return densities.map(density => {
      const width = Math.round(defaultConfig.width * density)
      const height = defaultConfig.height ? Math.round(defaultConfig.height * density) : undefined
      
      // Add query parameters for image optimization
      const params = new URLSearchParams({
        w: width.toString(),
        q: (defaultConfig.quality || 75).toString(),
        ...(height && { h: height.toString() })
      })
      
      return `${src}?${params.toString()} ${density}x`
    }).join(', ')
  }, [src, defaultConfig])

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={defaultConfig.width}
      height={defaultConfig.height}
      fill={!defaultConfig.width || !defaultConfig.height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={defaultConfig.quality}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      onLoad={onLoad}
      onError={onError}
      enableProgressiveLoading={enableProgressiveLoading}
      enableLazyLoading={enableLazyLoading}
    />
  )
}

// Predefined responsive configurations for common use cases
export const RESPONSIVE_CONFIGS = {
  // Gallery grid images
  galleryCard: {
    configs: [
      { breakpoint: 'sm' as const, width: 300, height: 400, quality: 75 },
      { breakpoint: 'md' as const, width: 350, height: 467, quality: 80 },
      { breakpoint: 'lg' as const, width: 400, height: 533, quality: 80 },
      { breakpoint: 'xl' as const, width: 450, height: 600, quality: 85 }
    ],
    defaultConfig: { breakpoint: 'sm' as const, width: 300, height: 400, quality: 75 }
  },

  // Artwork detail page
  artworkDetail: {
    configs: [
      { breakpoint: 'sm' as const, width: 600, height: 600, quality: 85 },
      { breakpoint: 'md' as const, width: 700, height: 700, quality: 90 },
      { breakpoint: 'lg' as const, width: 800, height: 800, quality: 90 },
      { breakpoint: 'xl' as const, width: 900, height: 900, quality: 95 }
    ],
    defaultConfig: { breakpoint: 'sm' as const, width: 600, height: 600, quality: 85 }
  },

  // Artist profile avatar
  avatar: {
    configs: [
      { breakpoint: 'sm' as const, width: 80, height: 80, quality: 80 },
      { breakpoint: 'md' as const, width: 100, height: 100, quality: 85 },
      { breakpoint: 'lg' as const, width: 120, height: 120, quality: 85 }
    ],
    defaultConfig: { breakpoint: 'sm' as const, width: 80, height: 80, quality: 80 }
  },

  // Hero/featured images
  hero: {
    configs: [
      { breakpoint: 'sm' as const, width: 800, height: 600, quality: 80 },
      { breakpoint: 'md' as const, width: 1200, height: 900, quality: 85 },
      { breakpoint: 'lg' as const, width: 1600, height: 1200, quality: 90 },
      { breakpoint: 'xl' as const, width: 1920, height: 1440, quality: 95 }
    ],
    defaultConfig: { breakpoint: 'sm' as const, width: 800, height: 600, quality: 80 }
  }
} as const

// Specialized responsive artwork image component
interface ResponsiveArtworkImageProps {
  src: string
  artworkTitle: string
  category?: string
  variant?: keyof typeof RESPONSIVE_CONFIGS
  className?: string
  priority?: boolean
  aspectRatio?: string
  onLoad?: () => void
  onError?: (error: string) => void
  showLoadingTime?: boolean
}

export function ResponsiveArtworkImage({
  src,
  artworkTitle,
  category,
  variant = 'galleryCard',
  className,
  priority = false,
  aspectRatio,
  onLoad,
  onError,
  showLoadingTime = false
}: ResponsiveArtworkImageProps) {
  const config = RESPONSIVE_CONFIGS[variant]

  // Generate sizes string
  const sizes = useMemo(() => {
    const sortedConfigs = [...config.configs].sort((a, b) => 
      BREAKPOINTS[a.breakpoint] - BREAKPOINTS[b.breakpoint]
    )

    const sizeStrings = sortedConfigs.map(cfg => {
      const breakpointPx = BREAKPOINTS[cfg.breakpoint]
      return `(min-width: ${breakpointPx}px) ${cfg.width}px`
    })

    sizeStrings.push(`${config.defaultConfig.width}px`)
    return sizeStrings.join(', ')
  }, [config])

  return (
    <OptimizedArtworkImage
      src={src}
      artworkTitle={artworkTitle}
      category={category}
      width={config.defaultConfig.width}
      height={config.defaultConfig.height}
      fill={!config.defaultConfig.width || !config.defaultConfig.height}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={config.defaultConfig.quality}
      aspectRatio={aspectRatio}
      onLoad={onLoad}
      onError={onError}
      showLoadingTime={showLoadingTime}
      enableProgressiveLoading={true}
      enableLazyLoading={!priority}
    />
  )
}

// Hook for responsive image loading with performance monitoring
export function useResponsiveImagePerformance() {
  const [metrics, setMetrics] = React.useState<{
    totalImages: number
    loadedImages: number
    failedImages: number
    averageLoadTime: number
    loadTimes: number[]
  }>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    loadTimes: []
  })

  const trackImageLoad = React.useCallback((loadTime: number) => {
    setMetrics(prev => {
      const newLoadTimes = [...prev.loadTimes, loadTime]
      const averageLoadTime = newLoadTimes.reduce((sum, time) => sum + time, 0) / newLoadTimes.length

      return {
        ...prev,
        loadedImages: prev.loadedImages + 1,
        loadTimes: newLoadTimes,
        averageLoadTime
      }
    })
  }, [])

  const trackImageError = React.useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      failedImages: prev.failedImages + 1
    }))
  }, [])

  const registerImage = React.useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1
    }))
  }, [])

  const reset = React.useCallback(() => {
    setMetrics({
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      loadTimes: []
    })
  }, [])

  return {
    metrics,
    trackImageLoad,
    trackImageError,
    registerImage,
    reset
  }
}

// Utility function to generate optimized image URLs
export function generateOptimizedImageUrl(
  baseUrl: string,
  width: number,
  height?: number,
  quality: number = 75,
  format?: 'webp' | 'jpeg' | 'png'
): string {
  const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', quality.toString())
  
  if (height) {
    url.searchParams.set('h', height.toString())
  }
  
  if (format) {
    url.searchParams.set('f', format)
  }
  
  return url.toString()
}

// Component for image preloading
interface ImagePreloaderProps {
  images: string[]
  priority?: boolean
  onProgress?: (loaded: number, total: number) => void
  onComplete?: () => void
}

export function ImagePreloader({
  images,
  priority = false,
  onProgress,
  onComplete
}: ImagePreloaderProps) {
  const [loadedCount, setLoadedCount] = React.useState(0)

  React.useEffect(() => {
    if (images.length === 0) {
      onComplete?.()
      return
    }

    let loaded = 0
    const imageElements: HTMLImageElement[] = []

    const handleLoad = () => {
      loaded++
      setLoadedCount(loaded)
      onProgress?.(loaded, images.length)
      
      if (loaded === images.length) {
        onComplete?.()
      }
    }

    const handleError = () => {
      loaded++
      setLoadedCount(loaded)
      onProgress?.(loaded, images.length)
      
      if (loaded === images.length) {
        onComplete?.()
      }
    }

    // Preload images
    images.forEach(src => {
      const img = new Image()
      img.onload = handleLoad
      img.onerror = handleError
      img.src = src
      imageElements.push(img)
    })

    return () => {
      // Cleanup
      imageElements.forEach(img => {
        img.onload = null
        img.onerror = null
      })
    }
  }, [images, onProgress, onComplete])

  return null // This component doesn't render anything
}