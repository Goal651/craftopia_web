"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArtworkImageProps {
  src?: string
  alt: string
  title: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export function ArtworkImage({
  src,
  alt,
  title,
  width = 400,
  height = 400,
  fill = false,
  className = "",
  priority = false,
  sizes,
  onLoad,
  onError
}: ArtworkImageProps) {
  const [hasError, setHasError] = useState(false)

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    onError?.(event)
  }, [onError])

  const handleImageLoad = useCallback(() => {
    onLoad?.()
  }, [onLoad])

  // No source or failed load: neutral placeholder tile
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-muted/30 border border-border/50",
          className
        )}
        aria-label={title}
      >
        <ImageOff className="w-8 h-8 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      {...(fill ? { fill: true } : { width, height })}
      className={className}
      priority={priority}
      sizes={sizes}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  )
}
