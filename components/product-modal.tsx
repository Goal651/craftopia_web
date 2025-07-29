"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { X, Plus, Minus, Heart, Share2, ZoomIn, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductModalProps {
  artwork: any
  onClose: () => void
}

export function ProductModal({ artwork, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const { dispatch } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image: artwork.images[0],
        quantity,
      },
    })
    toast({
      title: "Added to Cart",
      description: `${artwork.title} has been added to your cart.`,
    })
    onClose()
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= artwork.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="grid lg:grid-cols-2 h-full">
            {/* Image Section */}
            <div className="relative bg-muted/20 flex items-center justify-center p-6 lg:p-8">
              <motion.div
                className="relative w-full aspect-square max-w-lg perspective-1000"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl card-3d"
                  whileHover={{ rotateY: 2, rotateX: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={artwork.images[selectedImageIndex] || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover cursor-zoom-in"
                    onClick={() => setIsZoomed(!isZoomed)}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Zoom Overlay */}
                  <div className="absolute top-4 left-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-background/80 backdrop-blur-sm"
                      onClick={() => setIsZoomed(!isZoomed)}
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Zoom
                    </Button>
                  </div>

                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>

                {/* Image Thumbnails */}
                {artwork.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {artwork.images.map((image: string, index: number) => (
                      <motion.button
                        key={index}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index ? "border-gold" : "border-transparent"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${artwork.title} ${index + 1}`}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-6 flex-1">
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge className="bg-gold/20 text-gold border-gold/30">{artwork.category}</Badge>
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{artwork.title}</h1>
                      <p className="text-lg text-muted-foreground">by {artwork.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="hover:bg-accent">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-accent">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < 4 ? "fill-gold text-gold" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(4.8 out of 5)</span>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold">${artwork.price.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Free shipping worldwide • 30-day return policy</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Medium:</span>
                      <span className="ml-2 font-medium">{artwork.medium}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="ml-2 font-medium">{artwork.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Year:</span>
                      <span className="ml-2 font-medium">{artwork.year}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="ml-2 font-medium">{artwork.stockQuantity} available</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What's Included</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-sm">Certificate of Authenticity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-sm">Professional Packaging & Shipping</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <RotateCcw className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="text-sm">30-Day Return Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="space-y-4 pt-6 border-t border-border">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= artwork.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-gold">${(artwork.price * quantity).toLocaleString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 gradient-gold text-white hover:opacity-90 transition-opacity mobile-button"
                    disabled={!artwork.inStock}
                  >
                    {artwork.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gold text-gold hover:bg-gold hover:text-white mobile-button bg-transparent"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Stock Status */}
                {artwork.stockQuantity <= 5 && artwork.inStock && (
                  <p className="text-sm text-orange-500 text-center">Only {artwork.stockQuantity} left in stock!</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
