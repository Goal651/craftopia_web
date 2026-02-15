"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LiveVisualSearch } from "@/components/ui/live-visual-search"
import { useArt } from "@/contexts/ArtContext"
import { useAuth } from "@/contexts/AuthContext"
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
  BarChart3,
  Brush,
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isAdmin } = useAuth()
  const { artworks } = useArt()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

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
        setSearchOpen(true)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      router.push(`/artworks?q=${encodeURIComponent(query)}`)
      setSearchOpen(false)
    }
  }

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
            <div className="flex items-center space-x-2 group"
            onClick={()=>router.push('/')}>
              <div className="w-9 h-9 gradient-blue-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gradient-primary">
                CRAFTOPIA
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  onClick={()=>router.push(item.href)}
                  className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {item.name}
                </div>
              ))}
              
              {/* Artist Navigation */}
              {user && (
                <>
                  <div className="w-px h-6 bg-border mx-2" />
                  <div
                    onClick={()=>router.push('/dashboard')}
                    className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${pathname === '/dashboard'
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </div>
                  <div
                    onClick={()=>router.push('/my-artworks')}
                    className={`px-4 cursor-pointer py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${pathname === '/my-artworks'
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Brush className="w-4 h-4" />
                    My Artworks
                  </div>
                </>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11"
                >
                  <div onClick={()=>router.push('/upload')} aria-label="Upload Artwork">
                    <Upload className="w-5 h-5" />
                  </div>
                </Button>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted h-11 w-11"
                      aria-label="User menu"
                    >
                      <div className="w-9 h-9 gradient-blue-green rounded-full flex items-center justify-center border border-white/20 shadow-sm">
                        <User className="w-5 h-5 text-white" />
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
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                      <Link href="/upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Art
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
                  className="btn-primary"
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
                  className="text-gray-400 hover:text-white h-11 w-11"
                >
                  <Link href="/upload">
                    <Upload className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-gray-400 hover:text-white h-11 w-11"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white h-11 w-11"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                <div className="mb-4">
                  <LiveVisualSearch
                    onSearch={(query) => {
                      if (query.trim()) {
                        router.push(`/artworks?q=${encodeURIComponent(query)}`)
                        setIsOpen(false)
                      }
                    }}
                    onClear={() => setSearchQuery("")}
                    placeholder="Search artworks, artists..."
                    artworks={artworks}
                    className="w-full"
                  />
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

                {/* Artist Navigation for Mobile */}
                {user && (
                  <>
                    <div className="border-t border-border my-2" />
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Artist Tools</p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navigation.length * 0.1 }}
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/dashboard'
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navigation.length + 1) * 0.1 }}
                    >
                      <Link
                        href="/my-artworks"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/my-artworks'
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                      >
                        <Brush className="w-4 h-4" />
                        <span className="font-medium">My Artworks</span>
                      </Link>
                    </motion.div>
                  </>
                )}

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
                        className="btn-primary w-full h-11"
                        size="sm"
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

      {/* Global Live Visual Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-strong border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Search Artworks</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <LiveVisualSearch
                  onSearch={handleSearch}
                  onClear={() => setSearchQuery("")}
                  placeholder="Search for artworks, artists, or styles..."
                  artworks={artworks}
                  className="w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
