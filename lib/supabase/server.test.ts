import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the @supabase/ssr module
const mockCreateServerClient = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient
}))

// Mock Next.js cookies
const mockCookies = vi.fn()
vi.mock('next/headers', () => ({
  cookies: mockCookies
}))

// Mock the Database type import
vi.mock('../../types/supabase', () => ({
  Database: {}
}))

describe('Supabase Server Client Setup', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateServerClient.mockClear()
    mockCookies.mockClear()
    // Reset environment variables
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Server Client Initialization', () => {
    it('should create a server client with correct environment variables and cookie configuration', async () => {
      // Arrange
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([
          { name: 'sb-access-token', value: 'token123' },
          { name: 'sb-refresh-token', value: 'refresh123' }
        ]),
        set: vi.fn()
      }

      mockCookies.mockResolvedValue(mockCookieStore)

      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateServerClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      const client = await createClient()

      // Assert
      expect(mockCookies).toHaveBeenCalled()
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function)
          })
        })
      )
      expect(client).toBeDefined()
      expect(client).toHaveProperty('auth')
      expect(client).toHaveProperty('storage')
      expect(client).toHaveProperty('from')
    })

    it('should handle cookie operations correctly', async () => {
      // Arrange
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn()
      }

      mockCookies.mockResolvedValue(mockCookieStore)

      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateServerClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      await createClient()

      // Get the cookies configuration from the mock call
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies

      // Test getAll function
      const allCookies = cookiesConfig.getAll()
      expect(mockCookieStore.getAll).toHaveBeenCalled()
      expect(allCookies).toEqual([])

      // Test setAll function
      const testCookies = [
        { name: 'test-cookie', value: 'test-value', options: { httpOnly: true } }
      ]
      cookiesConfig.setAll(testCookies)
      expect(mockCookieStore.set).toHaveBeenCalledWith('test-cookie', 'test-value', { httpOnly: true })
    })

    it('should handle setAll errors gracefully when called from Server Component', async () => {
      // Arrange
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn().mockImplementation(() => {
          throw new Error('Cannot set cookies in Server Component')
        })
      }

      mockCookies.mockResolvedValue(mockCookieStore)

      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateServerClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      await createClient()

      // Get the cookies configuration from the mock call
      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies

      // Test setAll function with error - should not throw
      const testCookies = [
        { name: 'test-cookie', value: 'test-value', options: { httpOnly: true } }
      ]
      
      // Assert - should not throw error
      expect(() => cookiesConfig.setAll(testCookies)).not.toThrow()
    })
  })

  describe('Environment Variable Usage', () => {
    it('should use environment variables from process.env', async () => {
      // Arrange
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn()
      }

      mockCookies.mockResolvedValue(mockCookieStore)

      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateServerClient.mockReturnValue(mockClient)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom-project.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key'

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      const client = await createClient()

      // Assert
      expect(client).toBeDefined()
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://custom-project.supabase.co',
        'custom-anon-key',
        expect.any(Object)
      )
    })
  })

  describe('Server Client Configuration', () => {
    it('should return client with expected interface', async () => {
      // Arrange
      const mockClient = {
        auth: {
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn(),
          getUser: vi.fn()
        },
        storage: {
          from: vi.fn()
        },
        from: vi.fn()
      }

      mockCookies.mockResolvedValue({
        getAll: vi.fn(),
        set: vi.fn()
      })

      mockCreateServerClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      const client = await createClient()

      // Assert
      expect(client).toEqual(mockClient)
      expect(client.auth).toBeDefined()
      expect(client.storage).toBeDefined()
      expect(client.from).toBeDefined()
    })

    it('should create new client instance on each call', async () => {
      // Arrange
      mockCookies.mockResolvedValue({
        getAll: vi.fn(),
        set: vi.fn()
      })

      mockCreateServerClient
        .mockReturnValueOnce({ id: 'server-client1' })
        .mockReturnValueOnce({ id: 'server-client2' })

      // Import after setting up mocks
      const { createClient } = await import('./server')

      // Act
      const client1 = await createClient()
      const client2 = await createClient()

      // Assert
      expect(mockCreateServerClient).toHaveBeenCalledTimes(2)
      expect(client1).not.toBe(client2)
    })

    it('should pass environment variables to createServerClient correctly', async () => {
      // Arrange
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn()
      }

      mockCookies.mockResolvedValue(mockCookieStore)

      const mockClient = { auth: {}, storage: {}, from: vi.fn() }
      mockCreateServerClient.mockReturnValue(mockClient)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-env.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-env-key'

      // Import after setting up environment
      const { createClient } = await import('./server')

      // Act
      await createClient()

      // Assert
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test-env.supabase.co',
        'test-env-key',
        expect.any(Object)
      )
    })
  })
})