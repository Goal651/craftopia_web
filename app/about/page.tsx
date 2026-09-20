import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Package, MessageCircle, MapPin, Phone } from "lucide-react"
import { SITE } from "@/lib/auth-client"

export const metadata: Metadata = {
    title: "About Us",
    description:
        "CRAFTOPIA is a Kigali-based online gallery connecting Rwandan artists with buyers. Learn who we are, how ordering works, and how we deliver original art across Rwanda.",
}

const VALUES = [
    {
        icon: Heart,
        title: "Original work only",
        description:
            "Every piece in the gallery is a real, one-of-a-kind artwork made by a Rwandan artist. No prints, no mass production.",
    },
    {
        icon: MessageCircle,
        title: "Talk to a real person",
        description:
            "When you order, the artist reaches out personally to arrange payment and delivery. No middlemen, no call centers.",
    },
    {
        icon: Package,
        title: "Delivered with care",
        description:
            "We package every piece properly and deliver across Kigali and the rest of Rwanda, straight to your door.",
    },
]

export default function AboutPage() {
    return (
        <div className="bg-background py-14 sm:py-20">
            <div className="container mx-auto px-6 max-w-4xl space-y-14">
                {/* Header */}
                <header className="text-center space-y-5">
                    <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight heading-flourish inline-block">
                        About {SITE.name}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        We help Rwandan artists show their work to the world — and help you
                        bring a piece of that work into your home.
                    </p>
                </header>

                {/* Story */}
                <section className="space-y-4">
                    <h2 className="font-display text-2xl font-semibold">Our story</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            {SITE.name} started with a simple problem: talented artists in Rwanda had
                            beautiful work sitting in their studios, and no easy way for the people who
                            would love it to actually find it and buy it.
                        </p>
                        <p>
                            So we built a home for their art. Artists upload their pieces with real
                            photos and fair prices. You browse the collection, order what you love,
                            and we handle the rest — the artist contacts you, you agree on payment,
                            and the artwork is delivered to your address.
                        </p>
                        <p>
                            Every purchase goes directly to the artist who made it. That&apos;s the whole point.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className="space-y-6">
                    <h2 className="font-display text-2xl font-semibold">What we believe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {VALUES.map((value) => (
                            <Card key={value.title}>
                                <CardContent className="p-6 space-y-3">
                                    <div className="w-11 h-11 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                                        <value.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="space-y-5">
                    <h2 className="font-display text-2xl font-semibold">Talk to us</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-5 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Call or WhatsApp</p>
                                {SITE.phones.map((phone) => (
                                    <a
                                        key={phone}
                                        href={`tel:${phone.replace(/\s/g, "")}`}
                                        className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors"
                                    >
                                        <Phone className="w-4 h-4 text-secondary" />
                                        {phone}
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Visit</p>
                                <p className="flex items-center gap-2 text-foreground">
                                    <MapPin className="w-4 h-4 text-secondary" />
                                    {SITE.location}
                                </p>
                                <p className="text-sm text-muted-foreground">Visits by appointment · {SITE.hours}</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-accent rounded-xl px-8 py-12 text-center">
                    <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">
                        Ready to find your piece?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                        Browse the collection and order something you love — or reach out if you&apos;re
                        an artist who wants to join.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild className="btn-primary h-11 px-8">
                            <Link href="/artworks">Browse artworks</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-11 px-8 border-border">
                            <Link href="/contact">Contact us</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}
