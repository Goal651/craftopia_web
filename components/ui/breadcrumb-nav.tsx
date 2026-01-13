import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      <Link 
        href="/" 
        className="flex items-center text-gray-400 hover:text-white transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          {item.href && !item.current ? (
            <Link 
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "font-medium",
                item.current ? "text-white" : "text-gray-400"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}