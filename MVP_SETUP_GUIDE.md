# 🎨 Art Gallery MVP Setup Guide

This guide will help you set up and test the complete Art Gallery MVP with Supabase integration.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git (for version control)

## 🚀 Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `art-gallery-mvp`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Project Credentials
1. In your Supabase dashboard, go to **Settings > API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 1.3 Update Environment Variables
Update your `.env` file with the actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## 🗄️ Step 2: Database Setup

### 2.1 Run Database Migrations
1. In your Supabase dashboard, go to **SQL Editor**
2. Run each migration file in order:

**Migration 1: Initial Schema**
```sql
-- Copy and paste the content from supabase/migrations/001_initial_schema.sql
-- This creates the user_profiles and artworks tables
```

**Migration 2: Row Level Security**
```sql
-- Copy and paste the content from supabase/migrations/002_row_level_security.sql
-- This sets up authentication and authorization rules
```

**Migration 3: Storage Setup**
```sql
-- Copy and paste the content from supabase/migrations/003_storage_setup.sql
-- This creates the storage bucket for artwork images
```

**Migration 4: Pagination Optimization**
```sql
-- Copy and paste the content from supabase/migrations/004_pagination_optimization.sql
-- This adds performance optimizations
```

### 2.2 Verify Database Setup
After running migrations, you should see:
- ✅ `user_profiles` table in **Database > Tables**
- ✅ `artworks` table in **Database > Tables**
- ✅ `artwork-images` bucket in **Storage**

## 🔐 Step 3: Authentication Setup

### 3.1 Configure Auth Settings
1. Go to **Authentication > Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Enable **Email** provider (should be enabled by default)

### 3.2 Optional: Enable Social Auth
For better UX, enable Google OAuth:
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Add your Google OAuth credentials (or use Supabase's for testing)

## 📦 Step 4: Install Dependencies & Run

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Start Development Server
```bash
npm run dev
```

The app should now be running at `http://localhost:3000`

## 🧪 Step 5: Test the MVP

### 5.1 Test Authentication
1. **Visit**: `http://localhost:3000`
2. **Click**: "Sign In" in the navigation
3. **Register**: Create a new account with email/password
4. **Verify**: Check that you're redirected and logged in
5. **Profile**: Visit `/profile` to see your user profile

### 5.2 Test Public Gallery
1. **Visit**: `http://localhost:3000/gallery`
2. **Browse**: Should see the public gallery (empty initially)
3. **Search**: Try the search functionality
4. **Filter**: Test category filters

### 5.3 Test Artwork Upload
1. **Login**: Make sure you're authenticated
2. **Visit**: `http://localhost:3000/upload`
3. **Upload**: Try uploading an artwork:
   - Add title, description
   - Select category
   - Upload an image file (JPG, PNG, WebP)
   - Submit the form
4. **Verify**: Check that the artwork appears in the gallery

### 5.4 Test Admin Features (if applicable)
1. **Visit**: `http://localhost:3000/admin`
2. **Check**: Admin dashboard functionality
3. **Manage**: Test artwork management features

## 🔍 Step 6: Verify Data in Supabase

### 6.1 Check Database
1. Go to **Database > Table Editor**
2. **user_profiles**: Should see your user profile
3. **artworks**: Should see uploaded artworks

### 6.2 Check Storage
1. Go to **Storage > artwork-images**
2. Should see uploaded image files

## 🐛 Troubleshooting

### Common Issues:

**1. "Invalid API key" error**
- ✅ Double-check your environment variables
- ✅ Restart the dev server after updating `.env`
- ✅ Make sure no extra spaces in the keys

**2. "Table doesn't exist" error**
- ✅ Run all database migrations in order
- ✅ Check **Database > Tables** in Supabase dashboard

**3. "Storage bucket not found" error**
- ✅ Run the storage setup migration
- ✅ Check **Storage** in Supabase dashboard

**4. Upload fails**
- ✅ Check file size (max 10MB)
- ✅ Check file type (JPG, PNG, WebP only)
- ✅ Verify storage bucket exists and has correct policies

**5. Authentication issues**
- ✅ Check Site URL and Redirect URLs in Auth settings
- ✅ Clear browser cache and cookies
- ✅ Check browser console for errors

## 📊 Step 7: Test with Sample Data

### 7.1 Add Sample Artworks
You can add sample data through the upload interface or directly in Supabase:

1. Go to **Database > Table Editor > artworks**
2. Click **Insert row**
3. Add sample artwork data

### 7.2 Test All Features
- ✅ Browse gallery
- ✅ Search artworks
- ✅ Filter by category
- ✅ View artwork details
- ✅ User authentication
- ✅ Upload new artworks
- ✅ User profiles

## 🎯 MVP Features Checklist

### Core Features:
- ✅ User authentication (register/login)
- ✅ Public art gallery
- ✅ Artwork upload system
- ✅ Image storage and optimization
- ✅ Search and filtering
- ✅ Responsive design
- ✅ User profiles

### Advanced Features:
- ✅ Real-time updates
- ✅ Pagination
- ✅ Category management
- ✅ View tracking
- ✅ Admin dashboard
- ✅ Error handling

## 🚀 Next Steps

Once your MVP is working:

1. **Deploy to Production**:
   - Use Vercel, Netlify, or similar
   - Update Supabase Auth URLs for production

2. **Add More Features**:
   - Comments and ratings
   - Favorites/bookmarks
   - Artist profiles
   - Purchase system

3. **Optimize Performance**:
   - Image optimization
   - Caching strategies
   - Database indexing

4. **Add Analytics**:
   - User behavior tracking
   - Popular artworks
   - Performance monitoring

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables
4. Ensure all migrations ran successfully

Your Art Gallery MVP should now be fully functional! 🎨✨