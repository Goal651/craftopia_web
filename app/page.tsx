import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sampleArtworks } from "@/lib/data"
import { ArrowRight, Star, Users, Palette } from "lucide-react"

export default function HomePage() {
  const featuredArtworks = sampleArtworks.filter((artwork) => artwork.featured).slice(0, 4)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  New Collection Available
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Discover
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {" "}
                    Extraordinary{" "}
                  </span>
                  Artworks
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Explore a curated collection of paintings, digital art, sculptures, and photography from talented
                  artists worldwide.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/artworks">
                    Browse Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/artists">Meet the Artists</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Artworks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-muted-foreground">Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Image
                    src="/images/hero-art-1.png"
                    alt="Featured artwork"
                    width={250}
                    height={300}
                    className="rounded-lg object-cover w-full"
                  />
                  <Image
                    src="/images/hero-art-2.png"
                    alt="Featured artwork"
                    width={250}
                    height={200}
                    className="rounded-lg object-cover w-full"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <Image
                    src="/images/hero-art-3.png"
                    alt="Featured artwork"
                    width={250}
                    height={200}
                    className="rounded-lg object-cover w-full"
                  />
                  <Image
                    src="/images/hero-art-4.png"
                    alt="Featured artwork"
                    width={250}
                    height={300}
                    className="rounded-lg object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="container">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Featured Artworks</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked masterpieces from our most talented artists, showcasing the diversity and beauty of
              contemporary art.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArtworks.map((artwork) => (
              <Card key={artwork.id} className="group overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={artwork.images[0] || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {artwork.category}
                    </Badge>
                    <h3 className="font-semibold line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">${artwork.price.toLocaleString()}</span>
                      <Button size="sm" asChild>
                        <Link href={`/artworks/${artwork.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/artworks">
                View All Artworks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Browse by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore different art forms and find the perfect piece that speaks to you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Paintings",
                  count: "150+",
                  image: "/images/category-paintings.png",
                  href: "/categories/painting",
                },
                {
                  name: "Digital Art",
                  count: "80+",
                  image: "/images/category-digital.png",
                  href: "/categories/digital",
                },
                {
                  name: "Sculptures",
                  count: "45+",
                  image: "/images/category-sculptures.png",
                  href: "/categories/sculpture",
                },
                {
                  name: "Photography",
                  count: "120+",
                  image: "/images/category-photography.png",
                  href: "/categories/photography",
                },
              ].map((category) => (
                <Link key={category.name} href={category.href}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-xl font-bold">{category.name}</h3>
                          <p className="text-sm opacity-90">{category.count} artworks</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Why Choose Artful?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to connecting art lovers with exceptional pieces while supporting artists worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Curated Collection</h3>
              <p className="text-muted-foreground">
                Every artwork is carefully selected by our team of art experts to ensure quality and authenticity.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Support Artists</h3>
              <p className="text-muted-foreground">
                We believe in fair compensation for artists and provide them with a platform to showcase their talent.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Premium Experience</h3>
              <p className="text-muted-foreground">
                From browsing to delivery, we ensure a seamless and delightful experience for every customer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
