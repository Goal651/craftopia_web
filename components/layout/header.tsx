"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Palette,
  Search,
  Sun,
  Moon,
  LogOut,
  Settings,
  UserCircle,
  Home,
  ImageIcon,
  Info,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { state } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const pathname = usePathname()

  // Safe calculation of item count with fallback
  const itemCount = state?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/artworks", label: "Collection", icon: ImageIcon },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
          isScrolled ? "glass-effect shadow-lg" : "bg-black/50"
        } hidden md:block`}
      >
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 gradient-blue rounded-full flex items-center justify-center"
              >
                <Palette className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Artisan Gallery
                </h1>
                <p className="text-xs text-gray-400">Elena Vasquez Collection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="relative group">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      pathname === item.href ? "text-blue-400" : "text-white hover:text-blue-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: pathname === item.href ? "100%" : 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-white/10 text-gray-300 hover:text-white"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {/* Search */}
              <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-300 hover:text-white">
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-white/10 text-gray-300 hover:text-white"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {itemCount}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                      <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 glass-effect border-2 border-gray-600">
                    <div className="flex items-center justify-start gap-3 p-3 rounded-lg bg-gray-800/50">
                      <div className="h-10 w-10 gradient-blue rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs mt-1 bg-gray-700 text-gray-300">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-600" />
                    <DropdownMenuItem asChild className="cursor-pointer text-gray-300 hover:text-white">
                      <Link href="/profile">
                        <UserCircle className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <>
                        <DropdownMenuItem asChild className="cursor-pointer text-gray-300 hover:text-white">
                          <Link href="/admin">
                            <Settings className="mr-3 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-600" />
                      </>
                    )}
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:text-red-300">
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="gradient-blue text-white hover:opacity-90 transition-opacity">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
          isScrolled ? "glass-effect shadow-lg" : "bg-black/50"
        } md:hidden`}
      >
        <div className="px-4 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-blue rounded-full flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Artisan</span>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative touch-target text-gray-300 hover:text-white">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 min-w-[16px] h-4 flex items-center justify-center">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="touch-target text-gray-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-effect border-t border-gray-600 w-full"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors touch-target ${
                          pathname === item.href ? "bg-blue-500/20 text-blue-400" : "text-white hover:bg-white/10"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* User Section */}
                <div className="pt-4 border-t border-gray-600">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                        <div className="w-10 h-10 gradient-blue rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors touch-target text-gray-300 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>

                      {isAdmin() && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors touch-target text-gray-300 hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-red-400 hover:text-red-300 w-full touch-target"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full gradient-blue text-white mobile-button">Sign In</Button>
                    </Link>
                  )}
                </div>

                {/* Theme Toggle */}
                <div className="pt-4 border-t border-gray-600">
                  <Button
                    variant="ghost"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start gap-3 touch-target text-gray-300 hover:text-white"
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
