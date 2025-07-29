"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Shield, Truck } from "lucide-react"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    setIsLoading(id)
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 300))
    updateQuantity(id, newQuantity)
    setIsLoading(null)
  }

  const handleRemoveItem = async (id: string) => {
    setIsLoading(id)
    await new Promise((resolve) => setTimeout(resolve, 300))
    removeItem(id)
    setIsLoading(null)
  }

  const subtotal = state.total
  const shipping = subtotal > 1000 ? 0 : 50
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="glass-card rounded-3xl p-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">Discover amazing artworks and add them to your cart</p>
              <Button asChild className="btn-primary">
                <Link href="/artworks">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-padding">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {state.itemCount} {state.itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="glass hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 bg-transparent"
            >
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {state.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-card rounded-2xl border-0 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image */}
                          <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 128px"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-xl font-bold">{item.title}</h3>
                              <p className="text-muted-foreground">by {item.artist}</p>
                              <Badge className="mt-2 gradient-violet text-white border-0">In Stock: {item.stock}</Badge>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={isLoading === item.id || item.quantity <= 1}
                                  className="glass w-10 h-10"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>

                                <span className="w-12 text-center font-medium">
                                  {isLoading === item.id ? (
                                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={isLoading === item.id || item.quantity >= item.stock}
                                  className="glass w-10 h-10"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Price and Remove */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gradient-violet">
                                    ${(item.price * item.quantity).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    ${item.price.toLocaleString()} each
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={isLoading === item.id}
                                  className="glass w-10 h-10 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                                >
                                  {isLoading === item.id ? (
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <Card className="glass-strong rounded-3xl border-0">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">${subtotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping}`}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total</span>
                          <span className="text-gradient-violet">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {shipping > 0 && (
                      <div className="mb-6 p-4 glass rounded-xl">
                        <p className="text-sm text-center">
                          <Truck className="w-4 h-4 inline mr-2" />
                          Free shipping on orders over $1,000
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button asChild className="w-full btn-primary text-lg py-6">
                        <Link href="/checkout">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Proceed to Checkout
                        </Link>
                      </Button>

                      <Button asChild variant="outline" className="w-full glass bg-transparent">
                        <Link href="/artworks">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Continue Shopping
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>Secure checkout guaranteed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
