import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
  variant?: 'button' | 'link'
  onClick?: () => void
}

export function BackButton({ 
  href, 
  label = "Back", 
  className,
  variant = 'button',
  onClick 
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  if (variant === 'link' && href) {
    return (
      <Link 
        href={href}
        className={cn(
          "inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
    )
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(
        "glass border-0 bg-transparent text-gray-300 hover:text-white hover:bg-white/10",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}