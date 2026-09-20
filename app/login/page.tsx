"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Palette } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await signIn(email, password)
      if (!response.error && response.data.user) {
        router.push("/my-artworks")
      } else {
        setError(response.error || "Invalid email or password.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12 lg:py-20">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 group-hover:bg-accent transition-colors">
            <ArrowLeft className="h-3 w-3" />
          </span>
          <span className="font-medium tracking-wide uppercase text-xs">Back to Gallery</span>
        </Link>

        <Card className="shadow-md">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="h-11 w-11 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to manage your artworks and orders
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="btn-primary w-full h-11 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Accounts are for gallery artists. Want to sell your art here?{" "}
              <Link href="/contact" className="text-secondary font-medium hover:underline">
                Contact us
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
