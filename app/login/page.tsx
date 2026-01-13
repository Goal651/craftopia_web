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
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Palette, Shield, Users } from "lucide-react"

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
        setError(response.error?.message || "Invalid email or password. Please check your credentials and try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const demoCredentials = [
    {
      type: "Admin Access",
      email: "admin@artgallery.com",
      password: "password123",
      description: "Full access to admin dashboard and gallery management",
      icon: Shield,
      gradient: "gradient-blue",
    },
    {
      type: "Customer Access",
      email: "user@example.com",
      password: "password123",
      description: "Browse collection, add to cart, and make purchases",
      icon: Users,
      gradient: "gradient-grey",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center container-padding bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8"
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
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="h-16 w-16 gradient-blue rounded-2xl flex items-center justify-center shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-light text-white">Welcome Back</CardTitle>
            <CardDescription className="text-lg text-gray-400">Sign in to your Art Gallery account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="glass px-2 text-gray-400">Demo Credentials</span>
                </div>
              </div>

              <div className="space-y-3">
                {demoCredentials.map((cred, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="glass-card p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      setEmail(cred.email)
                      setPassword(cred.password)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 ${cred.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <cred.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-medium text-white">{cred.type}</div>
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            Demo
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">{cred.description}</div>
                        <div className="text-xs font-mono glass rounded px-2 py-1 text-gray-300">{cred.email}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-400 hover:underline font-medium">
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
