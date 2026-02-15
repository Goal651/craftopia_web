"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 2000, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (!isInView) return

    const numericValue = parseInt(value.replace(/\D/g, ""))
    const suffix = value.replace(/\d/g, "")

    if (isNaN(numericValue)) {
      setDisplayValue(value)
      return
    }

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCounter = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(easeOutQuart * numericValue)
      
      setDisplayValue(currentValue + suffix)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [isInView, value, duration])

  return (
    <div ref={ref} className={className}>
      {displayValue}
    </div>
  )
}
