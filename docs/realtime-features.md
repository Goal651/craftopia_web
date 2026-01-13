# Real-time Features Documentation

## Overview

The Public Art Upload System now includes real-time updates using Supabase's real-time subscriptions. This enables live updates across the application when artworks are added, updated, or when view counts change.

## Features Implemented

### 1. Real-time Artwork Updates
- **New Artwork Notifications**: Users see instant notifications when new artworks are uploaded
- **Live Gallery Updates**: The gallery automatically updates when new artworks are added
- **View Count Updates**: View counts update in real-time across all users

### 2. Components Added

#### `useRealtimeArtworks` Hook
- **Location**: `hooks/use-realtime-artworks.ts`
- **Purpose**: Manages Supabase real-time subscriptions for artwork changes
- **Features**:
  - Subscribes to INSERT, UPDATE, DELETE events on the artworks table
  - Handles connection status and error states
  - Provides callbacks for different event types
  - Supports enabling/disabling subscriptions

#### `RealtimeNotification` Component
- **Location**: `components/ui/realtime-notification.tsx`
- **Purpose**: Shows animated notifications for new artworks
- **Features**:
  - Animated slide-in notification
  - Auto-dismiss after 8 seconds
  - Click to view artwork directly
  - Glassmorphic design matching the app theme

#### `LiveViewCounter` Component
- **Location**: `components/ui/live-view-counter.tsx`
- **Purpose**: Displays view counts with real-time updates
- **Features**:
  - Animated counter updates
  - Visual feedback when count changes
  - Smooth transitions and scaling effects

### 3. Integration Points

#### Gallery Page (`app/gallery/page.tsx`)
- Real-time connection status indicator
- Automatic addition of new artworks to the gallery
- Live view count updates on artwork cards
- New artwork notifications with direct navigation

#### Artwork Detail Page (`app/artworks/[id]/page.tsx`)
- Live view counter with animated updates
- Real-time artwork metadata updates
- Automatic updates when artwork details change

## Technical Implementation

### Real-time Subscription Setup
```typescript
const { isConnected, error, reconnect } = useRealtimeArtworks({
  onNewArtwork: (artwork) => {
    // Handle new artwork
  },
  onArtworkUpdate: (artwork) => {
    // Handle artwork updates
  },
  onViewCountUpdate: (artworkId, newCount) => {
    // Handle view count changes
  },
  enabled: true
})
```

### Event Handling
The system listens for three types of database events:
1. **INSERT**: New artworks added to the database
2. **UPDATE**: Existing artworks modified (including view count changes)
3. **DELETE**: Artworks removed from the database

### Connection Management
- Automatic connection establishment
- Error handling and reconnection logic
- Connection status indicators for users
- Graceful degradation when real-time is unavailable

## User Experience Improvements

### 1. Live Updates
- Users see new artworks immediately without refreshing
- View counts update in real-time as others view artworks
- Gallery stays current with the latest uploads

### 2. Visual Feedback
- Connection status indicators show real-time availability
- Animated notifications for new content
- Smooth transitions for count updates

### 3. Performance Considerations
- Real-time subscriptions only active when needed
- Efficient event filtering to prevent unnecessary updates
- Minimal impact on page performance

## Configuration

### Environment Variables
Real-time functionality uses the existing Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Requirements
- Row Level Security (RLS) policies must allow real-time subscriptions
- Proper table permissions for the artworks table
- Real-time enabled on the Supabase project

## Testing

### Unit Tests
- Comprehensive test coverage for the `useRealtimeArtworks` hook
- Mock Supabase client for isolated testing
- Event handling verification
- Connection state management tests

### Integration Testing
- Real-time updates work across multiple browser tabs
- Proper event filtering and handling
- Error recovery and reconnection logic

## Future Enhancements

### Potential Improvements
1. **User Presence**: Show who's currently viewing artworks
2. **Live Comments**: Real-time commenting system
3. **Artist Notifications**: Notify artists when their work is viewed
4. **Admin Dashboard**: Real-time analytics and moderation tools
5. **Push Notifications**: Browser notifications for new artworks

### Performance Optimizations
1. **Event Batching**: Group multiple updates for better performance
2. **Selective Subscriptions**: Only subscribe to relevant events
3. **Connection Pooling**: Optimize connection management
4. **Caching Strategy**: Combine real-time with intelligent caching

## Troubleshooting

### Common Issues
1. **Connection Failures**: Check Supabase project settings and API keys
2. **Permission Errors**: Verify RLS policies allow real-time access
3. **Event Not Firing**: Ensure database triggers are properly configured
4. **Performance Issues**: Monitor subscription count and event frequency

### Debug Tools
- Browser console shows connection status
- Real-time connection indicator in the UI
- Error messages displayed to users when appropriate
- Reconnection attempts logged for debugging