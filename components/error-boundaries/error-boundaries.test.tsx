import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppErrorBoundary, UploadErrorBoundary, GalleryErrorBoundary } from './index'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('Error Boundaries', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  
  afterEach(() => {
    console.error = originalError
  })

  describe('AppErrorBoundary', () => {
    it('should render children when there is no error', () => {
      render(
        <AppErrorBoundary>
          <ThrowError shouldThrow={false} />
        </AppErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render error UI when child component throws', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )
      
      expect(screen.getByText(/Unexpected Error/i)).toBeInTheDocument()
      expect(screen.getByText(/Test error/i)).toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()
      
      render(
        <AppErrorBoundary onError={onError}>
          <ThrowError />
        </AppErrorBoundary>
      )
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
        expect.any(String)
      )
    })
  })

  describe('UploadErrorBoundary', () => {
    it('should render children when there is no error', () => {
      render(
        <UploadErrorBoundary>
          <ThrowError shouldThrow={false} />
        </UploadErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render upload-specific error UI when child component throws', () => {
      render(
        <UploadErrorBoundary>
          <ThrowError />
        </UploadErrorBoundary>
      )
      
      expect(screen.getByText(/Upload Error/i)).toBeInTheDocument()
      expect(screen.getByText(/Try Again/i)).toBeInTheDocument()
    })
  })

  describe('GalleryErrorBoundary', () => {
    it('should render children when there is no error', () => {
      render(
        <GalleryErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GalleryErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render gallery-specific error UI when child component throws', () => {
      render(
        <GalleryErrorBoundary>
          <ThrowError />
        </GalleryErrorBoundary>
      )
      
      expect(screen.getByText(/Gallery Error/i)).toBeInTheDocument()
      expect(screen.getByText(/Retry/i)).toBeInTheDocument()
    })
  })
})