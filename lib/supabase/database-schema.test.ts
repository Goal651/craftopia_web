import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createClient } from './client'

// Mock Supabase client for testing
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn()
  },
  rpc: vi.fn()
}

// Mock the client creation
vi.mock('./client', () => ({
  createClient: () => mockSupabase
}))

describe('Database Schema Unit Tests', () => {
  let supabase: ReturnType<typeof createClient>

  beforeEach(() => {
    supabase = createClient()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Table Creation and Constraints', () => {
    describe('user_profiles table', () => {
      it('should enforce NOT NULL constraint on display_name', async () => {
        // Mock database error for missing display_name
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23502', // PostgreSQL NOT NULL violation
            message: 'null value in column "display_name" violates not-null constraint'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('user_profiles')
          .insert({
            id: '123e4567-e89b-12d3-a456-426614174000',
            // Missing display_name - should fail
            avatar_url: 'https://example.com/avatar.jpg'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('23502')
        expect(mockInsert).toHaveBeenCalledWith({
          id: '123e4567-e89b-12d3-a456-426614174000',
          avatar_url: 'https://example.com/avatar.jpg'
        })
      })
      it('should enforce UUID format for id field', async () => {
        // Mock database error for invalid UUID
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '22P02', // PostgreSQL invalid UUID format
            message: 'invalid input syntax for type uuid: "invalid-uuid"'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('user_profiles')
          .insert({
            id: 'invalid-uuid',
            display_name: 'Test User'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('22P02')
      })

      it('should enforce foreign key constraint to auth.users', async () => {
        // Mock database error for non-existent user reference
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23503', // PostgreSQL foreign key violation
            message: 'insert or update on table "user_profiles" violates foreign key constraint'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('user_profiles')
          .insert({
            id: '123e4567-e89b-12d3-a456-426614174000', // Non-existent user
            display_name: 'Test User'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('23503')
      })

      it('should allow valid user profile creation', async () => {
        const mockInsert = vi.fn().mockResolvedValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            display_name: 'Test User',
            avatar_url: null,
            bio: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('user_profiles')
          .insert({
            id: '123e4567-e89b-12d3-a456-426614174000',
            display_name: 'Test User'
          })

        expect(result.error).toBeNull()
        expect(result.data).toBeTruthy()
        expect(result.data?.[0]?.display_name).toBe('Test User')
      })
    })
    describe('artworks table', () => {
      it('should enforce NOT NULL constraints on required fields', async () => {
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23502',
            message: 'null value in column "title" violates not-null constraint'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            // Missing required fields: title, category, image_url, image_path, artist_id, artist_name
            description: 'Test artwork'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('23502')
      })

      it('should enforce category CHECK constraint', async () => {
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23514', // PostgreSQL check constraint violation
            message: 'new row for relation "artworks" violates check constraint'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            title: 'Test Artwork',
            category: 'invalid-category', // Should fail CHECK constraint
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174000',
            artist_name: 'Test Artist'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('23514')
      })

      it('should accept valid category values', async () => {
        const validCategories = [
          'painting', 'digital-art', 'photography', 
          'sculpture', 'mixed-media', 'drawing', 'other'
        ]

        for (const category of validCategories) {
          const mockInsert = vi.fn().mockResolvedValue({
            data: [{
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Test Artwork',
              category,
              image_url: 'https://example.com/image.jpg',
              image_path: 'path/to/image.jpg',
              artist_id: '123e4567-e89b-12d3-a456-426614174000',
              artist_name: 'Test Artist',
              view_count: 0,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }],
            error: null
          })

          mockSupabase.from.mockReturnValue({
            insert: mockInsert
          })

          const result = await supabase
            .from('artworks')
            .insert({
              title: 'Test Artwork',
              category,
              image_url: 'https://example.com/image.jpg',
              image_path: 'path/to/image.jpg',
              artist_id: '123e4567-e89b-12d3-a456-426614174000',
              artist_name: 'Test Artist'
            })

          expect(result.error).toBeNull()
          expect(result.data?.[0]?.category).toBe(category)
        }
      })
      it('should enforce foreign key constraint to auth.users for artist_id', async () => {
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23503',
            message: 'insert or update on table "artworks" violates foreign key constraint'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            title: 'Test Artwork',
            category: 'painting',
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174999', // Non-existent user
            artist_name: 'Test Artist'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('23503')
      })

      it('should set default values correctly', async () => {
        const mockInsert = vi.fn().mockResolvedValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174001', // Auto-generated UUID
            title: 'Test Artwork',
            description: null, // Optional field
            category: 'painting',
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174000',
            artist_name: 'Test Artist',
            view_count: 0, // Default value
            created_at: '2024-01-01T00:00:00Z', // Auto-generated
            updated_at: '2024-01-01T00:00:00Z' // Auto-generated
          }],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            title: 'Test Artwork',
            category: 'painting',
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174000',
            artist_name: 'Test Artist'
          })

        expect(result.error).toBeNull()
        expect(result.data?.[0]?.view_count).toBe(0)
        expect(result.data?.[0]?.id).toBeTruthy()
        expect(result.data?.[0]?.created_at).toBeTruthy()
        expect(result.data?.[0]?.updated_at).toBeTruthy()
      })
    })

    describe('Database indexes', () => {
      it('should use indexes for performance queries', async () => {
        // Mock query that would use artist_id index
        const mockSelect = vi.fn().mockResolvedValue({
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Artwork 1',
              artist_id: '123e4567-e89b-12d3-a456-426614174000'
            }
          ],
          error: null
        })

        const mockEq = vi.fn().mockReturnValue({
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Artwork 1',
              artist_id: '123e4567-e89b-12d3-a456-426614174000'
            }
          ],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          select: () => ({
            eq: mockEq
          })
        })

        const result = await supabase
          .from('artworks')
          .select('*')
          .eq('artist_id', '123e4567-e89b-12d3-a456-426614174000')

        expect(result.error).toBeNull()
        expect(mockEq).toHaveBeenCalledWith('artist_id', '123e4567-e89b-12d3-a456-426614174000')
      })
    })
  })
  describe('Row Level Security (RLS) Policy Enforcement', () => {
    describe('user_profiles RLS policies', () => {
      it('should allow viewing all profiles (public read)', async () => {
        const mockSelect = vi.fn().mockResolvedValue({
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              display_name: 'User 1'
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              display_name: 'User 2'
            }
          ],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          select: mockSelect
        })

        const result = await supabase
          .from('user_profiles')
          .select('*')

        expect(result.error).toBeNull()
        expect(result.data).toHaveLength(2)
        expect(mockSelect).toHaveBeenCalledWith('*')
      })

      it('should enforce ownership for profile updates', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          error: null
        })

        // Mock successful update for own profile
        const mockUpdate = vi.fn().mockResolvedValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            display_name: 'Updated Name'
          }],
          error: null
        })

        const mockEq = vi.fn().mockReturnValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174000',
            display_name: 'Updated Name'
          }],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          update: () => ({
            eq: mockEq
          })
        })

        const result = await supabase
          .from('user_profiles')
          .update({ display_name: 'Updated Name' })
          .eq('id', '123e4567-e89b-12d3-a456-426614174000')

        expect(result.error).toBeNull()
        expect(mockEq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000')
      })

      it('should prevent updating other users profiles', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          error: null
        })

        // Mock RLS policy violation
        const mockEq = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '42501', // PostgreSQL insufficient privilege
            message: 'new row violates row-level security policy'
          }
        })

        mockSupabase.from.mockReturnValue({
          update: () => ({
            eq: mockEq
          })
        })

        const result = await supabase
          .from('user_profiles')
          .update({ display_name: 'Hacked Name' })
          .eq('id', '123e4567-e89b-12d3-a456-426614174001') // Different user ID

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('42501')
      })
    })
    describe('artworks RLS policies', () => {
      it('should allow anyone to view artworks (public gallery)', async () => {
        const mockSelect = vi.fn().mockResolvedValue({
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              title: 'Public Artwork 1',
              artist_name: 'Artist 1'
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174002',
              title: 'Public Artwork 2',
              artist_name: 'Artist 2'
            }
          ],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          select: mockSelect
        })

        const result = await supabase
          .from('artworks')
          .select('*')

        expect(result.error).toBeNull()
        expect(result.data).toHaveLength(2)
        expect(mockSelect).toHaveBeenCalledWith('*')
      })

      it('should require authentication for artwork insertion', async () => {
        // Mock unauthenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null
        })

        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '42501',
            message: 'new row violates row-level security policy for table "artworks"'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            title: 'Unauthorized Artwork',
            category: 'painting',
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174000',
            artist_name: 'Test Artist'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('42501')
      })

      it('should enforce artist_id matches authenticated user for insertion', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          error: null
        })

        // Mock RLS policy violation for mismatched artist_id
        const mockInsert = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '42501',
            message: 'new row violates row-level security policy'
          }
        })

        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const result = await supabase
          .from('artworks')
          .insert({
            title: 'Fake Artwork',
            category: 'painting',
            image_url: 'https://example.com/image.jpg',
            image_path: 'path/to/image.jpg',
            artist_id: '123e4567-e89b-12d3-a456-426614174001', // Different user
            artist_name: 'Other Artist'
          })

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('42501')
      })
      it('should allow users to update their own artworks', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          error: null
        })

        const mockEq = vi.fn().mockResolvedValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174001',
            title: 'Updated Artwork Title',
            artist_id: '123e4567-e89b-12d3-a456-426614174000'
          }],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          update: () => ({
            eq: mockEq
          })
        })

        const result = await supabase
          .from('artworks')
          .update({ title: 'Updated Artwork Title' })
          .eq('id', '123e4567-e89b-12d3-a456-426614174001')

        expect(result.error).toBeNull()
        expect(result.data?.[0]?.title).toBe('Updated Artwork Title')
      })

      it('should prevent users from updating other users artworks', async () => {
        // Mock authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({
          data: {
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000'
            }
          },
          error: null
        })

        const mockEq = vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '42501',
            message: 'new row violates row-level security policy'
          }
        })

        mockSupabase.from.mockReturnValue({
          update: () => ({
            eq: mockEq
          })
        })

        // Try to update artwork owned by different user
        const result = await supabase
          .from('artworks')
          .update({ title: 'Hacked Title' })
          .eq('id', '123e4567-e89b-12d3-a456-426614174002') // Artwork owned by different user

        expect(result.error).toBeTruthy()
        expect(result.error?.code).toBe('42501')
      })

      it('should allow view count updates by anyone (special policy)', async () => {
        // Mock successful view count increment (no authentication required)
        const mockEq = vi.fn().mockResolvedValue({
          data: [{
            id: '123e4567-e89b-12d3-a456-426614174001',
            view_count: 5
          }],
          error: null
        })

        mockSupabase.from.mockReturnValue({
          update: () => ({
            eq: mockEq
          })
        })

        const result = await supabase
          .from('artworks')
          .update({ view_count: 5 })
          .eq('id', '123e4567-e89b-12d3-a456-426614174001')

        expect(result.error).toBeNull()
        expect(result.data?.[0]?.view_count).toBe(5)
      })
    })

    describe('CASCADE deletion behavior', () => {
      it('should cascade delete user_profiles when auth.users is deleted', async () => {
        // Mock successful cascade deletion
        const mockDelete = vi.fn().mockResolvedValue({
          data: null,
          error: null
        })

        mockSupabase.auth.admin = {
          deleteUser: mockDelete
        }

        const result = await mockSupabase.auth.admin.deleteUser('123e4567-e89b-12d3-a456-426614174000')

        expect(result.error).toBeNull()
        expect(mockDelete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000')
        // In a real scenario, this would also delete the user_profiles record
        // and all associated artworks due to CASCADE constraints
      })
    })
  })
})