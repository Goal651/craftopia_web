"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArtCard } from "@/components/ui/art-card"
import { ArrowRight, ShoppingBag, Truck, ImageIcon } from "lucide-react"
import { useArt } from "@/contexts/ArtContext"
import { SITE } from "@/lib/auth-client"

const CATEGORY_LINKS = [
  { name: "painting", label: "Paintings" },
  { name: "drawing", label: "Drawings" },
  { name: "digital-art", label: "Digital Art" },
  { name: "photography", label: "Photography" },
  { name: "sculpture", label: "Sculpture" },
  { name: "mixed-media", label: "Mixed Media" },
]

const STEPS = [
  {
    icon: ImageIcon,
    title: "Choose",
    description: "Browse original artworks by Rwandan artists — paintings, drawings, sculpture and more.",
  },
  {
    icon: ShoppingBag,
    title: "Order",
    description: "Pick a piece you love, fill in your name, phone and delivery address. That's it.",
  },
  {
    icon: Truck,
    title: "We deliver",
    description: "The artist contacts you to arrange payment and brings the piece to your door.",
  },
]

export default function HomePage() {
  const { featuredArtworks, loading } = useArt()
  const [categories, setCategories] = useState<{ name: string; label: string; count: number }[]>([])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const counts: Record<string, number> = {}
        for (const cat of data.categories || []) counts[cat.name] = cat.count
        setCategories(
          CATEGORY_LINKS.map((c) => ({
            ...c,
            count: counts[c.name] || counts[`${c.name}s`] || 0,
          })).filter((c) => c.count > 0)
        )
      })
      .catch(() => setCategories([]))
  }, [])

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Soft pigment-wash color fields */}
        <div className="hero-field hero-field-terracotta w-[520px] h-[520px] -top-40 -left-32" aria-hidden="true" />
        <div className="hero-field hero-field-sand w-[420px] h-[420px] top-10 right-[-120px]" aria-hidden="true" />
        <div className="hero-field hero-field-olive w-[380px] h-[380px] bottom-[-160px] left-1/3" aria-hidden="true" />

        {/* Floating mini-frames framing the headline */}
        <div
          aria-hidden="true"
          className="hidden lg:block frame-mat rounded-lg absolute left-[6%] top-24 w-28 rotate-[-8deg] opacity-80 pointer-events-none"
        >
          <div className="aspect-[4/5] rounded bg-gradient-to-br from-secondary/25 via-accent to-muted" />
        </div>
        <div
          aria-hidden="true"
          className="hidden lg:block frame-mat rounded-lg absolute right-[7%] bottom-16 w-24 rotate-[7deg] opacity-80 pointer-events-none"
        >
          <div className="aspect-[4/5] rounded bg-gradient-to-br from-accent via-secondary/20 to-muted" />
        </div>

        <div className="relative container mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              {SITE.tagline}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]">
              Art with a story,
              <br />
              made in <span className="text-secondary italic">Rwanda</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto text-balance">
              A curated gallery of original works by local artists. Find a piece you love,
              order it in a minute, and we deliver it to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button asChild size="lg" className="btn-primary h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Link href="/artworks">
                  Browse the collection
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-border bg-card/60 backdrop-blur-sm">
                <Link href="/about">Our story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/60" aria-label="How it works">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex items-start gap-4">
                <span className="ghost-numeral" aria-hidden="true">{i + 1}</span>
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="relative space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Step {i + 1}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured artworks */}
      <section className="py-14 md:py-20" aria-labelledby="featured-heading">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <h2 id="featured-heading" className="font-display text-2xl md:text-4xl font-semibold tracking-tight heading-flourish">
                Latest pieces
              </h2>
              <p className="text-muted-foreground mt-4 text-sm md:text-base">
                Fresh from the studios — every piece is one of a kind.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-secondary hover:text-secondary hover:bg-secondary/10">
              <Link href="/artworks">
                View all
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-muted/30 rounded-lg animate-pulse" />
              ))
            ) : featuredArtworks.length > 0 ? (
              featuredArtworks.map((artwork, index) => (
                <ArtCard key={artwork.id} artwork={artwork} index={index} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground mb-4">The gallery is just getting started.</p>
                <Button asChild variant="outline">
                  <Link href="/artworks">Explore the gallery</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Button asChild variant="outline">
              <Link href="/artworks">
                View all artworks
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="pb-14 md:pb-20" aria-label="Art categories">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-8 heading-flourish">
              Browse by category
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/artworks?category=${cat.name}`}
                  className="group flex items-center gap-2 border border-border bg-card rounded-full px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow hover:border-secondary hover:text-secondary hover:-translate-y-0.5 transition-all"
                >
                  {cat.label}
                  <span className="text-xs text-muted-foreground group-hover:text-secondary/70">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-6">
          <div className="bg-foreground text-background rounded-xl px-8 py-14 md:px-16 md:py-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              An artist, or know one?
            </h2>
            <p className="text-background/70 max-w-xl mx-auto mb-8 leading-relaxed">
              CRAFTOPIA is built for Rwandan artists who want a real place to show and sell
              their work. Get in touch and we&apos;ll set you up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">
                <Link href="/contact">Get in touch</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                <Link href="/artworks">See what&apos;s for sale</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
