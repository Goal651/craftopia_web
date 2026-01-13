"use client"

import { useState, useCallback, useEffect } from "react"
import type { ArtworkRecord, ArtworkCategory } from "@/types"

interface SearchPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

interface SearchResult {
  artworks: ArtworkRecord[]
  pagination: SearchPagination
  query: string
}

interface UseArtworkSearchOptions {
  initialQuery?: string
  initialCategory?: ArtworkCategory | 'all'
  limit?: number
}

export function useArtworkSearch({
  initialQuery = "",
  initialCategory = 'all',
  limit = 12
}: UseArtworkSearchOptions = {}) {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState(initialQuery)
  const [currentCategory, setCurrentCategory] = useState(initialCategory)
  const [currentPage, setCurrentPage] = useState(1)

  const performSearch = useCallback(async (
    query: string,
    page: number = 1,
    category: ArtworkCategory | 'all' = 'all'
  ) => {
    if (!query.trim()) {
      setSearchResults(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        page: page.toString(),
        limit: limit.toString()
      })

      if (category && category !== 'all') {
        params.append('category', category)
      }

      const response = await fetch(`/api/artworks/search?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const result: SearchResult = await response.json()
      setSearchResults(result)
      setCurrentQuery(query)
      setCurrentCategory(category)
      setCurrentPage(page)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }, [limit])

  const search = useCallback((query: string) => {
    setCurrentPage(1)
    performSearch(query, 1, currentCategory)
  }, [performSearch, currentCategory])

  const searchWithCategory = useCallback((query: string, category: ArtworkCategory | 'all') => {
    setCurrentPage(1)
    performSearch(query, 1, category)
  }, [performSearch])

  const goToPage = useCallback((page: number) => {
    if (currentQuery && page >= 1 && searchResults && page <= searchResults.pagination.totalPages) {
      performSearch(currentQuery, page, currentCategory)
    }
  }, [performSearch, currentQuery, currentCategory, searchResults])

  const clearSearch = useCallback(() => {
    setSearchResults(null)
    setCurrentQuery("")
    setCurrentCategory('all')
    setCurrentPage(1)
    setError(null)
  }, [])

  // Initialize search if there's an initial query
  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery, 1, initialCategory)
    }
  }, []) // Only run on mount

  return {
    searchResults,
    loading,
    error,
    currentQuery,
    currentCategory,
    currentPage,
    search,
    searchWithCategory,
    goToPage,
    clearSearch,
    hasResults: searchResults !== null,
    isEmpty: searchResults?.artworks.length === 0
  }
}