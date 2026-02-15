import { ArtworkRecord } from "@/types"

interface UserViewData {
  userId: string
  viewedArtworks: string[] // Array of artwork IDs
  lastViewed: Record<string, string> // artworkId -> timestamp
}

const STORAGE_KEY = 'craftopia_user_views'

export class ViewTracker {
  private static instance: ViewTracker
  private userViews: UserViewData | null = null

  static getInstance(): ViewTracker {
    if (!ViewTracker.instance) {
      ViewTracker.instance = new ViewTracker()
    }
    return ViewTracker.instance
  }

  // Initialize with current user
  initializeUser(userId: string): void {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const allViews: Record<string, UserViewData> = JSON.parse(stored)
      this.userViews = allViews[userId] || {
        userId,
        viewedArtworks: [],
        lastViewed: {}
      }
    } else {
      this.userViews = {
        userId,
        viewedArtworks: [],
        lastViewed: {}
      }
    }
  }

  // Check if user has viewed artwork
  hasViewed(artworkId: string): boolean {
    if (!this.userViews) return false
    return this.userViews.viewedArtworks.includes(artworkId)
  }

  // Mark artwork as viewed
  markAsViewed(artworkId: string): void {
    if (!this.userViews) return
    
    if (!this.userViews.viewedArtworks.includes(artworkId)) {
      this.userViews.viewedArtworks.push(artworkId)
    }
    this.userViews.lastViewed[artworkId] = new Date().toISOString()
    this.saveToStorage()
  }

  // Get user's view count
  getUserViewCount(): number {
    if (!this.userViews) return 0
    return this.userViews.viewedArtworks.length
  }

  // Get when user viewed artwork
  getViewedAt(artworkId: string): string | null {
    if (!this.userViews) return null
    return this.userViews.lastViewed[artworkId] || null
  }

  // Clear user views (for testing)
  clearUserViews(): void {
    if (!this.userViews) return
    this.userViews.viewedArtworks = []
    this.userViews.lastViewed = {}
    this.saveToStorage()
  }

  // Save to localStorage
  private saveToStorage(): void {
    if (!this.userViews) return
    
    const stored = localStorage.getItem(STORAGE_KEY)
    const allViews: Record<string, UserViewData> = stored ? JSON.parse(stored) : {}
    allViews[this.userViews.userId] = this.userViews
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allViews))
  }

  // Get all user views (for analytics)
  getAllUserViews(): UserViewData | null {
    return this.userViews
  }
}

// Export singleton instance
export const viewTracker = ViewTracker.getInstance()

// Helper functions for React components
export const initializeViewTracking = (userId: string) => {
  viewTracker.initializeUser(userId)
}

export const canTrackView = (artworkId: string): boolean => {
  return !viewTracker.hasViewed(artworkId)
}

export const trackArtworkView = (artworkId: string) => {
  viewTracker.markAsViewed(artworkId)
}

export const hasUserViewedArtwork = (artworkId: string): boolean => {
  return viewTracker.hasViewed(artworkId)
}
