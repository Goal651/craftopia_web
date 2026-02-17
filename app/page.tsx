"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GalleryNav } from "@/components/ui/gallery-nav"
import { PremiumArtCard } from "@/components/ui/premium-art-card"
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
      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed top-0 left-0 inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Mesh Gradient Orbs - Simplified */}
        <div className="fixed top-0 left-0 inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10 pt-20">
          <div className="text-center max-w-6xl mx-auto">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 text-sm md:text-base font-medium shadow-xl">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Contemporary Art Collection
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 md:mb-8 leading-[1.1] tracking-tight">
              <span className="block">Discover</span>
              <span className="block text-gradient-primary">Extraordinary</span>
              <span className="block">Art</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Explore a curated collection of contemporary masterpieces from talented artists around the world
            </p>

            {/* Live Visual Search in Hero */}
            <div className="max-w-2xl mx-auto mb-10 md:mb-12">
              <LiveVisualSearch
                onSearch={(query) => {
                  // Navigate to artworks page with search query
                  window.location.href = `/artworks?q=${encodeURIComponent(query)}`
                }}
                placeholder="Search for artworks, artists, or styles..."
                artworks={featuredArtworks}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 mb-12 md:mb-16">
              <Button asChild size="lg" className="btn-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 w-full sm:w-auto shadow-xl">
                <Link href="/artworks">
                  Explore Gallery
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="glass-strong text-base md:text-lg px-8 md:px-10 py-4 md:py-5 w-full sm:w-auto border-2">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="relative group">
                  <div className="glass-strong rounded-2xl md:rounded-3xl p-6 md:p-8 text-center border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} p-0.5`}>
                        <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                          <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                        </div>
                      </div>
                      <AnimatedCounter
                        value={stat.value}
                        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary mb-2"
                      />
                      <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Navigation Section */}
      <section className="py-16 md:py-24 lg:py-32 z-10 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 shadow-lg">Explore Our Galleries</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Choose Your <span className="text-gradient-primary">Art Journey</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Browse our professionally curated collection or explore community-driven creativity
            </p>
          </div>

          <GalleryNav />
        </div>
      </section>

      {/* Featured Artworks with Premium Cards */}
      <section className="py-16 md:py-24 lg:py-32 relative z-10">
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
                <div key={i} className="h-[600px] glass-strong rounded-3xl animate-pulse" />
              ))
            ) : featuredArtworks.length > 0 ? (
              featuredArtworks.map((artwork, index) => (
                <PremiumArtCard
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-strong rounded-3xl">
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
                <div className="glass-strong rounded-3xl overflow-hidden border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
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
            <div className="glass-strong rounded-3xl p-12 md:p-16 lg:p-20 border border-border/50 shadow-2xl">
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
