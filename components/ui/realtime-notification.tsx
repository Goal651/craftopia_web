"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Eye, Sparkles } from "lucide-react"
import type { ArtworkRecord } from "@/types"

interface RealtimeNotificationProps {
  newArtwork: ArtworkRecord | null
  onDismiss: () => void
  onView: () => void
  autoHideDelay?: number
}

export function RealtimeNotification({
  newArtwork,
  onDismiss,
  onView,
  autoHideDelay = 8000
}: RealtimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (newArtwork) {
      setIsVisible(true)
      
      // Auto-hide after delay
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for animation to complete
      }, autoHideDelay)

      return () => clearTimeout(timer)
    }
  }, [newArtwork, autoHideDelay, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for animation to complete
  }

  const handleView = () => {
    onView()
    handleDismiss()
  }

  if (!newArtwork) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <Card className="glass-strong border border-blue-500/30 shadow-2xl overflow-hidden">
            <div className="relative">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
              
              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">New Artwork!</h4>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                        {newArtwork.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-1 mb-1">
                      <span className="font-medium">{newArtwork.title}</span>
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      by {newArtwork.artist_name}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={handleView}
                        className="btn-primary text-xs h-7 px-3"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-white hover:bg-white/10 text-xs h-7 px-2"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="flex-shrink-0 w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}