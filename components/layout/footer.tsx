"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Palette, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Heart, ArrowRight, Send } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    gallery: [
      { label: "Collection", href: "/artworks" },
      { label: "Featured Artists", href: "/artists" },
      { label: "Exhibitions", href: "/exhibitions" },
      { label: "New Arrivals", href: "/new" },
    ],
    about: [
      { label: "About Elena", href: "/about" },
      { label: "Artist Statement", href: "/statement" },
      { label: "Press", href: "/press" },
      { label: "Awards", href: "/awards" },
    ],
    support: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Authenticity", href: "/authenticity" },
    ],
  }

  return (
    <footer className="bg-gradient-to-t from-muted/50 to-background border-t border-border">
      <div className="container mx-auto mobile-padding">
        {/* Newsletter Section */}
        <div className="py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-6 max-w-2xl mx-auto"
          >
            <div className="space-y-2">
              <h3 className="text-2xl lg:text-3xl font-light text-foreground">
                Stay Connected with <span className="text-gradient-primary">CRAFTOPIA</span>
              </h3>
              <p className="text-muted-foreground">
                Get exclusive access to new artworks, behind-the-scenes content, and special exhibitions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button className="btn-primary glow-primary">
                <Send className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">No spam, unsubscribe at any time. We respect your privacy.</p>
          </motion.div>
        </div>

        <Separator />

        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 gradient-blue-green rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Palette className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-gradient-primary">
                    CRAFTOPIA
                  </h3>
                  <p className="text-sm text-muted-foreground">Digital Art & Collectibles</p>
                </div>
              </Link>

              <p className="text-muted-foreground leading-relaxed max-w-md">
                Discover extraordinary contemporary artworks that blend traditional techniques with modern vision. Each
                piece tells a unique story of emotion, color, and form.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">hello@craftopia.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">+1 (555) 000-1234</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">San Francisco, CA</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                  <Twitter className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Gallery Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Gallery</h4>
              <ul className="space-y-3">
                {footerLinks.gallery.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm group flex items-center"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">About</h4>
              <ul className="space-y-3">
                {footerLinks.about.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm group flex items-center"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm group flex items-center"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; {currentYear} Artisan Gallery. All rights reserved.</p>
              <div className="flex items-center gap-4">
                {footerLinks.legal.map((link, index) => (
                  <span key={link.href} className="flex items-center gap-4">
                    <Link href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                    {index < footerLinks.legal.length - 1 && <span className="text-muted-foreground/50">•</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for art lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
