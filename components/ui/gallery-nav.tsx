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
      description: "Professional artworks for purchase",
      active: pathname.startsWith('/artworks')
    },
    {
      name: "Community Gallery",
      href: "/gallery",
      icon: Palette,
      description: "Public artworks from our community",
      active: pathname.startsWith('/gallery')
    },
    {
      name: "Upload Artwork",
      href: "/upload",
      icon: Upload,
      description: "Share your art with the community",
      active: pathname === '/upload',
      highlight: true
    }
  ]

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex-1">
          <div className={cn(
            "glass-card rounded-lg p-4 transition-all duration-300 hover:scale-105 border-0",
            item.active && "ring-2 ring-blue-500/50 bg-blue-500/10",
            item.highlight && "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                item.active ? "bg-blue-500 text-white" : "bg-gray-700/50 text-gray-400"
              )}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-semibold text-sm",
                  item.active ? "text-blue-400" : "text-white"
                )}>
                  {item.name}
                </h3>
                {item.active && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}