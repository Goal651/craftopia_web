"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { GalleryNav } from "@/components/ui/gallery-nav"
import { getArtworkImage, categoryImages } from "@/lib/generate-images"
import { ArrowRight, Star, Heart, Eye, Sparkles, TrendingUp, Users, Award, Mail, Loader2, RefreshCw } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"

// Categories state managed inside component


const stats = [
  { label: "Artworks", value: "500+", icon: Sparkles },
  { label: "Artists", value: "50+", icon: Users },
  { label: "Collectors", value: "1000+", icon: Award },
  { label: "Growth", value: "25%", icon: TrendingUp },
]

export default function HomePage() {

  const [mounted, setMounted] = useState(false)
  const { featuredArtworks, loading } = useArt()
  const [categories, setCategories] = useState<{
    name: string;
    count: number;
    image: string;
    href: string;
    color: string;
  }[]>([])

  // Generate stable particle positions to avoid hydration errors
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: (i * 8.33 + (i % 3) * 5) % 100,
      top: (i * 7.5 + (i % 4) * 10) % 100,
      width: 16 + (i % 5) * 6,
      height: 16 + ((i + 2) % 5) * 6,
      xOffset: (i % 3) * 7 - 10,
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()

      const mappedCategories = data.categories.map((cat: { name: string, count: number }) => {
        let displayName = "Abstract Art"
        let color = "from-blue-500 to-blue-600"
        let imageKey = "Abstract Art"

        switch (cat.name) {
          case 'painting':
            displayName = "Paintings"
            color = "from-blue-500 to-blue-600"
            imageKey = "Paintings"
            break
          case 'digital-art':
            displayName = "Digital Art"
            color = "from-green-500 to-green-600"
            imageKey = "Digital Art"
            break
          case 'sculpture':
            displayName = "Sculptures"
            color = "from-blue-400 to-green-500"
            imageKey = "Sculptures"
            break
          case 'photography':
            displayName = "Photography"
            color = "from-green-400 to-blue-500"
            imageKey = "Photography"
            break
          case 'mixed-media':
            displayName = "Mixed Media"
            color = "from-purple-500 to-pink-500"
            imageKey = "Mixed Media"
            break
          default:
            displayName = cat.name.charAt(0).toUpperCase() + cat.name.slice(1).replace('-', ' ')
            color = "from-indigo-500 to-purple-600"
            imageKey = "Abstract Art"
        }

        return {
          name: displayName,
          count: cat.count,
          image: categoryImages[imageKey as keyof typeof categoryImages] || categoryImages["Abstract Art"],
          href: `/artworks?category=${cat.name}`,
          color: color
        }
      })

      setCategories(mappedCategories)
    } catch (err) {
      console.error("Failed to fetch categories", err)
      // Fallback or static if failed? keeping empty for now
    }
  }

  const handleContactOwner = (artworkTitle: string, artist: string) => {
    window.location.href = `/contact?artwork=${encodeURIComponent(artworkTitle)}&artist=${encodeURIComponent(artist)}`
  }

  return (
    <div className="min-h-screen px-10">
      {/* Hero Section with Glassmorphic Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl float-delayed" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl float" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge className="mb-6 glass px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Contemporary Art Collection
              </Badge>

              <h1 className="text-5xl md:text-7xl lg:text-9xl text-hero mb-8">
                <span className="block">Discover</span>
                <span className="block text-gradient-primary relative">
                  Extraordinary
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full blur-xl animate-pulse" />
                </span>
                <span className="block text-foreground">Art</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Explore a curated collection of contemporary masterpieces from talented artists around the world. Find
                the perfect piece to transform your space.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <MagneticButton asChild size="lg" className="btn-primary glow-primary text-lg px-8 py-4">
                  <Link href="/artworks">
                    Explore Gallery
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </MagneticButton>

                <MagneticButton asChild variant="outline" size="lg" className="glass-enhanced text-lg px-8 py-4 bg-transparent">
                  <Link href="/about">Learn More</Link>
                </MagneticButton>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="glass-card rounded-2xl p-6 text-center border border-border/10">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute opacity-20"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, particle.xOffset, 0],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 20 + particle.id * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: particle.id * 0.5,
              }}
            >
              <div
                className={`w-full h-full bg-gradient-to-br particle-float ${particle.id % 3 === 0
                  ? "from-primary/40 to-primary/20"
                  : particle.id % 3 === 1
                    ? "from-secondary/40 to-secondary/20"
                    : "from-primary/30 to-secondary/30"
                  } rounded-xl blur-sm`}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Navigation Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 glass px-4 py-2">Explore Our Galleries</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your <span className="text-gradient-primary">Art Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover curated masterpieces or explore community-driven creativity
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <GalleryNav />
          </motion.div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20 lg:py-32">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 glass px-4 py-2">Featured Collection</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Curated <span className="text-gradient-primary">Masterpieces</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Handpicked artworks that showcase exceptional creativity and artistic vision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-96 glass rounded-3xl animate-pulse" />
              ))
            ) : featuredArtworks.length > 0 ? (
              featuredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group h-52"
                >
                  <Card className="glass-enhanced rounded-2xl overflow-hidden border-0 card-hover text-md"
                  >
                    <div className="relative overflow-hidden">
                      <ArtworkImage
                        src={artwork.image_url}
                        alt={artwork.title}
                        title={artwork.title}
                        category={artwork.category}
                       fill
                        className="w-full h-72 transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" className="glass w-10 h-10 hover:bg-white/20" aria-label="Add to wishlist">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button size="icon" className="glass w-10 h-10 hover:bg-white/20" aria-label="Quick view">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Category Badge */}
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-green-500 text-white border-0">
                        {artwork.category}
                      </Badge>

                      {/* Rating (Simulated if missing) */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1 glass px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Star className="w-4 h-4 fill-green-400 text-green-400" />
                        <span className="text-sm font-medium text-white">{(4.5 + (artwork.view_count % 5) / 10).toFixed(1)}</span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
                            {artwork.title}
                          </h3>
                          <p className="text-muted-foreground">by {artwork.artist_name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{artwork.view_count}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gradient-primary">
                          Gallery Piece
                        </span>

                        <Button
                          onClick={() => handleContactOwner(artwork.title, artwork.artist_name)}
                          className="btn-primary"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Artist
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-3xl">
                <p className="text-xl text-muted-foreground">No featured artworks found.</p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Collection
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <MagneticButton asChild variant="outline" size="lg" className="glass-enhanced text-lg px-8 py-4 bg-transparent">
              <Link href="/artworks">
                View All Artworks
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 lg:py-32 ">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 glass px-4 py-2">Explore Categories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Art <span className="text-gradient-primary">Categories</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover artworks across different mediums and styles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={category.href}>
                  <Card className="glass-card rounded-3xl overflow-hidden border-0 card-hover group">
                    <div className="relative overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                        <p className="text-sm opacity-90">{category.count} artworks</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center rounded-3xl p-12 lg:p-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="text-gradient-primary">Art Journey</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of art enthusiasts who have discovered their perfect pieces through our gallery
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="btn-primary text-lg px-8 py-4">
                <Link href="/artworks">
                  Browse Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glass text-lg px-8 py-4 bg-transparent">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
