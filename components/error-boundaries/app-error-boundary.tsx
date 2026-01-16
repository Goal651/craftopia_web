"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface AppErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void
  showErrorDetails?: boolean
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler with error ID
    this.props.onError?.(error, errorInfo, this.state.errorId)

    // Log error for monitoring
    this.logError(error, errorInfo, this.state.errorId)
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Reset error boundary when specified props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        prevProps.resetKeys?.[index] !== key
      )
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  logError = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
    // In production, send to error tracking service
    if (typeof window !== 'undefined') {
      const errorData = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: null, // Could be populated from auth context
      }

      // Example: Send to error tracking service
      // errorTrackingService.captureException(error, {
      //   tags: { errorId, component: 'app' },
      //   extra: errorData
      // })

      // Store in localStorage for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
        existingErrors.push(errorData)
        // Keep only last 10 errors
        const recentErrors = existingErrors.slice(-10)
        localStorage.setItem('app_errors', JSON.stringify(recentErrors))
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  handleRetry = () => {
    // Add a small delay to prevent immediate re-error
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary()
    }, 100)
  }

  handleReload = () => {
    window.location.reload()
  }

  getErrorCategory = (error: Error): 'chunk' | 'network' | 'render' | 'logic' | 'unknown' => {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()
    
    if (name.includes('chunkerror') || message.includes('chunk')) {
      return 'chunk'
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network'
    }
    
    if (message.includes('render') || message.includes('component') || name.includes('react')) {
      return 'render'
    }
    
    if (message.includes('reference') || message.includes('undefined') || message.includes('null')) {
      return 'logic'
    }
    
    return 'unknown'
  }

  getErrorMessage = (error: Error): { title: string; description: string; actions: string[] } => {
    const category = this.getErrorCategory(error)
    
    switch (category) {
      case 'chunk':
        return {
          title: 'Application Update Required',
          description: 'The application has been updated. Please refresh the page to get the latest version.',
          actions: ['Refresh the page', 'Clear browser cache if problem persists']
        }
      
      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          actions: ['Check your internet connection', 'Try again in a moment', 'Refresh the page']
        }
      
      case 'render':
        return {
          title: 'Display Error',
          description: 'There was a problem displaying this page. This is usually temporary.',
          actions: ['Try refreshing the page', 'Clear browser cache', 'Try a different browser']
        }
      
      case 'logic':
        return {
          title: 'Application Error',
          description: 'Something went wrong in the application. Our team has been notified.',
          actions: ['Try refreshing the page', 'Go back to the previous page', 'Contact support if this continues']
        }
      
      default:
        return {
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
          actions: ['Try refreshing the page', 'Go back to home', 'Contact support if needed']
        }
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { title, description, actions } = this.getErrorMessage(this.state.error)
      const category = this.getErrorCategory(this.state.error)
      const showDetails = this.props.showErrorDetails ?? (process.env.NODE_ENV === 'development')

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card className="glass border-0 bg-white/5 backdrop-blur-xl border border-gray-800">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <CardTitle className="text-xl text-white">
                  {title}
                </CardTitle>
                <p className="text-gray-400">
                  {description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert className="glass border-0 bg-white/5">
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    Error ID: <code className="text-blue-400">{this.state.errorId}</code>
                    <br />
                    <span className="text-sm text-gray-400">
                      Please include this ID when reporting the issue.
                    </span>
                  </AlertDescription>
                </Alert>

                {/* Suggested Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">What you can try:</h4>
                  <ul className="space-y-2">
                    {actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Error Details (development or when enabled) */}
                {showDetails && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                      Technical Details
                    </summary>
                    <div className="glass rounded-lg p-4 bg-white/5 space-y-2">
                      <div>
                        <strong className="text-white">Category:</strong>
                        <span className="text-blue-400 ml-2">{category}</span>
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
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong className="text-white">Component Stack:</strong>
                          <pre className="text-gray-400 text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {category === 'chunk' ? (
                    <Button
                      onClick={this.handleReload}
                      className="flex-1 glass border-0 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  ) : (
                    <Button
                      onClick={this.handleRetry}
                      className="flex-1 glass border-0 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1 glass border-0 bg-transparent text-white hover:bg-white/10"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = '/contact'}
                    variant="ghost"
                    className="flex-1 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-gray-400 border-t border-white/10 pt-4">
                  <p>
                    If this problem continues, please{' '}
                    <a 
                      href="/contact" 
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      contact our support team
                    </a>
                    {' '}with the error ID above.
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

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Component error:', error)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to be caught by error boundary
  if (error) {
    throw error
  }

  return { handleError, clearError }
}