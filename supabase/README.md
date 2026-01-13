# Database Setup for Public Art Upload System

This directory contains the database schema and migration files for the Public Art Upload System.

## Quick Setup

### Option 1: Using the Complete Setup Script
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `../scripts/setup-database.sql`
4. Run the script

### Option 2: Using Individual Migration Files
Run the migration files in order:

1. `001_initial_schema.sql` - Creates tables, indexes, and triggers
2. `002_row_level_security.sql` - Sets up RLS policies

## Database Schema

### Tables Created

#### `user_profiles`
- Extends `auth.users` with additional profile information
- Fields: `id`, `display_name`, `avatar_url`, `bio`, `created_at`, `updated_at`
- References: `auth.users(id)` with CASCADE delete

#### `artworks`
- Stores artwork metadata and file references
- Fields: `id`, `title`, `description`, `category`, `image_url`, `image_path`, `artist_id`, `artist_name`, `view_count`, `created_at`, `updated_at`
- References: `auth.users(id)` with CASCADE delete
- Constraints: Category must be one of: 'painting', 'digital-art', 'photography', 'sculpture', 'mixed-media', 'drawing', 'other'

### Storage Bucket

#### `artworks` bucket
- **Public access**: Enabled for easy image viewing
- **File size limit**: 10MB maximum
- **Allowed types**: JPEG, PNG, WebP images only
- **Organization**: Files stored in user-specific folders (`{user_id}/{filename}`)

### Indexes Created

Performance indexes for efficient queries:
- `idx_artworks_artist_id` - For artist profile pages
- `idx_artworks_category` - For category filtering
- `idx_artworks_created_at` - For chronological sorting
- `idx_artworks_view_count` - For popularity sorting
- `idx_artworks_search` - Full-text search on title, artist name, and description

### Row Level Security (RLS)

#### User Profiles
- **SELECT**: Anyone can view all profiles (for artist discovery)
- **INSERT**: Users can only create their own profile
- **UPDATE**: Users can only update their own profile
- **DELETE**: Users can only delete their own profile

#### Artworks
- **SELECT**: Anyone can view all artworks (public gallery)
- **INSERT**: Authenticated users can only insert artworks with their own `artist_id`
- **UPDATE**: Users can only update their own artworks
- **DELETE**: Users can only delete their own artworks
- **Special**: Anyone can increment view counts (for analytics)

#### Storage Objects (artworks bucket)
- **SELECT**: Anyone can view artwork images (public access)
- **INSERT**: Authenticated users can upload images to their own folder only
- **UPDATE**: Users can only update their own images
- **DELETE**: Users can only delete their own images

### Automatic Features

- **Timestamps**: `updated_at` fields are automatically updated on record changes
- **UUIDs**: Primary keys are automatically generated using `gen_random_uuid()`
- **Referential Integrity**: Foreign key constraints ensure data consistency

## Verification

After running the setup, verify the schema by checking:

1. Tables exist: `user_profiles`, `artworks`
2. Storage bucket exists: `artworks` (check in Storage section)
3. Indexes are created (check in Supabase dashboard)
4. RLS policies are active (check in Authentication > Policies)
5. Storage policies are active (check in Storage > artworks > Policies)
6. Triggers are working (test by updating a record)

## Storage Configuration

The `artworks` storage bucket is configured with:
- **Public access**: Images can be viewed without authentication
- **File organization**: `{user_id}/{timestamp}_{random}_{filename}`
- **Security**: Users can only upload to their own folder
- **Validation**: File type and size validation enforced

## Next Steps

After database and storage setup:
1. Test the schema with sample data
2. Verify storage upload/download functionality
3. Implement the authentication system (Task 2)