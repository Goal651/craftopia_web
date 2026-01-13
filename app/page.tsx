"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { Card3D } from "@/components/ui/card-3d"
import { ArtworkImage } from "@/components/ui/artwork-image"
import { GalleryNav } from "@/components/ui/gallery-nav"
import { useCart } from "@/contexts/cart-context"
import { getArtworkImage, categoryImages } from "@/lib/generate-images"
import { ArrowRight, Star, ShoppingCart, Heart, Eye, Sparkles, TrendingUp, Users, Award } from "lucide-react"

const featuredArtworks = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "Elena Vasquez",
    price: 2500,
    image: getArtworkImage("1", "Abstract"),
    category: "Abstract",
    stock: 1,
    featured: true,
    rating: 4.9,
    likes: 234,
  },
  {
    id: "2",
    title: "Digital Harmony",
    artist: "Elena Vasquez",
    price: 1800,
    image: getArtworkImage("2", "Digital Art"),
    category: "Digital Art",
    stock: 3,
    featured: true,
    rating: 4.8,
    likes: 189,
  },
  {
    id: "3",
    title: "Sculptural Form",
    artist: "Elena Vasquez",
    price: 3200,
    image: getArtworkImage("3", "Sculpture"),
    category: "Sculpture",
    stock: 1,
    featured: true,
    rating: 5.0,
    likes: 312,
  },
  {
    id: "4",
    title: "Ocean Depths",
    artist: "Elena Vasquez",
    price: 2200,
    image: getArtworkImage("4", "Painting"),
    category: "Painting",
    stock: 2,
    featured: true,
    rating: 4.7,
    likes: 156,
  },
  {
    id: "5",
    title: "Urban Reflections",
    artist: "Elena Vasquez",
    price: 1950,
    image: getArtworkImage("5", "Photography"),
    category: "Photography",
    stock: 5,
    featured: true,
    rating: 4.6,
    likes: 98,
  },
  {
    id: "6",
    title: "Cosmic Journey",
    artist: "Elena Vasquez",
    price: 2800,
    image: getArtworkImage("6", "Mixed Media"),
    category: "Mixed Media",
    stock: 1,
    featured: true,
    rating: 4.9,
    likes: 267,
  },
]

const categories = [
  {
    name: "Abstract Art",
    count: 24,
    image: categoryImages["Abstract Art"],
    href: "/artworks?category=abstract",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Digital Art",
    count: 18,
    image: categoryImages["Digital Art"],
    href: "/artworks?category=digital",
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Sculptures",
    count: 12,
    image: categoryImages["Sculptures"],
    href: "/artworks?category=sculptures",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Photography",
    count: 15,
    image: categoryImages["Photography"],
    href: "/artworks?category=photography",
    color: "from-orange-500 to-red-600",
  },
]

const stats = [
  { label: "Artworks", value: "500+", icon: Sparkles },
  { label: "Artists", value: "50+", icon: Users },
  { label: "Collectors", value: "1000+", icon: Award },
  { label: "Growth", value: "25%", icon: TrendingUp },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { addItem, isInCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Glassmorphic Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl float-delayed" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl float" />
        </div>

        <div className="container-padding relative z-10">
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
                <span className="block text-gradient-blue relative">
                  Extraordinary
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                </span>
                <span className="block text-gradient-grey">Art</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Explore a curated collection of contemporary masterpieces from talented artists around the world. Find
                the perfect piece to transform your space.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <MagneticButton asChild size="lg" className="btn-primary glow-blue text-lg px-8 py-4">
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
                <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-violet-500" />
                  <div className="text-2xl md:text-3xl font-bold text-gradient-violet mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${16 + Math.random() * 32}px`,
                height: `${16 + Math.random() * 32}px`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 20 - 10, 0],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 20 + i * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            >
              <div
                className={`w-full h-full bg-gradient-to-br particle-float ${
                  i % 3 === 0 
                    ? "from-blue-500/40 to-blue-600/40" 
                    : i % 3 === 1
                    ? "from-gray-400/40 to-gray-600/40"
                    : "from-blue-300/40 to-gray-500/40"
                } rounded-xl blur-sm`}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Navigation Section */}
      <section className="py-16 lg:py-24">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 glass px-4 py-2">Explore Our Galleries</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your <span className="text-gradient-blue">Art Journey</span>
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
              Curated <span className="text-gradient-violet">Masterpieces</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Handpicked artworks that showcase exceptional creativity and artistic vision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card3D className="glass-enhanced rounded-3xl overflow-hidden border-0 card-hover">
                  <div className="relative overflow-hidden">
                    <ArtworkImage
                      src={artwork.image}
                      alt={artwork.title}
                      title={artwork.title}
                      category={artwork.category}
                      width={400}
                      height={320}
                      className="w-full h-80 transition-transform duration-700 group-hover:scale-110"
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
                    <Badge className="absolute top-4 left-4 gradient-violet text-white border-0">
                      {artwork.category}
                    </Badge>

                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 glass px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-white">{artwork.rating}</span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-violet-600 transition-colors">
                          {artwork.title}
                        </h3>
                        <p className="text-muted-foreground">by {artwork.artist}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{artwork.likes}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gradient-violet">${artwork.price.toLocaleString()}</span>

                      <Button
                        onClick={() =>
                          addItem({
                            id: artwork.id,
                            title: artwork.title,
                            artist: artwork.artist,
                            price: artwork.price,
                            image: artwork.image,
                            stock: artwork.stock,
                          })
                        }
                        disabled={isInCart(artwork.id)}
                        className={isInCart(artwork.id) ? "btn-secondary" : "btn-primary"}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart(artwork.id) ? "In Cart" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card3D>
              </motion.div>
            ))}
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
      <section className="py-20 lg:py-32 bg-gradient-to-b from-transparent to-violet-500/5">
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
              Art <span className="text-gradient-aqua">Categories</span>
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
            className="text-center glass-strong rounded-3xl p-12 lg:p-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="text-gradient-violet">Art Journey</span>?
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
