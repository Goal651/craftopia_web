"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "./button"

interface ArtworkFullViewProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ArtworkFullView({ src, alt, isOpen, onClose }: ArtworkFullViewProps) {
  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden touch-none"
        >
          {/* Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleZoomIn}
              >
                <ZoomIn className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleZoomOut}
              >
                <ZoomOut className="w-6 h-6" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full"
              onClick={onClose}
            >
              <X className="w-8 h-8" />
            </Button>
          </div>

          {/* Image Container */}
          <motion.div 
            className="relative w-full h-full flex items-center justify-center p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <motion.div
              style={{ scale: zoom }}
              className="relative max-w-full max-h-full transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
              drag={zoom > 1}
              dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
              />
            </motion.div>
          </motion.div>

          {/* Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-sm font-light pointer-events-none">
            {zoom > 1 ? "Drag to explore details" : "Pinch or use controls to zoom"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
