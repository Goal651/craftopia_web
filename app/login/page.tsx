"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await signIn(email, password)
      if (!response.error && response.data.user) {
        router.push("/")
      } else {
        setError(response.error || "Invalid email or password. Please check your credentials and try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-6 md:space-y-8 bg-card text-card-foreground"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </Link>

        <Card className="glass-strong border-0 shadow-2xl">
          <CardHeader className="space-y-3 md:space-y-4 text-center px-4 md:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="h-14 w-14 md:h-16 md:w-16 gradient-blue rounded-2xl flex items-center justify-center shadow-lg">
                  <Palette className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-2xl md:text-3xl font-light text-white">Welcome Back</CardTitle>
            <CardDescription className="text-base md:text-lg text-gray-400">Sign in to your Art Gallery account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-6 md:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 glass border-0 focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 glass border-0 focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="glass border-red-500/50 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 btn-primary font-semibold rounded-xl shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-400 hover:underline font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
