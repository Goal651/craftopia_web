"use client"

import { useEffect, useRef } from "react"

interface ArtworkGeneratorProps {
  seed: string
  width?: number
  height?: number
  style?: "abstract" | "digital" | "painting" | "sculpture" | "photography" | "mixed"
  className?: string
}

export function ArtworkGenerator({ 
  seed, 
  width = 400, 
  height = 400, 
  style = "abstract",
  className = ""
}: ArtworkGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simple seeded random number generator
  const seededRandom = (seed: string) => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return () => {
      hash = (hash * 9301 + 49297) % 233280
      return hash / 233280
    }
  }

  const generateAbstractArt = (ctx: CanvasRenderingContext2D, random: () => number, canvasWidth: number, canvasHeight: number) => {
    const colors = [
      ['#667eea', '#000000'], // Purple-Black
      ['#f093fb', '#1a1a1a'], // Pink-Dark Gray
      ['#4facfe', '#00f2fe'], // Blue-Cyan
      ['#43e97b', '#38f9d7'], // Green-Cyan
      ['#fa709a', '#000000'], // Pink-Black
      ['#a8edea', '#2a2a2a'], // Cyan-Dark Gray
      ['#ff9a9e', '#1f1f1f'], // Soft Pink-Dark
      ['#667eea', '#0f0f0f'], // Purple-Black gradient
    ]

    const colorPair = colors[Math.floor(random() * colors.length)]
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    gradient.addColorStop(0, colorPair[0])
    gradient.addColorStop(1, colorPair[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Add abstract shapes
    for (let i = 0; i < 8; i++) {
      ctx.save()
      ctx.globalAlpha = 0.1 + random() * 0.3
      
      const x = Math.max(0, Math.min(canvasWidth, random() * canvasWidth))
      const y = Math.max(0, Math.min(canvasHeight, random() * canvasHeight))
      const size = Math.max(10, 50 + random() * 150)
      
      // Avoid brown hues (30-60 degrees)
      const hue = random() < 0.25 ? random() * 30 : (random() < 0.5 ? 60 + random() * 180 : 240 + random() * 120)
      ctx.fillStyle = `hsl(${Math.floor(hue)}, 70%, 60%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Add geometric elements
    for (let i = 0; i < 5; i++) {
      ctx.save()
      ctx.globalAlpha = 0.2 + random() * 0.4
      // Avoid brown hues for geometric elements too
      const geoHue = random() < 0.25 ? random() * 30 : (random() < 0.5 ? 60 + random() * 180 : 240 + random() * 120)
      ctx.fillStyle = `hsl(${Math.floor(geoHue)}, 80%, 50%)`
      
      const x = Math.max(0, Math.min(canvasWidth, random() * canvasWidth))
      const y = Math.max(0, Math.min(canvasHeight, random() * canvasHeight))
      const w = Math.max(10, 20 + random() * 100)
      const h = Math.max(10, 20 + random() * 100)
      
      ctx.translate(x, y)
      ctx.rotate(random() * Math.PI * 2)
      ctx.fillRect(-w/2, -h/2, w, h)
      ctx.restore()
    }
  }

  const generateDigitalArt = (ctx: CanvasRenderingContext2D, random: () => number, canvasWidth: number, canvasHeight: number) => {
    // Dark tech background
    const gradient = ctx.createRadialGradient(canvasWidth/2, canvasHeight/2, 0, canvasWidth/2, canvasHeight/2, canvasWidth/2)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#0f0f23')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Neon grid lines
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    
    for (let i = 0; i < canvasWidth; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvasHeight)
      ctx.stroke()
    }
    
    for (let i = 0; i < canvasHeight; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvasWidth, i)
      ctx.stroke()
    }

    // Glowing orbs
    for (let i = 0; i < 6; i++) {
      const x = Math.max(0, Math.min(canvasWidth, random() * canvasWidth))
      const y = Math.max(0, Math.min(canvasHeight, random() * canvasHeight))
      const radius = Math.max(20, 20 + random() * 60) // Ensure radius is always positive
      
      const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      orbGradient.addColorStop(0, `hsla(${Math.floor(180 + random() * 60)}, 100%, 50%, 0.8)`)
      orbGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = orbGradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const generatePainting = (ctx: CanvasRenderingContext2D, random: () => number, canvasWidth: number, canvasHeight: number) => {
    // Cool painting background - no browns
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#000000', '#ff9ff3', '#1a1a1a', '#2a2a2a']
    const bgColor = colors[Math.floor(random() * colors.length)]
    
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Paint strokes
    for (let i = 0; i < 15; i++) {
      ctx.save()
      ctx.globalAlpha = 0.3 + random() * 0.4
      // Avoid brown hues (30-60 degrees), prefer blues, purples, greens, and blacks
      const hue = random() < 0.3 ? 0 : (random() < 0.6 ? 240 + random() * 60 : 120 + random() * 60) // Black/Red or Blue/Purple or Green
      const lightness = random() < 0.2 ? 10 : 40 // Sometimes very dark (almost black)
      ctx.strokeStyle = `hsl(${hue}, 70%, ${lightness}%)`
      ctx.lineWidth = 8 + random() * 20
      ctx.lineCap = 'round'
      
      const startX = random() * canvasWidth
      const startY = random() * canvasHeight
      const endX = startX + (random() - 0.5) * 200
      const endY = startY + (random() - 0.5) * 200
      
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.quadraticCurveTo(
        startX + (random() - 0.5) * 100,
        startY + (random() - 0.5) * 100,
        endX,
        endY
      )
      ctx.stroke()
      ctx.restore()
    }
  }

  const generatePhotography = (ctx: CanvasRenderingContext2D, random: () => number, canvasWidth: number, canvasHeight: number) => {
    // Modern photography - no brown tones
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.6)
    skyGradient.addColorStop(0, '#87CEEB')
    skyGradient.addColorStop(1, '#4169E1')
    
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.6)

    // Ground - dark instead of brown
    ctx.fillStyle = '#2F4F4F'
    ctx.fillRect(0, canvasHeight * 0.6, canvasWidth, canvasHeight * 0.4)

    // Abstract landscape elements - avoid browns
    for (let i = 0; i < 5; i++) {
      // Use greens, blues, or blacks - no browns
      const hue = random() < 0.5 ? 120 + random() * 60 : 240 + random() * 60 // Green or Blue range
      const lightness = random() < 0.3 ? 10 : 30 + random() * 20 // Sometimes very dark
      ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`
      const x = random() * canvasWidth
      const y = canvasHeight * 0.4 + random() * canvasHeight * 0.3
      const w = 30 + random() * 80
      const h = 40 + random() * 100
      
      ctx.fillRect(x, y, w, h)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure valid dimensions
    const canvasWidth = Math.max(100, width)
    const canvasHeight = Math.max(100, height)
    
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    try {
      const random = seededRandom(seed)

      switch (style) {
        case 'abstract':
          generateAbstractArt(ctx, random, canvasWidth, canvasHeight)
          break
        case 'digital':
          generateDigitalArt(ctx, random, canvasWidth, canvasHeight)
          break
        case 'painting':
          generatePainting(ctx, random, canvasWidth, canvasHeight)
          break
        case 'photography':
          generatePhotography(ctx, random, canvasWidth, canvasHeight)
          break
        case 'sculpture':
          generateAbstractArt(ctx, random, canvasWidth, canvasHeight) // Use abstract for sculpture
          break
        case 'mixed':
          // Randomly choose a style
          const styles = ['abstract', 'digital', 'painting', 'photography']
          const randomStyle = styles[Math.floor(random() * styles.length)]
          switch (randomStyle) {
            case 'abstract': generateAbstractArt(ctx, random, canvasWidth, canvasHeight); break
            case 'digital': generateDigitalArt(ctx, random, canvasWidth, canvasHeight); break
            case 'painting': generatePainting(ctx, random, canvasWidth, canvasHeight); break
            case 'photography': generatePhotography(ctx, random, canvasWidth, canvasHeight); break
          }
          break
        default:
          generateAbstractArt(ctx, random, canvasWidth, canvasHeight)
      }
    } catch (error) {
      console.error('Error generating artwork:', error)
      // Fallback: simple gradient
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    }
  }, [seed, width, height, style])

  return (
    <canvas 
      ref={canvasRef}
      className={`rounded-lg ${className}`}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
