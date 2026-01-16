"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Progress } from './progress'
import { Eye, EyeOff, BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface ImageMetrics {
  totalImages: number
  loadedImages: number
  failedImages: number
  averageLoadTime: number
  loadTimes: number[]
  slowestImage: { url: string; time: number } | null
  fastestImage: { url: string; time: number } | null
  errorUrls: string[]
}

interface ImagePerformanceContextType {
  metrics: ImageMetrics
  trackImageLoad: (url: string, loadTime: number) => void
  trackImageError: (url: string, error: string) => void
  registerImage: (url: string) => void
  reset: () => void
  isMonitoring: boolean
  setIsMonitoring: (monitoring: boolean) => void
}

const ImagePerformanceContext = createContext<ImagePerformanceContextType | null>(null)

const initialMetrics: ImageMetrics = {
  totalImages: 0,
  loadedImages: 0,
  failedImages: 0,
  averageLoadTime: 0,
  loadTimes: [],
  slowestImage: null,
  fastestImage: null,
  errorUrls: []
}

export function ImagePerformanceProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<ImageMetrics>(initialMetrics)
  const [isMonitoring, setIsMonitoring] = useState(process.env.NODE_ENV === 'development')

  const trackImageLoad = useCallback((url: string, loadTime: number) => {
    if (!isMonitoring) return

    setMetrics(prev => {
      const newLoadTimes = [...prev.loadTimes, loadTime]
      const averageLoadTime = newLoadTimes.reduce((sum, time) => sum + time, 0) / newLoadTimes.length

      const slowestImage = !prev.slowestImage || loadTime > prev.slowestImage.time
        ? { url, time: loadTime }
        : prev.slowestImage

      const fastestImage = !prev.fastestImage || loadTime < prev.fastestImage.time
        ? { url, time: loadTime }
        : prev.fastestImage

      return {
        ...prev,
        loadedImages: prev.loadedImages + 1,
        loadTimes: newLoadTimes,
        averageLoadTime,
        slowestImage,
        fastestImage
      }
    })
  }, [isMonitoring])

  const trackImageError = useCallback((url: string, error: string) => {
    if (!isMonitoring) return

    setMetrics(prev => ({
      ...prev,
      failedImages: prev.failedImages + 1,
      errorUrls: [...prev.errorUrls, url]
    }))

    console.warn(`Image load error: ${url}`, error)
  }, [isMonitoring])

  const registerImage = useCallback((url: string) => {
    if (!isMonitoring) return

    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1
    }))
  }, [isMonitoring])

  const reset = useCallback(() => {
    setMetrics(initialMetrics)
  }, [])

  const value = {
    metrics,
    trackImageLoad,
    trackImageError,
    registerImage,
    reset,
    isMonitoring,
    setIsMonitoring
  }

  return (
    <ImagePerformanceContext.Provider value={value}>
      {children}
    </ImagePerformanceContext.Provider>
  )
}

export function useImagePerformance() {
  const context = useContext(ImagePerformanceContext)
  if (!context) {
    throw new Error('useImagePerformance must be used within ImagePerformanceProvider')
  }
  return context
}

// Performance monitor UI component
interface ImagePerformanceMonitorProps {
  className?: string
  showDetails?: boolean
}

export function ImagePerformanceMonitor({ 
  className = "",
  showDetails = false 
}: ImagePerformanceMonitorProps) {
  const { metrics, reset, isMonitoring, setIsMonitoring } = useImagePerformance()
  const [isVisible, setIsVisible] = useState(false)

  const successRate = metrics.totalImages > 0 
    ? ((metrics.loadedImages / metrics.totalImages) * 100).toFixed(1)
    : '0'

  const loadingProgress = metrics.totalImages > 0
    ? ((metrics.loadedImages + metrics.failedImages) / metrics.totalImages) * 100
    : 0

  // Only show in development or when explicitly enabled
  if (!isMonitoring && process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsVisible(!isVisible)}
        className="glass border-0 bg-black/50 text-white hover:bg-black/70 mb-2"
      >
        <BarChart3 className="w-4 h-4 mr-1" />
        Images
        {metrics.totalImages > 0 && (
          <Badge variant="secondary" className="ml-2 bg-white/20">
            {metrics.loadedImages}/{metrics.totalImages}
          </Badge>
        )}
      </Button>

      {/* Performance panel */}
      {isVisible && (
        <Card className="w-80 glass border-0 bg-black/80 text-white">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Image Performance
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="text-white/60 hover:text-white"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>

            {/* Monitoring toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Monitoring</span>
              <Button
                size="sm"
                variant={isMonitoring ? "default" : "outline"}
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="text-xs"
              >
                {isMonitoring ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                {isMonitoring ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Progress */}
            {metrics.totalImages > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Loading Progress</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <Progress value={loadingProgress} className="h-2" />
              </div>
            )}

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-white/60">Total Images</div>
                <div className="font-mono text-lg">{metrics.totalImages}</div>
              </div>
              <div className="space-y-1">
                <div className="text-white/60">Success Rate</div>
                <div className="font-mono text-lg flex items-center">
                  {successRate}%
                  {parseFloat(successRate) >= 95 ? (
                    <CheckCircle className="w-4 h-4 ml-1 text-green-400" />
                  ) : parseFloat(successRate) < 80 ? (
                    <AlertTriangle className="w-4 h-4 ml-1 text-blue-400" />
                  ) : null}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-white/60">Avg Load Time</div>
                <div className="font-mono text-lg flex items-center">
                  {metrics.averageLoadTime.toFixed(0)}ms
                  <Clock className="w-3 h-3 ml-1 text-white/60" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-white/60">Failed</div>
                <div className="font-mono text-lg text-red-400">
                  {metrics.failedImages}
                </div>
              </div>
            </div>

            {/* Detailed metrics */}
            {showDetails && metrics.loadTimes.length > 0 && (
              <div className="space-y-2 text-sm border-t border-white/20 pt-4">
                <div className="text-white/80 font-medium">Performance Details</div>
                
                {metrics.fastestImage && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Fastest:</span>
                    <span className="font-mono">{metrics.fastestImage.time}ms</span>
                  </div>
                )}
                
                {metrics.slowestImage && (
                  <div className="flex justify-between">
                    <span className="text-red-400">Slowest:</span>
                    <span className="font-mono">{metrics.slowestImage.time}ms</span>
                  </div>
                )}

                {metrics.errorUrls.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-red-400">Failed URLs:</div>
                    <div className="max-h-20 overflow-y-auto text-xs text-white/60">
                      {metrics.errorUrls.slice(0, 3).map((url, i) => (
                        <div key={i} className="truncate">
                          {url.split('/').pop()}
                        </div>
                      ))}
                      {metrics.errorUrls.length > 3 && (
                        <div>... and {metrics.errorUrls.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={reset}
                className="flex-1 text-xs border-white/20 text-white/80 hover:text-white"
              >
                Reset
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => console.table(metrics)}
                  className="flex-1 text-xs border-white/20 text-white/80 hover:text-white"
                >
                  Log Data
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Hook for individual image performance tracking
export function useImageLoadTracking(url: string) {
  const { trackImageLoad, trackImageError, registerImage } = useImagePerformance()
  const [startTime] = useState(() => Date.now())

  React.useEffect(() => {
    registerImage(url)
  }, [url, registerImage])

  const onLoad = useCallback(() => {
    const loadTime = Date.now() - startTime
    trackImageLoad(url, loadTime)
  }, [url, startTime, trackImageLoad])

  const onError = useCallback((error: string) => {
    trackImageError(url, error)
  }, [url, trackImageError])

  return { onLoad, onError }
}