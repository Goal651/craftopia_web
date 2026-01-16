"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ArrowRight, Hash, User, Image, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  type: "artwork" | "artist" | "category" | "page"
  href: string
  description?: string
  icon: React.ReactNode
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Ethereal Dreams",
    type: "artwork",
    href: "/artworks/1",
    description: "Abstract painting by Elena Vasquez",
    icon: <Image className="w-4 h-4" />
  },
  {
    id: "2", 
    title: "Elena Vasquez",
    type: "artist",
    href: "/artists/elena-vasquez",
    description: "Contemporary artist",
    icon: <User className="w-4 h-4" />
  },
  {
    id: "3",
    title: "Abstract Art",
    type: "category", 
    href: "/artworks?category=abstract",
    description: "24 artworks",
    icon: <Hash className="w-4 h-4" />
  },
  {
    id: "4",
    title: "Shopping Cart",
    type: "page",
    href: "/cart",
    description: "View your cart",
    icon: <ShoppingBag className="w-4 h-4" />
  }
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredResults = mockResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description?.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1
          )
          break
        case "Enter":
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            window.location.href = filteredResults[selectedIndex].href
            onClose()
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredResults, selectedIndex, onClose])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "artwork": return "bg-blue-500/20 text-blue-400"
      case "artist": return "bg-green-500/20 text-green-400"
      case "category": return "bg-green-500/20 text-green-400"
      case "page": return "bg-gray-500/20 text-gray-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="glass-enhanced rounded-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center px-6 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Search artworks, artists, categories..."
                  className="flex-1 bg-transparent border-0 text-lg placeholder:text-gray-500 focus:ring-0 focus:outline-none"
                />
                <Badge variant="outline" className="ml-3 text-xs">
                  ⌘K
                </Badge>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <div className="p-2">
                    {filteredResults.map((result, index) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={onClose}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                          index === selectedIndex
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 mr-3 group-hover:bg-white/10 transition-colors">
                          {result.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {result.title}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0.5 ${getTypeColor(result.type)}`}
                            >
                              {result.type}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>

                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </Link>
                    ))}
                  </div>
                ) : query ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Recent searches</p>
                    <div className="space-y-1">
                      {mockResults.slice(0, 3).map((result) => (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={onClose}
                          className="flex items-center px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {result.icon}
                          <span className="ml-3">{result.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
                      Select
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd>
                    Close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
