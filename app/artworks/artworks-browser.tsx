"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArt } from "@/contexts/ArtContext"
import { ArtCard } from "@/components/ui/art-card"
import { Search, RefreshCw, Loader2, SlidersHorizontal } from "lucide-react"

const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "painting", label: "Paintings" },
    { value: "drawing", label: "Drawings" },
    { value: "digital-art", label: "Digital Art" },
    { value: "photography", label: "Photography" },
    { value: "sculpture", label: "Sculpture" },
    { value: "mixed-media", label: "Mixed Media" },
    { value: "other", label: "Other" },
]

const PRICE_RANGES = [
    { value: "all", label: "Any Price" },
    { value: "under-50k", label: "Under RWF 50,000" },
    { value: "50k-150k", label: "RWF 50,000 – 150,000" },
    { value: "150k-500k", label: "RWF 150,000 – 500,000" },
    { value: "over-500k", label: "Over RWF 500,000" },
]

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "title", label: "Title A-Z" },
]

function matchesPrice(price: number, range: string): boolean {
    switch (range) {
        case "under-50k":
            return price < 50000
        case "50k-150k":
            return price >= 50000 && price <= 150000
        case "150k-500k":
            return price > 150000 && price <= 500000
        case "over-500k":
            return price > 500000
        default:
            return true
    }
}

export function ArtworksBrowser() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { artworks, loading, fetchArtworks } = useArt()

    const searchTerm = searchParams.get("search") || ""
    const categoryFilter = searchParams.get("category") || "all"
    const priceFilter = searchParams.get("price") || "all"
    const sortBy = searchParams.get("sort") || "newest"

    const [searchInput, setSearchInput] = useState(searchTerm)

    // Keep the input in sync if the URL changes (e.g. navbar search)
    useEffect(() => {
        setSearchInput(searchTerm)
    }, [searchTerm])

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all" && !(key === "sort" && value === "newest")) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.replace(`/artworks?${params.toString()}`, { scroll: false })
    }

    const filteredAndSorted = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()

        const filtered = artworks.filter((artwork) => {
            const matchesSearch =
                !term ||
                (artwork.title || "").toLowerCase().includes(term) ||
                artwork.artist_name.toLowerCase().includes(term) ||
                (artwork.category || "").toLowerCase().includes(term) ||
                (artwork.medium || "").toLowerCase().includes(term)

            const normalizedCategory = (artwork.category || "").toLowerCase()

            // "digital" should match "digital-art" etc.
            const matchesCategory =
                categoryFilter === "all" ||
                normalizedCategory === categoryFilter ||
                normalizedCategory.replace(/-/g, "") === categoryFilter.replace(/-/g, "") ||
                (categoryFilter === "digital-art" && normalizedCategory.includes("digital"))

            const priceOk = matchesPrice(artwork.price || 0, priceFilter)

            return matchesSearch && matchesCategory && priceOk
        })

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return (a.price || 0) - (b.price || 0)
                case "price-high":
                    return (b.price || 0) - (a.price || 0)
                case "title":
                    return (a.title || "").localeCompare(b.title || "")
                case "newest":
                default:
                    return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
            }
        })

        return filtered
    }, [artworks, searchTerm, categoryFilter, priceFilter, sortBy])

    const hasActiveFilters = searchTerm || categoryFilter !== "all" || priceFilter !== "all"

    const clearFilters = () => {
        router.replace("/artworks", { scroll: false })
    }

    return (
        <div className="min-h-screen bg-background py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-6">
                {/* Header */}
                <header className="text-center space-y-4 mb-10 md:mb-14">
                    <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight heading-flourish inline-block">
                        The Collection
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Every piece here is an original by a Rwandan artist. When you order,
                        we arrange payment and delivery with you directly.
                    </p>
                </header>

                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-5 mb-8 md:mb-10 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by title, artist, style..."
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setParam("search", searchInput.trim())
                                }}
                                onBlur={() => {
                                    if (searchInput.trim() !== searchTerm) setParam("search", searchInput.trim())
                                }}
                                className="pl-9 h-11"
                                aria-label="Search artworks"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2 md:flex">
                            <Select value={categoryFilter} onValueChange={(v) => setParam("category", v)}>
                                <SelectTrigger className="h-11 w-full md:w-40" aria-label="Filter by category">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={priceFilter} onValueChange={(v) => setParam("price", v)}>
                                <SelectTrigger className="h-11 w-full md:w-44" aria-label="Filter by price">
                                    <SelectValue placeholder="Price" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRICE_RANGES.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={(v) => setParam("sort", v)}>
                                <SelectTrigger className="h-11 w-full md:w-40" aria-label="Sort artworks">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            {loading
                                ? "Loading collection..."
                                : `Showing ${filteredAndSorted.length} of ${artworks.length} artworks`}
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground hover:text-foreground h-8"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Clear filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                        <p className="text-sm text-muted-foreground">Loading collection...</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                    >
                        {filteredAndSorted.map((artwork, index) => (
                            <motion.div
                                key={artwork.id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                            >
                                <ArtCard artwork={artwork} index={index} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* No results */}
                {!loading && filteredAndSorted.length === 0 && (
                    <div className="text-center py-24">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground">
                                <Search className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-display text-2xl font-semibold text-foreground">No artworks found</h3>
                                <p className="text-muted-foreground">
                                    Try different search words or clear the filters.
                                </p>
                            </div>
                            {hasActiveFilters && (
                                <Button onClick={clearFilters} variant="outline" className="border-border">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
