import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Palette, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryNavProps {
  className?: string
}

export function GalleryNav({ className }: GalleryNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Curated Collection",
      href: "/artworks",
      icon: ImageIcon,
      description: "Professional artworks curated by our team - premium pieces for collectors",
      active: pathname.startsWith('/artworks')
    },
    {
      name: "Community Gallery",
      href: "/gallery",
      icon: Palette,
      description: "Public artworks from our community - discover emerging artists",
      active: pathname.startsWith('/gallery')
    },
    {
      name: "Upload Artwork",
      href: "/upload",
      icon: Upload,
      description: "Share your art with the community - showcase your creativity",
      active: pathname === '/upload',
      highlight: true
    }
  ]

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex-1">
          <div className={cn(
            "glass-card rounded-lg p-4 md:p-6 transition-all duration-300 hover:scale-105 border-0 h-full",
            item.active && "ring-2 ring-primary/50 bg-primary/10",
            item.highlight && "bg-gradient-to-r from-primary/10 to-secondary/10"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                <h3 className={cn(
                  "font-semibold text-sm md:text-base truncate",
                  item.active ? "text-primary" : "text-foreground"
                )}>
                  {item.name}
                </h3>
                {item.active && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-xs w-fit">
                    Current
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}