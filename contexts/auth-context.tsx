"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved user in localStorage
    try {
      const savedUser = localStorage.getItem("artisan-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - replace with real API call
    if (email === "admin@artisan.com" && password === "admin123") {
      const adminUser: User = {
        id: "1",
        name: "Admin User",
        email: "admin@artisan.com",
        role: "admin",
      }
      setUser(adminUser)
      localStorage.setItem("artisan-user", JSON.stringify(adminUser))
      return true
    } else if (email === "user@artisan.com" && password === "user123") {
      const regularUser: User = {
        id: "2",
        name: "Regular User",
        email: "user@artisan.com",
        role: "user",
      }
      setUser(regularUser)
      localStorage.setItem("artisan-user", JSON.stringify(regularUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("artisan-user")
  }

  const isAdmin = () => {
    return user?.role === "admin"
  }

  return <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
