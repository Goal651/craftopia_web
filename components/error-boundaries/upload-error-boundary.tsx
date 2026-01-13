"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Upload, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UploadErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface UploadErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
}

export class UploadErrorBoundary extends Component<UploadErrorBoundaryProps, UploadErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: UploadErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<UploadErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Upload Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error for monitoring (in production, send to error tracking service)
    if (typeof window !== 'undefined') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, { extra: errorInfo })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3
    
    if (this.state.retryCount >= maxRetries) {
      return
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // Add a small delay before retrying to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
    }, 1000)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  getErrorMessage = (error: Error): string => {
    // Categorize errors and provide user-friendly messages
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.'
    }
    
    if (message.includes('file') || message.includes('upload')) {
      return 'File upload error. Please check your file and try again.'
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'Authentication error. Please log in again and try uploading.'
    }
    
    if (message.includes('storage') || message.includes('space')) {
      return 'Storage error. Please try again or contact support if the problem persists.'
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Invalid file or data. Please check your input and try again.'
    }
    
    // Generic error message
    return 'An unexpected error occurred while uploading. Please try again.'
  }

  getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'low' // Usually temporary
    }
    
    if (message.includes('validation') || message.includes('file')) {
      return 'medium' // User can fix
    }
    
    return 'high' // System error
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
      const severity = this.getErrorSeverity(this.state.error)

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
          <div className="container mx-auto max-w-2xl pt-8">
            <Card className="glass border-0 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                  <AlertTriangle className={`w-8 h-8 ${
                    severity === 'high' ? 'text-red-400' : 
                    severity === 'medium' ? 'text-yellow-400' : 
                    'text-orange-400'
                  }`} />
                </div>
                <CardTitle className="text-xl text-white">
                  Upload Error
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert className="glass border-0 bg-white/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    {errorMessage}
                  </AlertDescription>
                </Alert>

                {/* Error Details (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                      Technical Details
                    </summary>
                    <div className="glass rounded-lg p-4 bg-white/5 space-y-2">
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
                      Try Again
                    </Button>
                  )}
                  
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="flex-1 glass border-0 bg-transparent text-white hover:bg-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Start Over
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

                {/* Help Text */}
                <div className="text-center text-sm text-gray-400">
                  {!canRetry && (
                    <p className="mb-2">
                      Maximum retry attempts reached. Please try again later or contact support.
                    </p>
                  )}
                  <p>
                    If this problem persists, please{' '}
                    <a 
                      href="/contact" 
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      contact support
                    </a>
                    {' '}with the error details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useUploadErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const handleError = React.useCallback((error: Error) => {
    console.error('Upload error:', error)
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