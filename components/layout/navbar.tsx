"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import {
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  Home,
  Info,
  Mail,
  Palette,
  Sun,
  Moon,
  Brush,
  ShoppingBag,
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
  { name: "Gallery", href: "/artworks", icon: Palette },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isAdmin } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/artworks?search=${encodeURIComponent(q)}`)
      setSearchQuery("")
      setIsOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-display text-xl font-semibold tracking-tight text-foreground">
              CRAFT<span className="text-secondary">OPIA</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <span
                    className="absolute inset-x-4 -bottom-[13px] h-0.5 rounded-full bg-secondary"
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}

            {user && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Link
                  href="/my-artworks"
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                    pathname === "/my-artworks"
                      ? "text-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  My Studio
                  {pathname === "/my-artworks" && (
                    <span
                      className="absolute inset-x-4 -bottom-[13px] h-0.5 rounded-full bg-secondary"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 xl:w-56 h-9 pl-9 text-sm"
                aria-label="Search artworks"
              />
            </form>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    aria-label="User menu"
                  >
                    <span className="w-7 h-7 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                      {(user.display_name || user.email).charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden xl:inline text-sm">{(user.display_name || user.email).split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground truncate">{user.display_name || user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/my-artworks" className="flex items-center w-full">
                      <Brush className="w-4 h-4 mr-2" />
                      My Studio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/upload" className="flex items-center w-full">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Upload Art
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="btn-primary h-9">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-10 w-10 text-muted-foreground hover:text-foreground"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu backdrop */}
      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="relative z-50 lg:hidden border-t border-border bg-background shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search artworks"
              />
            </form>

            {/* Mobile Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded px-4 py-3 text-base transition-colors ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            {user && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/my-artworks"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 rounded px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Brush className="w-5 h-5" />
                  <span className="font-medium">My Studio</span>
                </Link>
                <Link
                  href="/upload"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 rounded px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">Upload Art</span>
                </Link>
              </>
            )}

            {/* Mobile User Section */}
            <div className="pt-3 border-t border-border">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-sm font-medium text-foreground">{user.display_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 rounded px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  {isAdmin() && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 rounded px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-3 rounded px-4 py-3 text-base text-destructive hover:bg-destructive/10 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1">
                  <Button asChild className="btn-primary w-full h-10" onClick={() => setIsOpen(false)}>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
