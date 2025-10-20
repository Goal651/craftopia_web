"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"

interface MagneticButtonProps extends ButtonProps {
  children: React.ReactNode
  magneticStrength?: number
}

export function MagneticButton({ 
  children, 
  magneticStrength = 0.15,
  className = "",
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * magneticStrength
    const deltaY = (e.clientY - centerY) * magneticStrength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        ref={ref}
        className={`magnetic-button ${className}`}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
