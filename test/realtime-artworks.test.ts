import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRealtimeArtworks } from '../hooks/use-realtime-artworks'
import type { ArtworkRecord } from '../types'

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
}

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
}

vi.mock('../lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('useRealtimeArtworks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useRealtimeArtworks())
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should create channel and subscribe when enabled', () => {
    renderHook(() => useRealtimeArtworks({ enabled: true }))
    
    expect(mockSupabase.channel).toHaveBeenCalledWith('artworks-changes')
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'artworks'
      },
      expect.any(Function)
    )
    expect(mockChannel.subscribe).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should not create channel when disabled', () => {
    renderHook(() => useRealtimeArtworks({ enabled: false }))
    
    expect(mockSupabase.channel).not.toHaveBeenCalled()
  })

  it('should call onNewArtwork when INSERT event is received', () => {
    const onNewArtwork = vi.fn()
    const { result } = renderHook(() => useRealtimeArtworks({ onNewArtwork }))
    
    // Simulate channel subscription callback
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0]
    act(() => {
      subscribeCallback('SUBSCRIBED')
    })
    
    expect(result.current.isConnected).toBe(true)
    
    // Simulate INSERT event
    const changeHandler = mockChannel.on.mock.calls[0][2]
    const mockArtwork: ArtworkRecord = {
      id: '1',
      title: 'Test Artwork',
      description: 'Test Description',
      category: 'painting',
      image_url: 'test.jpg',
      image_path: 'test.jpg',
      artist_id: 'artist1',
      artist_name: 'Test Artist',
      created_at: '2024-01-01',
      view_count: 0
    }
    
    act(() => {
      changeHandler({
        eventType: 'INSERT',
        new: mockArtwork,
        old: null
      })
    })
    
    expect(onNewArtwork).toHaveBeenCalledWith(mockArtwork)
  })

  it('should call onViewCountUpdate when view_count changes', () => {
    const onViewCountUpdate = vi.fn()
    renderHook(() => useRealtimeArtworks({ onViewCountUpdate }))
    
    // Simulate UPDATE event with view count change
    const changeHandler = mockChannel.on.mock.calls[0][2]
    const oldArtwork: ArtworkRecord = {
      id: '1',
      title: 'Test Artwork',
      description: 'Test Description',
      category: 'painting',
      image_url: 'test.jpg',
      image_path: 'test.jpg',
      artist_id: 'artist1',
      artist_name: 'Test Artist',
      created_at: '2024-01-01',
      view_count: 5
    }
    
    const newArtwork: ArtworkRecord = {
      ...oldArtwork,
      view_count: 6
    }
    
    act(() => {
      changeHandler({
        eventType: 'UPDATE',
        new: newArtwork,
        old: oldArtwork
      })
    })
    
    expect(onViewCountUpdate).toHaveBeenCalledWith('1', 6)
  })

  it('should call onArtworkDelete when DELETE event is received', () => {
    const onArtworkDelete = vi.fn()
    renderHook(() => useRealtimeArtworks({ onArtworkDelete }))
    
    // Simulate DELETE event
    const changeHandler = mockChannel.on.mock.calls[0][2]
    const deletedArtwork: ArtworkRecord = {
      id: '1',
      title: 'Test Artwork',
      description: 'Test Description',
      category: 'painting',
      image_url: 'test.jpg',
      image_path: 'test.jpg',
      artist_id: 'artist1',
      artist_name: 'Test Artist',
      created_at: '2024-01-01',
      view_count: 5
    }
    
    act(() => {
      changeHandler({
        eventType: 'DELETE',
        new: null,
        old: deletedArtwork
      })
    })
    
    expect(onArtworkDelete).toHaveBeenCalledWith('1')
  })

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useRealtimeArtworks())
    
    // Simulate connection error
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0]
    act(() => {
      subscribeCallback('CHANNEL_ERROR')
    })
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBe('Failed to connect to realtime updates')
  })

  it('should reconnect when reconnect is called', () => {
    const { result } = renderHook(() => useRealtimeArtworks())
    
    act(() => {
      result.current.reconnect()
    })
    
    expect(mockSupabase.removeChannel).toHaveBeenCalled()
    expect(mockSupabase.channel).toHaveBeenCalledWith('artworks-changes-reconnect')
  })
})