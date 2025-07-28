"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/types"
import { sampleUsers } from "@/lib/data"

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  })

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("artful-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setState({ user, isLoading: false })
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        setState({ user: null, isLoading: false })
      }
    } else {
      setState({ user: null, isLoading: false })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple authentication - in production, this would be handled by your backend
    const user = sampleUsers.find((u) => u.email === email)

    if (user && password === "password123") {
      setState({ user, isLoading: false })
      localStorage.setItem("artful-user", JSON.stringify(user))
      return true
    }

    return false
  }

  const logout = () => {
    setState({ user: null, isLoading: false })
    localStorage.removeItem("artful-user")
  }

  const isAdmin = () => {
    return state.user?.role === "admin"
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
