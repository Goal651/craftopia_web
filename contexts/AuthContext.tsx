"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

import { signInAction, signOutAction, getSessionAction, updateProfileAction } from "@/lib/actions/user.actions"
import { isAdminEmail } from "@/lib/auth-client"
import { User } from "@/types"

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (displayName: string, bio?: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
    return user ? isAdminEmail(user.email) || user.role === "admin" : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
