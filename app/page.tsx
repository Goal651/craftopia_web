"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { ArrowRight, Star, ShoppingCart, Heart, Eye } from "lucide-react"

const featuredArtworks = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "Elena Vasquez",
    price: 2500,
    image: "/placeholder.svg?height=400&width=400&text=Ethereal+Dreams",
    category: "Painting",
    stock: 1,
    featured: true,
  },
  {
    id: "2",
    title: "Digital Harmony",
    artist: "Elena Vasquez",
    price: 1800,
    image: "/placeholder.svg?height=400&width=400&text=Digital+Harmony",
    category: "Digital Art",
    stock: 3,
    featured: true,
  },
  {
    id: "3",
    title: "Sculptural Form",
    artist: "Elena Vasquez",
    price: 3200,
    image: "/placeholder.svg?height=400&width=400&text=Sculptural+Form",
    category: "Sculpture",
    stock: 1,
    featured: true,
  },
]

const categories = [
  {
    name: "Paintings",
    count: 24,
    image: "/placeholder.svg?height=300&width=300&text=Paintings",
    href: "/artworks?category=paintings",
  },
  {
    name: "Digital Art",
    count: 18,
    image: "/placeholder.svg?height=300&width=300&text=Digital+Art",
    href: "/artworks?category=digital",
  },
  {
    name: "Sculptures",
    count: 12,
    image: "/placeholder.svg?height=300&width=300&text=Sculptures",
    href: "/artworks?category=sculptures",
  },
  {
    name: "Photography",
    count: 15,
    image: "/placeholder.svg?height=300&width=300&text=Photography",
    href: "/artworks?category=photography",
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-pastel-rose/5 to-pastel-lavender/5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Badge className="mb-6 bg-gold/20 text-gold border-gold/30">Contemporary Art Collection</Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Elena Vasquez
                <br />
                <span className="text-gold">Artisan Gallery</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover extraordinary contemporary artworks that blend traditional techniques with modern innovation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gradient-gold text-white hover:opacity-90">
                  <Link href="/artworks">
                    Explore Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Art Pieces */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-20 h-20 opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Artworks</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Handpicked masterpieces that showcase Elena's artistic evolution and creative vision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <Image
                      src={artwork.image || "/placeholder.svg"}
                      alt={artwork.title}
                      width={400}
                      height={400}
                      className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-gold text-white">{artwork.category}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold group-hover:text-gold transition-colors">{artwork.title}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="text-sm text-muted-foreground">4.9</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">by {artwork.artist}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gold">${artwork.price.toLocaleString()}</span>
                      <Button onClick={() => addItem(artwork)} className="gradient-gold text-white hover:opacity-90">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/artworks">
                View All Artworks
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Category</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover artworks across different mediums and styles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
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

      {/* Artist Spotlight */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-gold/20 text-gold border-gold/30">Artist Spotlight</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Elena Vasquez</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Elena Vasquez is a contemporary artist whose work explores the intersection of traditional techniques
                and modern digital innovation. With over 15 years of experience, her pieces have been featured in
                galleries worldwide.
              </p>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Her unique approach combines classical painting methods with cutting-edge digital artistry, creating
                pieces that speak to both traditional art lovers and modern collectors.
              </p>
              <Button asChild className="gradient-gold text-white hover:opacity-90">
                <Link href="/about">
                  Learn More About Elena
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=500&text=Elena+Vasquez+Portrait"
                  alt="Elena Vasquez"
                  width={500}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gold/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold to-gold/70 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
