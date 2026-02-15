"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"


import { signInAction, signUpAction, signOutAction, getSessionAction, updateProfileAction } from "@/lib/actions/user.actions"

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
    // Initializing auth state by checking the session cookie via server action
    const initAuth = async () => {
      try {
        const sessionUser = await getSessionAction()
        if (sessionUser) {
          setUser(sessionUser)
        }
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
    try {
      const result = await signUpAction(email, password, displayName)
      if (result.success) {
        setUser(result.user)
        toast.success("Account created successfully!")
        return { data: { user: result.user }, error: null }
      } else {
        toast.error(result.error)
        return { data: { user: null }, error: result.error }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      return { data: { user: null }, error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<any> => {
    setLoading(true)
    try {
      const result = await signInAction(email, password)
      if (result.success) {
        setUser(result.user)
        toast.success("Welcome back!")
        return { data: { user: result.user }, error: null }
      } else {
        toast.error(result.error)
        return { data: { user: null }, error: result.error }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      return { data: { user: null }, error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      await signOutAction()
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Failed to log out")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (displayName: string, bio?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }
    setLoading(true)
    try {
      const result = await updateProfileAction(displayName, bio)
      if (result.success) {
        setUser(result.user)
        toast.success("Profile updated successfully!")
        return { success: true }
      } else {
        toast.error(result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error("Failed to update profile")
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = (): boolean => {
    const adminEmails = ["admin@artgallery.com", "admin@craftopia.com", "bugiriwilson651@gmail.com"]
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
