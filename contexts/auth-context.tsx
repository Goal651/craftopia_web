"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser, AuthResponse } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  user_metadata: {
    display_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  updateProfile: (displayName: string, bio?: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        })
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
    setLoading(true)
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })

    if (response.error) {
      toast.error(response.error.message)
    } else if (response.data.user) {
      toast.success("Account created successfully! Please check your email to verify your account.")
    }

    setLoading(false)
    return response
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (response.error) {
      toast.error(response.error.message)
    } else if (response.data.user) {
      const displayName = response.data.user.user_metadata?.display_name || response.data.user.email
      toast.success(`Welcome back, ${displayName}!`)
    }

    setLoading(false)
    return response
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Logged out successfully")
    }
    
    setLoading(false)
  }

  const updateProfile = async (displayName: string, bio?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    setLoading(true)
    
    try {
      // Update user metadata (display_name) in auth.users
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName
        }
      })

      if (authError) {
        setLoading(false)
        return { success: false, error: authError.message }
      }

      // Update or insert user profile in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          bio: bio || null
        })

      if (profileError) {
        setLoading(false)
        return { success: false, error: profileError.message }
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        user_metadata: {
          ...prev.user_metadata,
          display_name: displayName
        }
      } : null)

      setLoading(false)
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      setLoading(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      return { success: false, error: errorMessage }
    }
  }

  const isAdmin = (): boolean => {
    // For now, we'll check if the user email is an admin email
    // This can be enhanced later with proper role management
    const adminEmails = ["admin@artgallery.com"]
    return user ? adminEmails.includes(user.email) : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signOut,
        updateProfile,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
