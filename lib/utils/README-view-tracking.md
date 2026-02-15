# User-Specific View Tracking System

## Overview
This system prevents the same user from incrementing view counts multiple times for the same artwork, ensuring accurate analytics.

## How It Works

### 1. ViewTracker Class
- **Singleton Pattern**: Ensures consistent tracking across the app
- **LocalStorage Storage**: Persists user views between sessions
- **User-Specific**: Tracks views per user ID

### 2. Key Functions

#### `initializeUser(userId: string)`
- Initializes tracking for the current user
- Loads existing view data from localStorage
- Creates new user record if needed

#### `hasViewed(artworkId: string): boolean`
- Checks if user has already viewed artwork
- Returns true/false

#### `markAsViewed(artworkId: string)`
- Marks artwork as viewed for current user
- Updates localStorage with timestamp

#### `canTrackView(artworkId: string): boolean`
- Returns true if view can be tracked (not viewed before)
- Used to prevent duplicate view counting

#### `trackArtworkView(artworkId: string)`
- Marks artwork as viewed
- Should be called when incrementing view count

### 3. Implementation in Components

#### ArtCard Component
```tsx
// Initialize on component mount
useEffect(() => {
  if (user?.id) {
    initializeViewTracking(user.id)
  }
}, [user])

// Handle view button click
const handleView = async (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (canTrackView(artwork.id)) {
    // Increment view count
    setViewCount(prev => prev + 1)
    
    // Track the view
    trackArtworkView(artwork.id)
    
    // API call to increment database view count
    await fetch(`/api/artworks/${artwork.id}/views`, {
      method: 'POST'
    })
  }
  
  // Navigate to artwork
  window.location.href = `/artworks/${artwork.id}`
}
```

#### Artwork Detail Page
```tsx
// Similar implementation for detail page views
const incrementViewCount = async () => {
  if (!artwork || viewCountUpdated) return

  // Check if user can track view
  if (user?.id && !canTrackView(artworkId)) {
    console.log('User already viewed this artwork')
    return
  }

  // API call to increment view count
  const response = await fetch(`/api/artworks/${artworkId}/views`, {
    method: 'POST'
  })
  
  if (response.ok) {
    // Mark as viewed
    trackArtworkView(artworkId)
    setViewCountUpdated(true)
  }
}
```

## Data Structure

### LocalStorage Format
```json
{
  "craftopia_user_views": {
    "user_123": {
      "userId": "user_123",
      "viewedArtworks": ["artwork_1", "artwork_2", "artwork_3"],
      "lastViewed": {
        "artwork_1": "2024-01-15T10:30:00.000Z",
        "artwork_2": "2024-01-15T11:00:00.000Z",
        "artwork_3": "2024-01-15T11:30:00.000Z"
      }
    },
    "user_456": {
      "userId": "user_456",
      "viewedArtworks": ["artwork_1", "artwork_4"],
      "lastViewed": {
        "artwork_1": "2024-01-15T12:00:00.000Z",
        "artwork_4": "2024-01-15T12:30:00.000Z"
      }
    }
  }
}
```

## Like Tracking

### Storage Format
```json
{
  "liked_artworks": {
    "artwork_1": true,
    "artwork_2": false,
    "artwork_3": true
  }
}
```

### API Endpoints

#### `/api/artworks/[id]/views` (POST)
- Increments view count in database
- Returns updated view count

#### `/api/artworks/[id]/like` (POST)
- Updates like status
- Returns updated like count

## Benefits

1. **Accurate Analytics**: Prevents view count inflation
2. **User Privacy**: Tracks locally, no server storage required
3. **Performance**: Fast localStorage access
4. **Persistence**: Survives page refreshes and sessions
5. **Scalable**: Works with any number of users and artworks

## Usage Examples

### Check if User Can Track View
```tsx
if (canTrackView(artworkId)) {
  // Show "New" badge or increment view count
}
```

### Get User's View History
```tsx
const userViews = viewTracker.getAllUserViews()
console.log(`User viewed ${userViews?.viewedArtworks.length} artworks`)
```

### Clear User Views (Testing)
```tsx
viewTracker.clearUserViews()
```

## Future Enhancements

1. **Database Storage**: Move to server-side for better analytics
2. **View Expiration**: Reset views after certain time period
3. **Anonymous Users**: Track by IP/fingerprint for non-logged users
4. **Analytics Dashboard**: Show view statistics to artists
5. **View Heatmap**: Track which parts of artwork get most attention
