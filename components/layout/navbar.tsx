"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CommandPalette } from "@/components/ui/command-palette"
import { useAuth } from "@/contexts/auth-context"
import {
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  Palette,
  Home,
  ImageIcon,
  Info,
  Mail,
  Upload,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Curated", href: "/artworks", icon: ImageIcon },
  { name: "Gallery", href: "/gallery", icon: Palette },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isAdmin } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 gradient-blue-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gradient-primary">
                CRAFTOPIA
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandPaletteOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Link href="/upload" aria-label="Upload Artwork">
                    <Upload className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 gradient-blue-green rounded-full flex items-center justify-center border border-white/20 shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-strong border-border">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-white">{user.display_name || user.email}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Link href="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-800"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  asChild
                  variant="vibrant"
                  size="sm"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-2">
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-gray-400 hover:text-white"
                >
                  <Link href="/upload">
                    <Upload className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-400 hover:text-white"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Input
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-muted border-border pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>

                {/* Mobile Navigation Links */}
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile User Section */}
                <div className="pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-foreground">{user.display_name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      {isAdmin() && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-2">
                      <Button
                        asChild
                        variant="vibrant"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  )
}
