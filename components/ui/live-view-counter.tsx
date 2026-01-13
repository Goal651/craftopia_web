"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye } from "lucide-react"

interface LiveViewCounterProps {
  viewCount: number
  className?: string
}

export function LiveViewCounter({ viewCount, className = "" }: LiveViewCounterProps) {
  const [displayCount, setDisplayCount] = useState(viewCount)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (viewCount !== displayCount) {
      setIsAnimating(true)
      
      // Animate the counter change
      const timer = setTimeout(() => {
        setDisplayCount(viewCount)
        setIsAnimating(false)
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [viewCount, displayCount])

  return (
    <div className={`glass rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        <Eye className="w-4 h-4" />
        <span>Views</span>
      </div>
      <motion.div 
        className="font-medium text-white"
        animate={isAnimating ? { scale: [1, 1.1, 1], color: ["#ffffff", "#60a5fa", "#ffffff"] } : {}}
        transition={{ duration: 0.3 }}
      >
        {displayCount.toLocaleString()}
        {isAnimating && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="ml-1 text-blue-400 text-sm"
          >
            +1
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}