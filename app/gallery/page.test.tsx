import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublicGalleryPage from './page'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
          }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
        }))
      }))
    }))
  }))
}))

// Mock artwork search hook
jest.mock('@/hooks/use-artwork-search', () => ({
  useArtworkSearch: jest.fn(() => ({
    searchResults: null,
    loading: false,
    error: null,
    currentQuery: '',
    currentCategory: 'all',
    search: jest.fn(),
    searchWithCategory: jest.fn(),
    clearSearch: jest.fn(),
    goToPage: jest.fn(),
    hasResults: false,
    isEmpty: false
  }))
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
  toString: jest.fn(() => ''),
}

describe('PublicGalleryPage Category Filtering', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    jest.clearAllMocks()
  })

  it('renders category filter dropdown', async () => {
    render(<PublicGalleryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Filter by category:')).toBeInTheDocument()
    })
    
    // Check if the select trigger is present
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays all category options when dropdown is opened', async () => {
    render(<PublicGalleryPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Check for category options
    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument()
      expect(screen.getByText('Painting')).toBeInTheDocument()
      expect(screen.getByText('Digital Art')).toBeInTheDocument()
      expect(screen.getByText('Photography')).toBeInTheDocument()
      expect(screen.getByText('Sculpture')).toBeInTheDocument()
      expect(screen.getByText('Mixed Media')).toBeInTheDocument()
      expect(screen.getByText('Drawing')).toBeInTheDocument()
      expect(screen.getByText('Other')).toBeInTheDocument()
    })
  })

  it('shows clear filter button when category is selected', async () => {
    // Mock URL params with category
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'painting'
      return null
    })
    
    render(<PublicGalleryPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Clear filter')).toBeInTheDocument()
    })
  })

  it('does not show clear filter button when "all" category is selected', async () => {
    // Mock URL params with no category (defaults to 'all')
    mockSearchParams.get.mockReturnValue(null)
    
    render(<PublicGalleryPage />)
    
    await waitFor(() => {
      expect(screen.queryByText('Clear filter')).not.toBeInTheDocument()
    })
  })

  it('updates URL when category is changed', async () => {
    render(<PublicGalleryPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    
    // Click to open dropdown
    fireEvent.click(screen.getByRole('combobox'))
    
    // Select a category
    await waitFor(() => {
      expect(screen.getByText('Painting')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Painting'))
    
    // Check if router.replace was called with correct URL
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('category=painting'),
        { scroll: false }
      )
    })
  })
})