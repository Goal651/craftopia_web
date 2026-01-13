import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the @supabase/ssr module
const mockCreateBrowserClient = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient
}))

// Mock the Database type import
vi.mock('../../types/supabase', () => ({
  Database: {}
}))

describe('Supabase Client Setup', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateBrowserClient.mockClear()
    // Reset environment variables
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Client Initialization', () => {
    it('should create a browser client with correct environment variables', async () => {
      // Arrange
      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateBrowserClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./client')

      // Act
      const client = createClient()

      // Assert
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test-project.supabase.co',
        'test-anon-key'
      )
      expect(client).toBeDefined()
      expect(client).toHaveProperty('auth')
      expect(client).toHaveProperty('storage')
      expect(client).toHaveProperty('from')
    })

    it('should create client with Database type parameter', async () => {
      // Arrange
      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateBrowserClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./client')

      // Act
      createClient()

      // Assert
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1)
      // Verify the function was called with the correct parameters
      const callArgs = mockCreateBrowserClient.mock.calls[0]
      expect(callArgs[0]).toBe('https://test-project.supabase.co')
      expect(callArgs[1]).toBe('test-anon-key')
    })
  })

  describe('Environment Variable Usage', () => {
    it('should use environment variables from process.env', async () => {
      // Arrange
      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateBrowserClient.mockReturnValue(mockClient)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom-project.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key'

      // Import after setting up environment
      const { createClient } = await import('./client')

      // Act
      createClient()

      // Assert
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://custom-project.supabase.co',
        'custom-anon-key'
      )
    })

    it('should accept valid environment variables with different formats', async () => {
      // Arrange
      const mockClient = {
        auth: {},
        storage: {},
        from: vi.fn()
      }
      
      mockCreateBrowserClient.mockReturnValue(mockClient)

      const testCases = [
        {
          url: 'https://abc123.supabase.co',
          key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
        },
        {
          url: 'https://project-name.supabase.co',
          key: 'sb-project-auth-token'
        }
      ]

      // Import after setting up mocks
      const { createClient } = await import('./client')

      for (const { url, key } of testCases) {
        // Arrange
        process.env.NEXT_PUBLIC_SUPABASE_URL = url
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key

        // Act
        const client = createClient()

        // Assert
        expect(client).toBeDefined()
        expect(mockCreateBrowserClient).toHaveBeenCalledWith(url, key)
      }
    })
  })

  describe('Client Configuration', () => {
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

      mockCreateBrowserClient.mockReturnValue(mockClient)

      // Import after setting up mocks
      const { createClient } = await import('./client')

      // Act
      const client = createClient()

      // Assert
      expect(client).toEqual(mockClient)
      expect(client.auth).toBeDefined()
      expect(client.storage).toBeDefined()
      expect(client.from).toBeDefined()
    })

    it('should create new client instance on each call', async () => {
      // Arrange
      mockCreateBrowserClient
        .mockReturnValueOnce({ id: 'client1' })
        .mockReturnValueOnce({ id: 'client2' })

      // Import after setting up mocks
      const { createClient } = await import('./client')

      // Act
      const client1 = createClient()
      const client2 = createClient()

      // Assert
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(2)
      expect(client1).not.toBe(client2)
    })

    it('should pass environment variables to createBrowserClient correctly', async () => {
      // Arrange
      const mockClient = { auth: {}, storage: {}, from: vi.fn() }
      mockCreateBrowserClient.mockReturnValue(mockClient)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-env.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-env-key'

      // Import after setting up environment
      const { createClient } = await import('./client')

      // Act
      createClient()

      // Assert
      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        'https://test-env.supabase.co',
        'test-env-key'
      )
    })
  })
})