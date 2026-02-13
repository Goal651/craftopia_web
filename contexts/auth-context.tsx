"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

interface AuthUser {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  signUp: (email: string, password: string, displayName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (displayName: string, bio?: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initializing auth state - this would typically involve a fetch to an API route
    const initAuth = async () => {
      try {
        // const res = await fetch('/api/auth/me')
        // const data = await res.json()
        // setUser(data.user)
      } catch (error) {
        console.error("Auth init failed", error)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const signUp = async (email: string, password: string, displayName: string): Promise<any> => {
    setLoading(true)
    // Placeholder for implementation
    toast.info("Sign up will be available soon with MongoDB implementation.")
    setLoading(false)
    return { data: { user: null }, error: null }
  }

  const signIn = async (email: string, password: string): Promise<any> => {
    setLoading(true)
    // Placeholder for implementation
    toast.info("Sign in will be available soon with MongoDB implementation.")
    setLoading(false)
    return { data: { user: null }, error: null }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    // Placeholder for implementation
    setUser(null)
    toast.success("Logged out successfully")
    setLoading(false)
  }

  const updateProfile = async (displayName: string, bio?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }
    setLoading(true)
    // Placeholder for implementation
    toast.success("Profile updated successfully (local)!")
    setLoading(false)
    return { success: true }
  }

  const isAdmin = (): boolean => {
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
