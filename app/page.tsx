"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArtCard } from "@/components/ui/art-card"
import { categoryImages } from "@/lib/generate-images"
import { ArrowRight, RefreshCw } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"



export default function HomePage() {
  const { featuredArtworks, loading } = useArt()
  const [categories, setCategories] = useState<{
    name: string;
    count: number;
    image: string;
    href: string;
    color: string;
  }[]>([])

  // SEO: Generate structured data
  const generateStructuredData = () => {
    const baseUrl = 'https://craftopia-arts.vercel.app'
    
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "CRAFTOPIA - Premium Art Gallery",
      "description": "Discover extraordinary contemporary artworks from talented artists. Browse paintings, digital art, photography, sculptures and more in our curated online gallery.",
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/artworks?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Featured Artworks",
        "description": "Handpicked collection of exceptional artworks",
        "numberOfItems": featuredArtworks.length,
        "itemListElement": featuredArtworks.map((artwork, index) => ({
          "@type": "VisualArtwork",
          "position": index + 1,
          "name": "Artwork",
          "creator": {
            "@type": "Person",
            "name": artwork.artist_name
          },
          "image": artwork.image_url,
          "url": `${baseUrl}/artworks/${artwork.id}`,
          "offers": {
            "@type": "Offer",
            "price": artwork.price,
            "priceCurrency": "RWF",
            "availability": artwork.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }))
      }
    }
  }

  const structuredData = generateStructuredData()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      // Define all categories
      const allCategories = [
        { name: 'painting', displayName: 'Paintings', color: 'from-primary/40 to-primary/60', imageKey: 'Paintings' },
        { name: 'digital-art', displayName: 'Digital Art', color: 'from-secondary/40 to-secondary/60', imageKey: 'Digital Art' },
        { name: 'photography', displayName: 'Photography', color: 'from-accent/40 to-accent/60', imageKey: 'Photography' },
        { name: 'sculpture', displayName: 'Sculptures', color: 'from-primary/30 to-secondary/50', imageKey: 'Sculptures' },
        { name: 'mixed-media', displayName: 'Mixed Media', color: 'from-secondary/30 to-accent/50', imageKey: 'Mixed Media' },
        { name: 'drawing', displayName: 'Drawing', color: 'from-accent/30 to-primary/50', imageKey: 'Abstract Art' },
        { name: 'other', displayName: 'Other', color: 'from-primary/20 to-accent/40', imageKey: 'Abstract Art' }
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
        { name: 'Paintings', count: 0, image: categoryImages['Paintings'], href: '/artworks?category=painting', color: 'from-primary/40 to-primary/60' },
        { name: 'Digital Art', count: 0, image: categoryImages['Digital Art'], href: '/artworks?category=digital-art', color: 'from-secondary/40 to-secondary/60' },
        { name: 'Photography', count: 0, image: categoryImages['Photography'], href: '/artworks?category=photography', color: 'from-accent/40 to-accent/60' },
        { name: 'Sculptures', count: 0, image: categoryImages['Sculptures'], href: '/artworks?category=sculpture', color: 'from-primary/30 to-secondary/50' },
        { name: 'Mixed Media', count: 0, image: categoryImages['Mixed Media'], href: '/artworks?category=mixed-media', color: 'from-secondary/30 to-accent/50' },
        { name: 'Drawing', count: 0, image: categoryImages['Abstract Art'], href: '/artworks?category=drawing', color: 'from-accent/30 to-primary/50' },
        { name: 'Other', count: 0, image: categoryImages['Abstract Art'], href: '/artworks?category=other', color: 'from-primary/20 to-accent/40' }
      ]
      setCategories(defaultCategories)
    }
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>CRAFTOPIA - Premium Art Gallery | Contemporary Artworks for Sale</title>
        <meta name="description" content="Discover extraordinary contemporary artworks from talented artists. Browse paintings, digital art, photography, sculptures and more in our curated online gallery." />
        <meta name="keywords" content="art gallery, contemporary art, paintings, digital art, photography, sculptures, online gallery, artworks for sale, rwandan art, craftopia" />
        <meta name="author" content="CRAFTOPIA" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://craftopia-arts.vercel.app" />
        <meta property="og:title" content="CRAFTOPIA - Premium Art Gallery | Contemporary Artworks for Sale" />
        <meta property="og:description" content="Discover extraordinary contemporary artworks from talented artists. Browse paintings, digital art, photography, sculptures and more in our curated online gallery." />
        <meta property="og:image" content="https://craftopia-arts.vercel.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="CRAFTOPIA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://craftopia-arts.vercel.app" />
        <meta property="twitter:title" content="CRAFTOPIA - Premium Art Gallery" />
        <meta property="twitter:description" content="Discover extraordinary contemporary artworks from talented artists." />
        <meta property="twitter:image" content="https://craftopia-arts.vercel.app/og-image.jpg" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://craftopia-arts.vercel.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      <div className="min-h-screen">
      {/* Featured Artworks with Premium Cards */}
      <section className="pb-16 md:pb-24 lg:pb-32 relative z-10 pt-4" aria-labelledby="featured-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 shadow-lg" aria-label="Featured collection">Featured Collection</Badge>
            <h2 id="featured-heading" className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
              Curated <span className="text-gradient-primary">Masterpieces</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Handpicked artworks that showcase exceptional creativity and artistic vision from our talented artists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" role="list" aria-label="Featured artworks">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-[600px] glass-strong rounded animate-pulse" role="status" aria-label="Loading artwork" />
              ))
            ) : featuredArtworks.length > 0 ? (
              featuredArtworks.map((artwork, index) => (
                <div key={artwork.id} role="listitem">
                  <ArtCard
                    artwork={artwork}
                    index={index}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-strong rounded" role="status">
                <p className="text-xl text-muted-foreground mb-6">No featured artworks found.</p>
                <Button variant="outline" className="glass-strong" onClick={() => window.location.reload()} aria-label="Reload featured artworks collection">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Collection
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <Button asChild variant="outline" size="lg" className="glass-strong text-lg px-10 py-5 border-2" aria-label="Browse all available artworks">
              <Link href="/artworks">
                View All Artworks
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories with Enhanced Hover
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-6 md:mb-8 glass-strong px-6 py-3 shadow-lg">Explore Categories</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
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
                      <h3 className="text-2xl md:text-3xl font-semibold mb-2">{category.name}</h3>
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
      </section> */}

      {/* Premium CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-strong rounded p-12 md:p-16 lg:p-20 border border-border/50 shadow-2xl">
              <h2 id="cta-heading" className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                Ready to Start Your <span className="text-gradient-primary">Art Journey</span>?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 font-light">
                Join thousands of art enthusiasts who have discovered their perfect pieces in our curated gallery
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Button asChild size="lg" className="btn-primary text-lg px-10 py-5 shadow-xl" aria-label="Browse our complete art collection">
                  <Link href="/artworks">
                    Browse Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="glass-strong text-lg px-10 py-5 border-2" aria-label="Contact us for inquiries">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
