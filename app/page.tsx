"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GalleryNav } from "@/components/ui/gallery-nav"
import { ArtCard } from "@/components/ui/art-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { LiveVisualSearch } from "@/components/ui/live-visual-search"
import { categoryImages } from "@/lib/generate-images"
import { ArrowRight, Sparkles, TrendingUp, Users, Award, RefreshCw, Zap, Shield, Globe } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"

const stats = [
  { label: "Artworks", value: "500+", icon: Sparkles, color: "from-blue-500 to-cyan-500" },
  { label: "Artists", value: "50+", icon: Users, color: "from-purple-500 to-pink-500" },
  { label: "Collectors", value: "1000+", icon: Award, color: "from-green-500 to-emerald-500" },
  { label: "Growth", value: "25%", icon: TrendingUp, color: "from-orange-500 to-red-500" },
]

const features = [
  {
    icon: Zap,
    title: "Instant Discovery",
    description: "Find your perfect artwork with our intelligent search and filtering system"
  },
  {
    icon: Shield,
    title: "Verified Artists",
    description: "Every artist is carefully vetted to ensure authenticity and quality"
  },
  {
    icon: Globe,
    title: "Global Collection",
    description: "Access artworks from talented creators around the world"
  }
]

export default function HomePage() {
  const { featuredArtworks, loading } = useArt()
  const [categories, setCategories] = useState<{
    name: string;
    count: number;
    image: string;
    href: string;
    color: string;
  }[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Define all categories
      const allCategories = [
        { name: 'painting', displayName: 'Paintings', color: 'from-blue-500 to-blue-600', imageKey: 'Paintings' },
        { name: 'digital-art', displayName: 'Digital Art', color: 'from-green-500 to-green-600', imageKey: 'Digital Art' },
        { name: 'photography', displayName: 'Photography', color: 'from-green-400 to-blue-500', imageKey: 'Photography' },
        { name: 'sculpture', displayName: 'Sculptures', color: 'from-blue-400 to-green-500', imageKey: 'Sculptures' },
        { name: 'mixed-media', displayName: 'Mixed Media', color: 'from-purple-500 to-pink-500', imageKey: 'Mixed Media' },
        { name: 'drawing', displayName: 'Drawing', color: 'from-orange-500 to-red-500', imageKey: 'Abstract Art' },
        { name: 'other', displayName: 'Other', color: 'from-indigo-500 to-purple-600', imageKey: 'Abstract Art' }
      ]

      const res = await fetch('/api/categories')
      const data = await res.json()

      // Create a map of counts from API
      const countsMap = new Map(
        data.categories.map((cat: { name: string, count: number }) => [cat.name, cat.count])
      )

      // Map all categories with their counts (0 if not in API response)
      const mappedCategories = allCategories.map((cat) => ({
        name: cat.displayName,
        count: (countsMap.get(cat.name) as number | undefined) ?? 0,
        image: categoryImages[cat.imageKey as keyof typeof categoryImages] || categoryImages["Abstract Art"],
        href: `/artworks?category=${cat.name}`,
        color: cat.color
      }))

      setCategories(mappedCategories)
    } catch (err) {
      console.error("Failed to fetch categories", err)
      // Set default categories with 0 count on error
      const defaultCategories = [
        { name: 'Paintings', count: 0, image: categoryImages['Paintings'], href: '/artworks?category=painting', color: 'from-blue-500 to-blue-600' },
        { name: 'Digital Art', count: 0, image: categoryImages['Digital Art'], href: '/artworks?category=digital-art', color: 'from-green-500 to-green-600' },
        { name: 'Photography', count: 0, image: categoryImages['Photography'], href: '/artworks?category=photography', color: 'from-green-400 to-blue-500' },
        { name: 'Sculptures', count: 0, image: categoryImages['Sculptures'], href: '/artworks?category=sculpture', color: 'from-blue-400 to-green-500' },
        { name: 'Mixed Media', count: 0, image: categoryImages['Mixed Media'], href: '/artworks?category=mixed-media', color: 'from-purple-500 to-pink-500' },
        { name: 'Drawing', count: 0, image: categoryImages['Abstract Art'], href: '/artworks?category=drawing', color: 'from-orange-500 to-red-500' },
        { name: 'Other', count: 0, image: categoryImages['Abstract Art'], href: '/artworks?category=other', color: 'from-indigo-500 to-purple-600' }
      ]
      setCategories(defaultCategories)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Featured Artworks with Premium Cards */}
      <section className="pb-16 md:pb-24 lg:pb-32 relative z-10 pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 shadow-lg">Featured Collection</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Curated <span className="text-gradient-primary">Masterpieces</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Handpicked artworks that showcase exceptional creativity and artistic vision
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[600px] glass-strong rounded animate-pulse" />
              ))
            ) : featuredArtworks.length > 0 ? (
              featuredArtworks.map((artwork, index) => (
                <ArtCard
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-strong rounded">
                <p className="text-xl text-muted-foreground mb-6">No featured artworks found.</p>
                <Button variant="outline" className="glass-strong" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Collection
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <Button asChild variant="outline" size="lg" className="glass-strong text-lg px-10 py-5 border-2">
              <Link href="/artworks">
                View All Artworks
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories with Enhanced Hover */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 shadow-lg">Explore Categories</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Art <span className="text-gradient-primary">Categories</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Discover artworks across different mediums and styles
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <div className="glass-strong rounded overflow-hidden border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm md:text-base opacity-90">
                        {category.count} {category.count === 1 ? 'artwork' : 'artworks'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-strong rounded p-12 md:p-16 lg:p-20 border border-border/50 shadow-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to Start Your <span className="text-gradient-primary">Art Journey</span>?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 font-light">
                Join thousands of art enthusiasts who have discovered their perfect pieces
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Button asChild size="lg" className="btn-primary text-lg px-10 py-5 shadow-xl">
                  <Link href="/artworks">
                    Browse Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="glass-strong text-lg px-10 py-5 border-2">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
