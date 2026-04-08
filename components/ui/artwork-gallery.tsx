"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ArtworkGalleryProps {
  images?: string[]
  mainImage: string
  alt: string
  className?: string
}

export function ArtworkGallery({ images, mainImage, alt, className }: ArtworkGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Combine main image with additional images
  const allImages = images && images.length > 0 ? [mainImage, ...images] : [mainImage]
  const currentImage = allImages[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const openFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  // Don't show gallery controls if only one image
  if (allImages.length === 1) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden glass border border-border shadow-md bg-muted/5 aspect-[4/3] max-h-[500px] flex items-center justify-center p-4", className)}>
        <img
          src={currentImage}
          alt={alt}
          className="w-full h-full object-contain mx-auto transition-transform duration-700 hover:scale-105"
        />
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <div className={cn("relative rounded-lg overflow-hidden glass border border-border shadow-md bg-muted/5 aspect-[4/3] max-h-[500px] flex items-center justify-center p-4", className)}>
        <motion.img
          key={currentImage}
          src={currentImage}
          alt={alt}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-contain mx-auto cursor-pointer transition-transform duration-700 hover:scale-105"
          onClick={openFullscreen}
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
        
        {/* Zoom Indicator */}
        <Button
          variant="ghost"
          size="sm"
          onClick={openFullscreen}
          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex 
                  ? "border-primary shadow-md scale-105" 
                  : "border-border hover:border-primary/50 hover:scale-102"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image}
                alt={`${alt} - Image ${index + 1}`}
                className="w-16 h-16 object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentImage}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Fullscreen Navigation */}
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              
              {/* Fullscreen Image Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-2 rounded-full">
                {currentIndex + 1} / {allImages.length}
              </div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeFullscreen}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              >
                <X className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
