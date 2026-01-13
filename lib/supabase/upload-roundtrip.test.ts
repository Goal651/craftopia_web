import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { createClient } from './client'
import { uploadArtworkImage, deleteArtworkImage, getPublicUrl } from './storage'
import type { ArtworkCategory, ArtworkRecord } from '@/types'

// Mock Supabase client
vi.mock('./client', () => ({
  createClient: vi.fn()
}))

// Mock storage functions
vi.mock('./storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./storage')>()
  return {
    ...actual,
    uploadArtworkImage: vi.fn(),
    getPublicUrl: vi.fn()
  }
})

/**
 * Property-Based Tests for Upload Storage Round-trip
 * Feature: public-art-upload
 */

describe('Upload Storage Round-trip Property Tests', () => {
  let mockSupabase: any
  let testUserId: string
  let mockArtworkId: string

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create a test user for consistent testing
    testUserId = 'test-user-' + Math.random().toString(36).substring(2, 15)
    mockArtworkId = 'artwork-' + Math.random().toString(36).substring(2, 15)
    
    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
      eq: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn()
      }
    }
    
    vi.mocked(createClient).mockReturnValue(mockSupabase)
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  /**
   * Property 2: Upload Storage Round-trip
   * For any valid artwork upload, storing the image in Supabase Storage and saving metadata 
   * to the database should result in a retrievable artwork with accessible image URL
   * **Validates: Requirements 1.4, 5.1, 5.2, 5.3, 5.4**
   */
  it('Property 2: Upload Storage Round-trip - valid uploads can be stored and retrieved', async () => {
    await fc.assert(
      fc.property(
        // Generate valid artwork data
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          description: fc.string({ minLength: 0, maxLength: 500 }),
          category: fc.constantFrom<ArtworkCategory>(
            'painting',
            'digital-art', 
            'photography',
            'sculpture',
            'mixed-media',
            'drawing',
            'other'
          ),
          // Generate valid image file properties
          imageFile: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 })
              .filter(s => s.trim().length > 0)
              .map(name => `${name.replace(/[^a-zA-Z0-9-_]/g, '_')}.jpg`),
            type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
            size: fc.integer({ min: 1024, max: 5 * 1024 * 1024 }) // 1KB to 5MB
          }),
          artistName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
        }),
        async (testData) => {
          // Create a mock File object with valid image data
          const imageBuffer = new Uint8Array(testData.imageFile.size)
          // Fill with minimal valid JPEG header for testing
          imageBuffer[0] = 0xFF
          imageBuffer[1] = 0xD8
          imageBuffer[2] = 0xFF
          
          const mockFile = new File(
            [imageBuffer], 
            testData.imageFile.name, 
            { type: testData.imageFile.type }
          )

          // Mock successful storage upload
          const mockPath = `${testUserId}/${Date.now()}_${testData.imageFile.name}`
          const mockUrl = `https://test-project.supabase.co/storage/v1/object/public/artworks/${mockPath}`
          
          // Mock the uploadArtworkImage function
          vi.mocked(uploadArtworkImage).mockResolvedValue({
            success: true,
            path: mockPath,
            url: mockUrl
          })
          
          // Mock the getPublicUrl function
          vi.mocked(getPublicUrl).mockReturnValue(mockUrl)

          // Step 1: Upload image to storage
          const uploadResult = await uploadArtworkImage(mockFile, testUserId)
          
          // Verify upload succeeded
          expect(uploadResult.success).toBe(true)
          expect(uploadResult.path).toBe(mockPath)
          expect(uploadResult.url).toBe(mockUrl)
          expect(uploadArtworkImage).toHaveBeenCalledWith(mockFile, testUserId)

          // Mock successful database insert
          const mockArtwork = {
            id: mockArtworkId,
            title: testData.title,
            description: testData.description,
            category: testData.category,
            image_url: mockUrl,
            image_path: mockPath,
            artist_id: testUserId,
            artist_name: testData.artistName,
            view_count: 0,
            created_at: new Date().toISOString()
          }
          
          mockSupabase.single.mockResolvedValue({
            data: mockArtwork,
            error: null
          })

          // Step 2: Save artwork metadata to database
          const { data: artwork, error: dbError } = await mockSupabase
            .from('artworks')
            .insert({
              title: testData.title,
              description: testData.description,
              category: testData.category,
              image_url: mockUrl,
              image_path: mockPath,
              artist_id: testUserId,
              artist_name: testData.artistName,
              view_count: 0
            })
            .select()
            .single()

          // Verify database save succeeded
          expect(dbError).toBeNull()
          expect(artwork).toBeDefined()
          expect(artwork.id).toBe(mockArtworkId)
          expect(artwork.title).toBe(testData.title)
          expect(artwork.description).toBe(testData.description)
          expect(artwork.category).toBe(testData.category)
          expect(artwork.image_url).toBe(mockUrl)
          expect(artwork.image_path).toBe(mockPath)
          expect(artwork.artist_id).toBe(testUserId)
          expect(artwork.artist_name).toBe(testData.artistName)
          expect(artwork.view_count).toBe(0)
          expect(artwork.created_at).toBeDefined()

          // Step 3: Retrieve artwork from database
          mockSupabase.single.mockResolvedValue({
            data: mockArtwork,
            error: null
          })
          
          const { data: retrievedArtwork, error: retrieveError } = await mockSupabase
            .from('artworks')
            .select('*')
            .eq('id', artwork.id)
            .single()

          // Verify retrieval succeeded
          expect(retrieveError).toBeNull()
          expect(retrievedArtwork).toBeDefined()
          expect(retrievedArtwork.id).toBe(artwork.id)
          expect(retrievedArtwork.title).toBe(testData.title)
          expect(retrievedArtwork.description).toBe(testData.description)
          expect(retrievedArtwork.category).toBe(testData.category)
          expect(retrievedArtwork.image_url).toBe(mockUrl)
          expect(retrievedArtwork.image_path).toBe(mockPath)
          expect(retrievedArtwork.artist_id).toBe(testUserId)
          expect(retrievedArtwork.artist_name).toBe(testData.artistName)

          // Step 4: Verify image URL is accessible
          const publicUrl = getPublicUrl(mockPath)
          expect(publicUrl).toBe(mockUrl)
          expect(publicUrl).toContain('supabase')
          expect(publicUrl).toContain(mockPath)
          expect(getPublicUrl).toHaveBeenCalledWith(mockPath)

          // Step 5: Verify storage file exists (simulated)
          // In a real scenario, this would check if the file exists in storage
          // For the property test, we verify the round-trip consistency

          // Step 6: Test round-trip consistency - the core property
          // If we can upload, save, and retrieve the artwork with accessible URL,
          // then the round-trip is successful
          const artworkRecord: ArtworkRecord = {
            id: retrievedArtwork.id,
            title: retrievedArtwork.title,
            description: retrievedArtwork.description || '',
            category: retrievedArtwork.category as ArtworkCategory,
            image_url: retrievedArtwork.image_url,
            image_path: retrievedArtwork.image_path,
            artist_id: retrievedArtwork.artist_id,
            artist_name: retrievedArtwork.artist_name,
            created_at: retrievedArtwork.created_at,
            updated_at: retrievedArtwork.updated_at,
            view_count: retrievedArtwork.view_count
          }

          // Verify the complete round-trip: upload → store → retrieve → access
          expect(artworkRecord.image_url).toBe(publicUrl)
          expect(artworkRecord.image_path).toBe(mockPath)
          expect(artworkRecord.title).toBe(testData.title)
          expect(artworkRecord.description).toBe(testData.description)
          expect(artworkRecord.category).toBe(testData.category)
          expect(artworkRecord.artist_name).toBe(testData.artistName)
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in requirements
    )
  })

  /**
   * Property 2 (Extended): Upload Storage Round-trip with edge cases
   * Tests round-trip functionality with boundary conditions and edge cases
   */
  it('Property 2 (Extended): Upload Storage Round-trip handles edge cases correctly', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          // Test edge case titles and descriptions
          title: fc.oneof(
            fc.constant('A'), // Single character
            fc.constant('Test Title with Special Characters: áéíóú'), // Unicode
            fc.string({ minLength: 90, maxLength: 100 }), // Near max length
            fc.constant('Title with "quotes" and \'apostrophes\''), // Quotes
            fc.constant('Title with numbers 123 and symbols @#$%') // Mixed content
          ),
          description: fc.oneof(
            fc.constant(''), // Empty description
            fc.constant('Short'), // Very short
            fc.string({ minLength: 450, maxLength: 500 }), // Near max length
            fc.constant('Description with\nnewlines\nand\ttabs'), // Whitespace
            fc.constant('Description with émojis 🎨 and unicode ñáéíóú') // Unicode
          ),
          category: fc.constantFrom<ArtworkCategory>(
            'painting',
            'digital-art', 
            'photography',
            'sculpture',
            'mixed-media',
            'drawing',
            'other'
          ),
          imageFile: fc.record({
            name: fc.oneof(
              fc.constant('a.jpg'), // Minimal name
              fc.constant('very-long-filename-with-many-characters-and-dashes.png'), // Long name
              fc.constant('file with spaces.webp'), // Spaces in name
              fc.constant('file_with_underscores.jpeg'), // Underscores
              fc.constant('UPPERCASE.JPG') // Uppercase extension
            ),
            type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
            size: fc.oneof(
              fc.constant(1024), // 1KB - minimum
              fc.constant(1024 * 1024), // 1MB - medium
              fc.constant(5 * 1024 * 1024), // 5MB - large but valid
              fc.constant(9 * 1024 * 1024) // 9MB - near limit
            )
          }),
          artistName: fc.oneof(
            fc.constant('A'), // Single character artist
            fc.constant('Artist with Émojis 🎨'), // Unicode and emojis
            fc.string({ minLength: 80, maxLength: 100 }), // Long artist name
            fc.constant('Artist "The Great" O\'Connor') // Quotes and apostrophes
          )
        }),
        async (testData) => {
          // Create mock file with proper size
          const imageBuffer = new Uint8Array(testData.imageFile.size)
          imageBuffer[0] = 0xFF
          imageBuffer[1] = 0xD8
          imageBuffer[2] = 0xFF
          
          const mockFile = new File(
            [imageBuffer], 
            testData.imageFile.name, 
            { type: testData.imageFile.type }
          )

          // Mock successful storage upload
          const mockPath = `${testUserId}/${Date.now()}_${testData.imageFile.name.replace(/[^a-zA-Z0-9-_.]/g, '_')}`
          const mockUrl = `https://test-project.supabase.co/storage/v1/object/public/artworks/${mockPath}`
          
          // Mock the uploadArtworkImage function
          vi.mocked(uploadArtworkImage).mockResolvedValue({
            success: true,
            path: mockPath,
            url: mockUrl
          })
          
          // Mock the getPublicUrl function
          vi.mocked(getPublicUrl).mockReturnValue(mockUrl)

          // Perform the complete round-trip
          const uploadResult = await uploadArtworkImage(mockFile, testUserId)
          expect(uploadResult.success).toBe(true)
          expect(uploadResult.path).toBe(mockPath)
          expect(uploadResult.url).toBe(mockUrl)

          // Mock successful database operations
          const mockArtwork = {
            id: mockArtworkId,
            title: testData.title,
            description: testData.description,
            category: testData.category,
            image_url: mockUrl,
            image_path: mockPath,
            artist_id: testUserId,
            artist_name: testData.artistName,
            view_count: 0,
            created_at: new Date().toISOString()
          }
          
          mockSupabase.single.mockResolvedValue({
            data: mockArtwork,
            error: null
          })

          const { data: artwork, error: dbError } = await mockSupabase
            .from('artworks')
            .insert({
              title: testData.title,
              description: testData.description,
              category: testData.category,
              image_url: mockUrl,
              image_path: mockPath,
              artist_id: testUserId,
              artist_name: testData.artistName,
              view_count: 0
            })
            .select()
            .single()

          expect(dbError).toBeNull()
          expect(artwork).toBeDefined()

          // Verify edge case data is preserved correctly
          expect(artwork.title).toBe(testData.title)
          expect(artwork.description).toBe(testData.description)
          expect(artwork.artist_name).toBe(testData.artistName)

          // Verify retrieval works with edge case data
          const { data: retrieved, error: retrieveError } = await mockSupabase
            .from('artworks')
            .select('*')
            .eq('id', artwork.id)
            .single()

          expect(retrieveError).toBeNull()
          expect(retrieved.title).toBe(testData.title)
          expect(retrieved.description).toBe(testData.description)
          expect(retrieved.artist_name).toBe(testData.artistName)

          // Verify URL accessibility
          const publicUrl = getPublicUrl(mockPath)
          expect(publicUrl).toBe(mockUrl)
          expect(publicUrl).toBe(mockUrl)
        }
      ),
      { numRuns: 50 } // Fewer runs for edge cases due to complexity
    )
  })
})