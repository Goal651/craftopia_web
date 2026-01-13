"use client"

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { ImageOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  fallbackSrc?: string
  maxRetries?: number
  retryDelay?: number
  onError?: (error: string) => void
  onRetrySuccess?: () => void
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

interface ImageState {
  currentSrc: string
  hasError: boolean
  retryCount: number
  isRetrying: boolean
  lastRetryTime: number
}

export function ImageFallback({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  fallbackSrc = '/placeholder.svg?height=400&width=300',
  maxRetries = 2,
  retryDelay = 1000,
  onError,
  onRetrySuccess,
  sizes,
  priority = false,
  placeholder,
  blurDataURL,
  ...props
}: ImageFallbackProps) {
  const [imageState, setImageState] = useState<ImageState>({
    currentSrc: src,
    hasError: false,
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: 0
  })

  const handleImageError = useCallback(() => {
    const now = Date.now()
    
    setImageState(prevState => {
      // If we haven't reached max retries and enough time has passed since last retry
      if (prevState.retryCount < maxRetries && (now - prevState.lastRetryTime) > retryDelay) {
        // Try the original source again with cache busting
        const cacheBustingSrc = `${src}?retry=${prevState.retryCount + 1}&t=${now}`
        
        return {
          ...prevState,
          currentSrc: cacheBustingSrc,
          retryCount: prevState.retryCount + 1,
          lastRetryTime: now,
          hasError: false
        }
      } else {
        // Max retries reached or too soon since last retry, show error state
        const errorMessage = `Failed to load image after ${prevState.retryCount} retries`
        onError?.(errorMessage)
        
        return {
          ...prevState,
          hasError: true
        }
      }
    })
  }, [src, maxRetries, retryDelay, onError])

  const handleImageLoad = useCallback(() => {
    // Reset error state on successful load
    if (imageState.hasError || imageState.retryCount > 0) {
      setImageState(prevState => ({
        ...prevState,
        hasError: false,
        isRetrying: false
      }))
      onRetrySuccess?.()
    }
  }, [imageState.hasError, imageState.retryCount, onRetrySuccess])

  const handleManualRetry = useCallback(() => {
    const now = Date.now()
    const cacheBustingSrc = `${src}?manual_retry=${now}`
    
    setImageState(prevState => ({
      ...prevState,
      currentSrc: cacheBustingSrc,
      hasError: false,
      isRetrying: true,
      retryCount: prevState.retryCount + 1,
      lastRetryTime: now
    }))
  }, [src])

  const handleUseFallback = useCallback(() => {
    setImageState(prevState => ({
      ...prevState,
      currentSrc: fallbackSrc,
      hasError: false,
      isRetrying: false
    }))
  }, [fallbackSrc])

  // If we have an error and haven't switched to fallback, show error UI
  if (imageState.hasError && imageState.currentSrc !== fallbackSrc) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-gray-800/50 border border-gray-700/50 rounded-lg",
        fill ? "absolute inset-0" : "",
        className
      )}>
        <div className="text-center p-4 space-y-3">
          <div className="w-12 h-12 mx-auto glass rounded-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-300">
              Image failed to load
            </p>
            <p className="text-xs text-gray-500">
              Tried {imageState.retryCount} time{imageState.retryCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRetry}
              disabled={imageState.isRetrying}
              className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn(
                "w-3 h-3 mr-1",
                imageState.isRetrying && "animate-spin"
              )} />
              Retry
            </Button>
            
            {fallbackSrc && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUseFallback}
                className="text-gray-400 hover:text-gray-300"
              >
                Use Placeholder
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render the image
  const imageProps = {
    src: imageState.currentSrc,
    alt,
    onError: handleImageError,
    onLoad: handleImageLoad,
    className: cn(className, imageState.isRetrying && "opacity-50"),
    sizes,
    priority,
    placeholder,
    blurDataURL,
    ...props
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  )
}

// Specialized component for artwork images
interface ArtworkImageProps extends Omit<ImageFallbackProps, 'fallbackSrc'> {
  artworkTitle?: string
  showRetryInfo?: boolean
}

export function ArtworkImage({
  artworkTitle,
  showRetryInfo = false,
  alt,
  ...props
}: ArtworkImageProps) {
  const [retryInfo, setRetryInfo] = useState<{ count: number; success: boolean } | null>(null)

  const handleError = useCallback((error: string) => {
    if (showRetryInfo) {
      console.warn(`Artwork image error: ${error}`)
    }
  }, [showRetryInfo])

  const handleRetrySuccess = useCallback(() => {
    if (showRetryInfo) {
      setRetryInfo(prev => prev ? { ...prev, success: true } : null)
    }
  }, [showRetryInfo])

  return (
    <div className="relative">
      <ImageFallback
        {...props}
        alt={alt || artworkTitle || 'Artwork'}
        fallbackSrc="/placeholder.svg?height=400&width=300&text=Artwork"
        onError={handleError}
        onRetrySuccess={handleRetrySuccess}
      />
      
      {/* Retry success indicator */}
      {retryInfo?.success && (
        <div className="absolute top-2 right-2 glass rounded-full p-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )
}

// Hook for managing image loading state
export function useImageFallback(src: string, maxRetries: number = 2) {
  const [state, setState] = useState({
    currentSrc: src,
    hasError: false,
    retryCount: 0,
    isLoading: true
  })

  const handleError = useCallback(() => {
    setState(prevState => {
      if (prevState.retryCount < maxRetries) {
        const cacheBustingSrc = `${src}?retry=${prevState.retryCount + 1}&t=${Date.now()}`
        return {
          ...prevState,
          currentSrc: cacheBustingSrc,
          retryCount: prevState.retryCount + 1,
          hasError: false
        }
      } else {
        return {
          ...prevState,
          hasError: true,
          isLoading: false
        }
      }
    })
  }, [src, maxRetries])

  const handleLoad = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isLoading: false,
      hasError: false
    }))
  }, [])

  const retry = useCallback(() => {
    const cacheBustingSrc = `${src}?manual_retry=${Date.now()}`
    setState(prevState => ({
      ...prevState,
      currentSrc: cacheBustingSrc,
      hasError: false,
      isLoading: true,
      retryCount: prevState.retryCount + 1
    }))
  }, [src])

  const reset = useCallback(() => {
    setState({
      currentSrc: src,
      hasError: false,
      retryCount: 0,
      isLoading: true
    })
  }, [src])

  return {
    ...state,
    handleError,
    handleLoad,
    retry,
    reset
  }
}