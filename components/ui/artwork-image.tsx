"use client"

import { useState } from "react"
import Image from "next/image"
import { ArtworkGenerator } from "./artwork-generator"

interface ArtworkImageProps {
  src?: string
  alt: string
  title: string
  category?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ArtworkImage({ 
  src, 
  alt, 
  title, 
  category = "abstract",
  width = 400, 
  height = 400,
  className = "",
  priority = false
}: ArtworkImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Convert category to artwork style
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

  // If no src provided or image failed to load, show generated artwork
  if (!src || imageError) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <ArtworkGenerator
          seed={seed}
          width={width}
          height={height}
          style={getArtworkStyle(category)}
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Show generated artwork while loading */}
      {!imageLoaded && (
        <div className="absolute inset-0">
          <ArtworkGenerator
            seed={seed}
            width={width}
            height={height}
            style={getArtworkStyle(category)}
            className="w-full h-full"
          />
        </div>
      )}
      
      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
