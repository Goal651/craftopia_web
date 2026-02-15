"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Filter, X, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

interface PremiumFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  priceFilter: string
  onPriceChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  resultCount: number
  totalCount: number
  onClearFilters: () => void
  categories: string[]
  priceRanges: { value: string; label: string }[]
  sortOptions: { value: string; label: string }[]
}

export function PremiumFilterBar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  priceFilter,
  onPriceChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
  onClearFilters,
  categories,
  priceRanges,
  sortOptions
}: PremiumFilterBarProps) {
  const [showFilters, setShowFilters] = useState(true)
  const hasActiveFilters = categoryFilter !== "all" || priceFilter !== "all" || searchTerm !== ""

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-3xl mx-auto"
      >
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search artworks, artists, or descriptions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-14 pr-12 h-14 glass-strong border-0 text-base md:text-lg focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground shadow-xl rounded-2xl"
          />
          {searchTerm && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-2xl p-4 md:p-6 shadow-xl border border-border/50"
      >
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {resultCount} of {totalCount} artworks
            </span>
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("grid")}
                className={viewMode === "grid" ? "btn-primary h-10 w-10" : "h-10 w-10"}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("list")}
                className={viewMode === "list" ? "btn-primary h-10 w-10" : "h-10 w-10"}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Result Count */}
        <div className="sm:hidden text-center text-sm text-muted-foreground mb-4">
          Showing {resultCount} of {totalCount} artworks
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Select value={categoryFilter} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-full glass border-0 text-foreground h-12 rounded-xl shadow-sm">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50 rounded-xl">
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="text-foreground hover:bg-muted rounded-lg"
                        >
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={priceFilter} onValueChange={onPriceChange}>
                    <SelectTrigger className="w-full glass border-0 text-foreground h-12 rounded-xl shadow-sm">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50 rounded-xl">
                      {priceRanges.map((range) => (
                        <SelectItem
                          key={range.value}
                          value={range.value}
                          className="text-foreground hover:bg-muted rounded-lg"
                        >
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-full glass border-0 text-foreground h-12 rounded-xl shadow-sm">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border/50 rounded-xl">
                      {sortOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-foreground hover:bg-muted rounded-lg"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={onClearFilters}
                      className="w-full glass border-0 h-12 rounded-xl shadow-sm hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50"
                  >
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => onSearchChange("")}
                          className="ml-2 hover:text-primary-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {categoryFilter !== "all" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Category: {categoryFilter}
                        <button
                          onClick={() => onCategoryChange("all")}
                          className="ml-2 hover:text-primary-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {priceFilter !== "all" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Price: {priceRanges.find(r => r.value === priceFilter)?.label}
                        <button
                          onClick={() => onPriceChange("all")}
                          className="ml-2 hover:text-primary-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
