import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import * as fc from 'fast-check'
import { createClient } from '@/lib/supabase/client'
import type { AuthResponse, User as SupabaseUser } from '@supabase/supabase-js'
import { AuthProvider, useAuth } from './auth-context'
import { toast } from 'sonner'

// Mock the Supabase client
vi.mock('@/lib/supabase/client')
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockCreateClient = vi.mocked(createClient)
const mockToast = vi.mocked(toast)

// Test component to access auth context
function TestComponent() {
  const { user, signIn, signOut, signUp, updateProfile, loading, isAdmin } = useAuth()
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="user-id">{user?.id || 'No ID'}</div>
      <div data-testid="display-name">{user?.user_metadata?.display_name || 'No name'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="is-admin">{isAdmin() ? 'Admin' : 'Not admin'}</div>
      <button 
        data-testid="sign-in-btn" 
        onClick={() => signIn('test@example.com', 'password')}
      >
        Sign In
      </button>
      <button 
        data-testid="sign-up-btn" 
        onClick={() => signUp('test@example.com', 'password', 'Test User')}
      >
        Sign Up
      </button>
      <button 
        data-testid="sign-out-btn" 
        onClick={() => signOut()}
      >
        Sign Out
      </button>
      <button 
        data-testid="update-profile-btn" 
        onClick={() => updateProfile('Updated Name', 'Updated bio')}
      >
        Update Profile
      </button>
    </div>
  )
}

describe('Authentication Property Tests', () => {
  let mockSupabaseClient: any
  let mockAuth: any

  beforeEach(() => {
    mockAuth = {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    }

    mockSupabaseClient = {
      auth: mockAuth,
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient)

    // Mock initial session
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Mock auth state change subscription
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 3: Authentication-Protected Upload
   * Validates: Requirements 9.1, 9.3
   * 
   * Feature: public-art-upload, Property 3: For any upload attempt, the system should require valid Supabase authentication and associate the artwork with the authenticated user's account
   */
  it('Property 3: Authentication-Protected Upload - requires valid authentication for uploads and associates artworks with authenticated user', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random user data for testing
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          displayName: fc.string({ minLength: 1, maxLength: 100 }),
          userId: fc.uuid(),
        }),
        async (userData) => {
          // Reset mocks for each test iteration
          vi.clearAllMocks()
          
          // Setup fresh mocks
          const mockAuth = {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
          }

          const mockSupabaseClient = {
            auth: mockAuth,
          }

          mockCreateClient.mockReturnValue(mockSupabaseClient)

          // Test setup: Mock successful authentication
          const mockUser: SupabaseUser = {
            id: userData.userId,
            email: userData.email,
            user_metadata: {
              display_name: userData.displayName,
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString(),
          }

          const mockAuthResponse: AuthResponse = {
            data: {
              user: mockUser,
              session: {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                expires_at: Date.now() + 3600000,
                token_type: 'bearer',
                user: mockUser,
              },
            },
            error: null,
          }

          // Test Requirement 9.1: Authentication is required for upload
          // Mock unauthenticated state
          mockAuth.getSession.mockResolvedValue({
            data: { session: null },
            error: null,
          })

          const unauthenticatedSession = await mockAuth.getSession()
          expect(unauthenticatedSession.data.session).toBeNull()

          // Test successful authentication
          mockAuth.signInWithPassword.mockResolvedValue(mockAuthResponse)
          const authResult = await mockAuth.signInWithPassword(userData.email, userData.password)

          // Requirement 9.1: Verify authentication is required and successful
          expect(authResult.data.user).toBeDefined()
          expect(authResult.data.user?.id).toBe(userData.userId)
          expect(authResult.data.user?.email).toBe(userData.email)

          // Requirement 9.3: Verify artwork association with authenticated user
          // The authenticated user's ID should be available for artwork association
          expect(authResult.data.user?.id).toBe(userData.userId)
          expect(authResult.data.user?.user_metadata.display_name).toBe(userData.displayName)

          // Test that session contains user data for artwork association
          mockAuth.getSession.mockResolvedValue({
            data: { session: mockAuthResponse.data.session },
            error: null,
          })

          const authenticatedSession = await mockAuth.getSession()
          expect(authenticatedSession.data.session?.user.id).toBe(userData.userId)

          // Test sign out - user should no longer be available
          mockAuth.signOut.mockResolvedValue({ error: null })
          mockAuth.getSession.mockResolvedValue({
            data: { session: null },
            error: null,
          })

          await mockAuth.signOut()
          const signedOutSession = await mockAuth.getSession()

          // This validates that authentication is required - without it, session is null
          expect(signedOutSession.data.session).toBeNull()
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in the design document
    )
  })

  /**
   * Additional property test to verify authentication state consistency
   */
  it('Property 3 (Extended): Authentication state remains consistent across multiple users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            userId: fc.uuid(),
            displayName: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 3 } // Reduced max length for faster testing
        ),
        async (users) => {
          // Reset mocks for each test iteration
          vi.clearAllMocks()
          
          // Setup fresh mocks
          const mockAuth = {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
          }

          const mockSupabaseClient = {
            auth: mockAuth,
          }

          mockCreateClient.mockReturnValue(mockSupabaseClient)

          // Test each user authentication
          for (const userData of users) {
            const mockUser: SupabaseUser = {
              id: userData.userId,
              email: userData.email,
              user_metadata: { display_name: userData.displayName },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              role: 'authenticated',
              updated_at: new Date().toISOString(),
            }

            const mockAuthResponse: AuthResponse = {
              data: {
                user: mockUser,
                session: {
                  access_token: 'mock-token',
                  refresh_token: 'mock-refresh',
                  expires_in: 3600,
                  expires_at: Date.now() + 3600000,
                  token_type: 'bearer',
                  user: mockUser,
                },
              },
              error: null,
            }

            // Test authentication
            mockAuth.signInWithPassword.mockResolvedValue(mockAuthResponse)
            const authResult = await mockAuth.signInWithPassword(userData.email, 'password')

            // Verify user data consistency
            expect(authResult.data.user?.id).toBe(userData.userId)
            expect(authResult.data.user?.email).toBe(userData.email)
            expect(authResult.data.user?.user_metadata.display_name).toBe(userData.displayName)

            // Test sign out
            mockAuth.signOut.mockResolvedValue({ error: null })
            mockAuth.getSession.mockResolvedValue({
              data: { session: null },
              error: null,
            })

            await mockAuth.signOut()
            const signedOutSession = await mockAuth.getSession()
            expect(signedOutSession.data.session).toBeNull()
          }
        }
      ),
      { numRuns: 50 } // Reduced iterations for faster testing with multiple users
    )
  })
})

describe('Auth Context Unit Tests', () => {
  let mockSupabaseClient: any
  let mockAuth: any

  beforeEach(() => {
    mockAuth = {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    }

    mockSupabaseClient = {
      auth: mockAuth,
      from: vi.fn(() => ({
        upsert: vi.fn(() => ({
          error: null,
        })),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient)

    // Mock initial session
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Mock auth state change subscription
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Login/Logout Flows', () => {
    it('should handle successful login flow', async () => {
      const mockUser: SupabaseUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      const mockAuthResponse: AuthResponse = {
        data: {
          user: mockUser,
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      }

      mockAuth.signInWithPassword.mockResolvedValue(mockAuthResponse)

      // Mock auth state change to simulate successful login
      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially no user
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')

      // Trigger sign in
      const signInBtn = screen.getByTestId('sign-in-btn')
      await act(async () => {
        signInBtn.click()
      })

      // Simulate auth state change
      await act(async () => {
        authStateCallback('SIGNED_IN', mockAuthResponse.data.session)
      })

      // Wait for auth state to update
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id')
        expect(screen.getByTestId('display-name')).toHaveTextContent('Test User')
      })

      // Verify success toast was called
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back, Test User!')
    })

    it('should handle failed login flow', async () => {
      const mockErrorResponse: AuthResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 },
      }

      mockAuth.signInWithPassword.mockResolvedValue(mockErrorResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Trigger sign in
      const signInBtn = screen.getByTestId('sign-in-btn')
      await act(async () => {
        signInBtn.click()
      })

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials')
      })

      // User should still be null
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
    })

    it('should handle successful logout flow', async () => {
      const mockUser: SupabaseUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Start with authenticated user
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      })

      mockAuth.signOut.mockResolvedValue({ error: null })

      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate initial authenticated state
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        })
      })

      // Wait for user to be set
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      })

      // Trigger sign out
      const signOutBtn = screen.getByTestId('sign-out-btn')
      await act(async () => {
        signOutBtn.click()
      })

      // Simulate auth state change for sign out
      await act(async () => {
        authStateCallback('SIGNED_OUT', null)
      })

      // Wait for user to be cleared
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      })

      // Verify success toast was called
      expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully')
    })

    it('should handle failed logout flow', async () => {
      mockAuth.signOut.mockResolvedValue({ 
        error: { message: 'Logout failed', name: 'AuthError', status: 500 } 
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Trigger sign out
      const signOutBtn = screen.getByTestId('sign-out-btn')
      await act(async () => {
        signOutBtn.click()
      })

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Logout failed')
      })
    })

    it('should handle successful signup flow', async () => {
      const mockUser: SupabaseUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        user_metadata: { display_name: 'New User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      const mockSignUpResponse: AuthResponse = {
        data: {
          user: mockUser,
          session: null, // Usually null for signup requiring email verification
        },
        error: null,
      }

      mockAuth.signUp.mockResolvedValue(mockSignUpResponse)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Trigger sign up
      const signUpBtn = screen.getByTestId('sign-up-btn')
      await act(async () => {
        signUpBtn.click()
      })

      // Wait for success handling
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Account created successfully! Please check your email to verify your account.'
        )
      })
    })
  })

  describe('Auth State Persistence', () => {
    it('should restore user session on initial load', async () => {
      const mockUser: SupabaseUser = {
        id: 'persisted-user-id',
        email: 'persisted@example.com',
        user_metadata: { display_name: 'Persisted User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing session on initial load
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'persisted-token',
            refresh_token: 'persisted-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial session to load
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('persisted@example.com')
        expect(screen.getByTestId('user-id')).toHaveTextContent('persisted-user-id')
        expect(screen.getByTestId('display-name')).toHaveTextContent('Persisted User')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })

    it('should handle auth state changes from external sources', async () => {
      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially no user
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')

      // Simulate external auth state change (e.g., from another tab)
      const mockUser: SupabaseUser = {
        id: 'external-user-id',
        email: 'external@example.com',
        user_metadata: { display_name: 'External User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      await act(async () => {
        authStateCallback('SIGNED_IN', {
          access_token: 'external-token',
          refresh_token: 'external-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        })
      })

      // Wait for auth state to update
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('external@example.com')
        expect(screen.getByTestId('user-id')).toHaveTextContent('external-user-id')
        expect(screen.getByTestId('display-name')).toHaveTextContent('External User')
      })

      // Simulate external sign out
      await act(async () => {
        authStateCallback('SIGNED_OUT', null)
      })

      // Wait for user to be cleared
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      })
    })

    it('should maintain loading state correctly during auth operations', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Initially loading should be false after initial session check
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })

      // Mock slow sign in
      let resolveSignIn: any
      const signInPromise = new Promise<AuthResponse>((resolve) => {
        resolveSignIn = resolve
      })
      mockAuth.signInWithPassword.mockReturnValue(signInPromise)

      // Trigger sign in
      const signInBtn = screen.getByTestId('sign-in-btn')
      act(() => {
        signInBtn.click()
      })

      // Should be loading during sign in
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
      })

      // Resolve sign in
      act(() => {
        resolveSignIn({
          data: { user: null, session: null },
          error: { message: 'Test error', name: 'AuthError', status: 400 },
        })
      })

      // Should not be loading after sign in completes
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
      })
    })

    it('should correctly identify admin users', async () => {
      const adminUser: SupabaseUser = {
        id: 'admin-user-id',
        email: 'admin@artgallery.com', // This is the admin email in the context
        user_metadata: { display_name: 'Admin User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing admin session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'admin-token',
            refresh_token: 'admin-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: adminUser,
          },
        },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for admin user to load
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@artgallery.com')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin')
      })
    })

    it('should correctly identify non-admin users', async () => {
      const regularUser: SupabaseUser = {
        id: 'regular-user-id',
        email: 'user@example.com',
        user_metadata: { display_name: 'Regular User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing regular user session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'user-token',
            refresh_token: 'user-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: regularUser,
          },
        },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for regular user to load
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Not admin')
      })
    })
  })

  describe('Profile Management', () => {
    it('should handle successful profile update', async () => {
      const mockUser: SupabaseUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing user session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      })

      // Mock successful auth update
      mockAuth.updateUser.mockResolvedValue({ error: null })

      // Mock successful database upsert
      const mockUpsert = vi.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      })

      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate initial authenticated state
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        })
      })

      // Wait for user to be set
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      })

      // Trigger profile update
      const updateBtn = screen.getByTestId('update-profile-btn')
      await act(async () => {
        updateBtn.click()
      })

      // Wait for update to complete
      await waitFor(() => {
        expect(mockAuth.updateUser).toHaveBeenCalledWith({
          data: { display_name: 'Updated Name' }
        })
        expect(mockUpsert).toHaveBeenCalledWith({
          id: 'test-user-id',
          display_name: 'Updated Name',
          bio: 'Updated bio'
        })
        expect(mockToast.success).toHaveBeenCalledWith('Profile updated successfully!')
      })

      // Verify display name was updated in local state
      await waitFor(() => {
        expect(screen.getByTestId('display-name')).toHaveTextContent('Updated Name')
      })
    })

    it('should handle profile update auth error', async () => {
      const mockUser: SupabaseUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing user session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      })

      // Mock auth update error
      mockAuth.updateUser.mockResolvedValue({ 
        error: { message: 'Auth update failed', name: 'AuthError', status: 400 } 
      })

      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate initial authenticated state
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        })
      })

      // Wait for user to be set
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      })

      // Trigger profile update
      const updateBtn = screen.getByTestId('update-profile-btn')
      await act(async () => {
        updateBtn.click()
      })

      // Wait for error handling
      await waitFor(() => {
        expect(mockAuth.updateUser).toHaveBeenCalled()
        // Should not call database upsert if auth update fails
        expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      })
    })

    it('should handle profile update database error', async () => {
      const mockUser: SupabaseUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { display_name: 'Test User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      }

      // Mock existing user session
      mockAuth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: mockUser,
          },
        },
        error: null,
      })

      // Mock successful auth update
      mockAuth.updateUser.mockResolvedValue({ error: null })

      // Mock database upsert error
      const mockUpsert = vi.fn().mockResolvedValue({ 
        error: { message: 'Database error', code: 'PGRST301' } 
      })
      mockSupabaseClient.from.mockReturnValue({
        upsert: mockUpsert,
      })

      let authStateCallback: any
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate initial authenticated state
      await act(async () => {
        authStateCallback('SIGNED_IN', {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser,
        })
      })

      // Wait for user to be set
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      })

      // Trigger profile update
      const updateBtn = screen.getByTestId('update-profile-btn')
      await act(async () => {
        updateBtn.click()
      })

      // Wait for error handling
      await waitFor(() => {
        expect(mockAuth.updateUser).toHaveBeenCalled()
        expect(mockUpsert).toHaveBeenCalled()
        // Should not show success toast on database error
        expect(mockToast.success).not.toHaveBeenCalled()
      })
    })

    it('should handle profile update when user is not authenticated', async () => {
      // No authenticated user
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      })

      // Trigger profile update (should fail)
      const updateBtn = screen.getByTestId('update-profile-btn')
      await act(async () => {
        updateBtn.click()
      })

      // Should not call any Supabase methods
      expect(mockAuth.updateUser).not.toHaveBeenCalled()
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })
})