"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  initialValue?: string
  loading?: boolean
  debounceMs?: number
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = "Search artworks, artists...",
  className,
  initialValue = "",
  loading = false,
  debounceMs = 300
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialValue) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch, initialValue])

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    onClear?.()
  }, [onClear])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }, [query, onSearch])

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-12 h-12 glass border-border/50 bg-background/50 text-lg focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />

        {/* Loading indicator or clear button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : query.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}