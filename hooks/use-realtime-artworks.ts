"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ArtworkRecord } from "@/types"
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface RealtimeArtworksOptions {
  onNewArtwork?: (artwork: ArtworkRecord) => void
  onArtworkUpdate?: (artwork: ArtworkRecord) => void
  onArtworkDelete?: (artworkId: string) => void
  onViewCountUpdate?: (artworkId: string, newViewCount: number) => void
  enabled?: boolean
}

export function useRealtimeArtworks({
  onNewArtwork,
  onArtworkUpdate,
  onArtworkDelete,
  onViewCountUpdate,
  enabled = true
}: RealtimeArtworksOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const handleArtworkChanges = useCallback((
    payload: RealtimePostgresChangesPayload<ArtworkRecord>
  ) => {
    try {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new && onNewArtwork) {
            onNewArtwork(payload.new as ArtworkRecord)
          }
          break
        
        case 'UPDATE':
          if (payload.new && payload.old) {
            const newArtwork = payload.new as ArtworkRecord
            const oldArtwork = payload.old as ArtworkRecord
            
            // Check if only view_count changed for specific handling
            if (newArtwork.view_count !== oldArtwork.view_count && onViewCountUpdate) {
              onViewCountUpdate(newArtwork.id, newArtwork.view_count)
            }
            
            // Always call the general update handler
            if (onArtworkUpdate) {
              onArtworkUpdate(newArtwork)
            }
          }
          break
        
        case 'DELETE':
          if (payload.old && onArtworkDelete) {
            onArtworkDelete((payload.old as ArtworkRecord).id)
          }
          break
      }
    } catch (err) {
      console.error('Error handling realtime artwork changes:', err)
      setError(err instanceof Error ? err.message : 'Failed to handle realtime changes')
    }
  }, [onNewArtwork, onArtworkUpdate, onArtworkDelete, onViewCountUpdate])

  useEffect(() => {
    if (!enabled) {
      // Clean up existing subscription if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
      }
      return
    }

    // Create realtime channel for artworks table
    const channel = supabase
      .channel('artworks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        handleArtworkChanges
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError('Failed to connect to realtime updates')
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError('Realtime connection timed out')
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [enabled, handleArtworkChanges, supabase])

  const reconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    
    // Force re-subscription by toggling the effect
    setError(null)
    
    // Create new channel
    const channel = supabase
      .channel('artworks-changes-reconnect')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        handleArtworkChanges
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError('Failed to connect to realtime updates')
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError('Realtime connection timed out')
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    channelRef.current = channel
  }, [handleArtworkChanges, supabase])

  return {
    isConnected,
    error,
    reconnect
  }
}