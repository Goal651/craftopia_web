"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import type { ArtworkRecord } from "@/types"

interface ArtContextType {
    artworks: ArtworkRecord[]
    featuredArtworks: ArtworkRecord[]
    loading: boolean
    error: string | null
    fetchArtworks: () => Promise<void>
    getArtworkById: (id: string) => ArtworkRecord | undefined
}

const ArtContext = createContext<ArtContextType | undefined>(undefined)

export function ArtProvider({ children }: { children: React.ReactNode }) {
    const [artworks, setArtworks] = useState<ArtworkRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchArtworks = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/artworks?limit=50")
            if (!response.ok) throw new Error("Failed to fetch artworks")
            const data = await response.json()
            setArtworks(data.artworks || [])
            setError(null)
        } catch (err) {
            console.error("Error fetching artworks:", err)
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchArtworks()
    }, [])

    const featuredArtworks = useMemo(() => {
        return artworks.slice(0, 6)
    }, [artworks])

    const getArtworkById = (id: string) => {
        return artworks.find((art) => art.id === id)
    }

    return (
        <ArtContext.Provider value={{ artworks, featuredArtworks, loading, error, fetchArtworks, getArtworkById }}>
            {children}
        </ArtContext.Provider>
    )
}

export function useArt() {
    const context = useContext(ArtContext)
    if (context === undefined) {
        throw new Error("useArt must be used within an ArtProvider")
    }
    return context
}
