"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid email or password. Please check your credentials and try again.")
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
      email: "admin@artisangallery.com",
      password: "password123",
      description: "Full access to admin dashboard and gallery management",
      icon: Shield,
      gradient: "from-gold/20 to-pastel-peach/20",
    },
    {
      type: "Customer Access",
      email: "customer@example.com",
      password: "password123",
      description: "Browse collection, add to cart, and make purchases",
      icon: Users,
      gradient: "from-pastel-lavender/20 to-pastel-mint/20",
    },
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-pastel-rose/10 to-pastel-lavender/10 dark:via-pastel-rose/5 dark:to-pastel-lavender/5">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Gallery
          </Link>

          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="h-16 w-16 gradient-gold rounded-2xl flex items-center justify-center shadow-lg">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-light text-charcoal dark:text-white">Welcome Back</CardTitle>
              <CardDescription className="text-lg">
                Sign in to your Artisan Gallery account to continue your art journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl transition-all duration-300"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 gradient-gold text-white hover:opacity-90 transition-opacity font-semibold rounded-xl shadow-lg hover:shadow-xl"
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
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-card px-2 text-muted-foreground">Demo Credentials</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {demoCredentials.map((cred, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className={`p-4 bg-gradient-to-r ${cred.gradient} dark:from-opacity-10 dark:to-opacity-10 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => {
                        setEmail(cred.email)
                        setPassword(cred.password)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                          <cred.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-medium text-charcoal dark:text-white">{cred.type}</div>
                            <Badge variant="outline" className="text-xs">
                              Demo
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{cred.description}</div>
                          <div className="text-xs font-mono bg-white/50 dark:bg-card/50 rounded px-2 py-1">
                            {cred.email}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-gold hover:underline font-medium">
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side - Artwork Showcase */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-charcoal via-charcoal/90 to-charcoal">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="grid grid-cols-2 gap-4 p-8 h-full">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative h-64 rounded-2xl overflow-hidden group"
              >
                <Image
                  src="/images/login-art-1.jpg"
                  alt="Featured artwork"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative h-48 rounded-2xl overflow-hidden group"
              >
                <Image
                  src="/images/login-art-2.jpg"
                  alt="Featured artwork"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </motion.div>
            </div>
            <div className="space-y-4 pt-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="relative h-48 rounded-2xl overflow-hidden group"
              >
                <Image
                  src="/images/login-art-3.jpg"
                  alt="Featured artwork"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="relative h-64 rounded-2xl overflow-hidden group"
              >
                <Image
                  src="/images/login-art-4.jpg"
                  alt="Featured artwork"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center text-white space-y-6 max-w-md"
          >
            <h2 className="text-4xl font-light">Discover Amazing Art</h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Join our community of art lovers and discover extraordinary pieces from Elena Vasquez's contemporary
              collection.
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gold">50+</div>
                <div className="text-sm opacity-75">Artworks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gold">200+</div>
                <div className="text-sm opacity-75">Collectors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gold">15+</div>
                <div className="text-sm opacity-75">Awards</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
