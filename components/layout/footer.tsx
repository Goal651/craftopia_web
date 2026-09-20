import Link from "next/link"
import { Phone, MapPin, Clock } from "lucide-react"
import { SITE } from "@/lib/auth-client"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <p className="font-display text-xl font-semibold tracking-tight">
              CRAFT<span className="text-secondary">OPIA</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Original art from Rwandan artists. Browse the collection, order a piece, we deliver it to your door.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gallery</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/artworks" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse artworks
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About us
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Artist sign in
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reach us</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {SITE.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              ))}
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {SITE.location}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {SITE.hours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.name}. All artworks belong to their artists.</p>
          <p>Made in Kigali 🇷🇼</p>
        </div>
      </div>
    </footer>
  )
}
