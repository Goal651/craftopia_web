"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Image, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface GalleryErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
  lastRetryTime: number
}

interface GalleryErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
  retryDelay?: number
}

export class GalleryErrorBoundary extends Component<GalleryErrorBoundaryProps, GalleryErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: GalleryErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetryTime: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<GalleryErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Gallery Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error for monitoring
    if (typeof window !== 'undefined') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, { 
      //   tags: { component: 'gallery' },
      //   extra: errorInfo 
      // })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3
    const retryDelay = this.props.retryDelay || 2000
    const now = Date.now()
    
    if (this.state.retryCount >= maxRetries) {
      return
    }

    // Prevent rapid retries
    if (now - this.state.lastRetryTime < retryDelay) {
      return
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
      lastRetryTime: now
    }))

    // Add exponential backoff for retries
    const backoffDelay = Math.min(retryDelay * Math.pow(2, this.state.retryCount), 10000)
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
    }, backoffDelay)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetryTime: 0
    })
  }

  getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Unable to load gallery content. Please check your internet connection.'
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. The gallery is taking longer than expected to load.'
    }
    
    if (message.includes('database') || message.includes('query')) {
      return 'Database error. Unable to retrieve artworks at this time.'
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'Authentication error. Some gallery features may not be available.'
    }
    
    if (message.includes('storage') || message.includes('image')) {
      return 'Image loading error. Some artworks may not display correctly.'
    }
    
    if (message.includes('search')) {
      return 'Search functionality is currently unavailable. Please try browsing the gallery instead.'
    }
    
    if (message.includes('pagination') || message.includes('page')) {
      return 'Pagination error. Unable to load the requested page.'
    }
    
    // Generic error message
    return 'An unexpected error occurred while loading the gallery. Please try again.'
  }

  getErrorType = (error: Error): 'network' | 'data' | 'render' | 'system' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network'
    }
    
    if (message.includes('database') || message.includes('query') || message.includes('data')) {
      return 'data'
    }
    
    if (message.includes('render') || message.includes('component') || error.name === 'ChunkLoadError') {
      return 'render'
    }
    
    return 'system'
  }

  getSuggestedActions = (errorType: 'network' | 'data' | 'render' | 'system'): string[] => {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ]
      case 'data':
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Try again in a few minutes'
        ]
      case 'render':
        return [
          'Refresh the page to reload components',
          'Clear your browser cache',
          'Try using a different browser'
        ]
      case 'system':
        return [
          'Try refreshing the page',
          'Contact support if the problem persists',
          'Try again later'
        ]
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const maxRetries = this.props.maxRetries || 3
      const canRetry = this.state.retryCount < maxRetries
      const errorMessage = this.getErrorMessage(this.state.error)
      const errorType = this.getErrorType(this.state.error)
      const suggestedActions = this.getSuggestedActions(errorType)

      return (
        <div className="min-h-screen pt-20 bg-black">
          <div className="container mx-auto container-padding py-8">
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-0 bg-white/5 backdrop-blur-xl">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <CardTitle className="text-xl text-white">
                    Gallery Error
                  </CardTitle>
                  <p className="text-gray-400">
                    We're having trouble loading the gallery
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Alert className="glass border-0 bg-white/5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-white">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>

                  {/* Suggested Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white">Try these steps:</h4>
                    <ul className="space-y-2">
                      {suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Error Details (only in development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                        Technical Details
                      </summary>
                      <div className="glass rounded-lg p-4 bg-white/5 space-y-2">
                        <div>
                          <strong className="text-white">Error Type:</strong>
                          <span className="text-blue-400 ml-2">{errorType}</span>
                        </div>
                        <div>
                          <strong className="text-white">Error:</strong>
                          <pre className="text-red-400 text-xs mt-1 whitespace-pre-wrap">
                            {this.state.error.message}
                          </pre>
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <strong className="text-white">Stack Trace:</strong>
                            <pre className="text-gray-400 text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}

                  {/* Retry Information */}
                  {this.state.retryCount > 0 && (
                    <div className="text-center text-sm text-gray-400">
                      Retry attempt {this.state.retryCount} of {maxRetries}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canRetry && (
                      <Button
                        onClick={this.handleRetry}
                        className="flex-1 glass border-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      onClick={this.handleReset}
                      variant="outline"
                      className="flex-1 glass border-0 bg-transparent text-white hover:bg-white/10"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Reload Gallery
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="ghost"
                      className="flex-1 text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </div>

                  {/* Alternative Actions */}
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-medium text-white mb-3">
                      While we fix this, you can:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/upload'}
                        className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Upload Artwork
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/contact'}
                        className="glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="text-center text-sm text-gray-400">
                    {!canRetry && (
                      <p className="mb-2">
                        Maximum retry attempts reached. Please try again later.
                      </p>
                    )}
                    <p>
                      If this problem continues, please{' '}
                      <a 
                        href="/contact" 
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        report the issue
                      </a>
                      {' '}so we can fix it quickly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useGalleryErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const handleError = React.useCallback((error: Error) => {
    console.error('Gallery error:', error)
    setError(error)
  }, [])

  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1)
    setError(null)
  }, [])

  const reset = React.useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    error,
    retryCount,
    handleError,
    retry,
    reset,
    hasError: error !== null
  }
}