# Supabase Setup Instructions

This document provides step-by-step instructions for setting up Supabase for the Public Art Upload System.

## Prerequisites

- Node.js and npm installed
- A Supabase account (sign up at https://supabase.com)

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "art-gallery-public")
5. Enter a database password (save this securely)
6. Select a region close to your users
7. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API keys > anon public key
   - Project API keys > service_role key (keep this secret!)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## 4. Set Up Database Schema

The database schema will be created in the next task. For now, your Supabase integration is ready to use.

## 5. Verify Installation

The Supabase client is configured and ready to use:

- **Browser client**: `lib/supabase/client.ts`
- **Server client**: `lib/supabase/server.ts`
- **Middleware**: `lib/supabase/middleware.ts`
- **Types**: `types/supabase.ts`

## Next Steps

1. Set up the database schema (Task 3)
2. Implement authentication (Task 2)
3. Configure storage bucket (Task 3)

## Troubleshooting

- Make sure your environment variables are correctly set
- Verify your Supabase project is active and not paused
- Check that your API keys are copied correctly (no extra spaces)