"use client"

import { useMemo } from "react"

interface SearchHighlightProps {
  text: string
  searchTerm: string
  className?: string
  highlightClassName?: string
}

export function SearchHighlight({
  text,
  searchTerm,
  className = "",
  highlightClassName = "bg-yellow-400/30 text-yellow-200 px-1 rounded"
}: SearchHighlightProps) {
  const highlightedText = useMemo(() => {
    if (!searchTerm || !text) {
      return text
    }

    // Split search term into individual words and filter out empty strings
    const searchWords = searchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0)

    if (searchWords.length === 0) {
      return text
    }

    // Create a regex pattern that matches any of the search words
    const pattern = new RegExp(
      `(${searchWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    )

    // Split text by the pattern and map to JSX elements
    const parts = text.split(pattern)
    
    return parts.map((part, index) => {
      const isMatch = searchWords.some(word => 
        part.toLowerCase() === word.toLowerCase()
      )
      
      if (isMatch) {
        return (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        )
      }
      
      return part
    })
  }, [text, searchTerm, highlightClassName])

  return <span className={className}>{highlightedText}</span>
}