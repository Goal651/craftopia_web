"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/CartContext"
import { ArrowLeft, CreditCard, Lock, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  })

  const subtotal = state.total
  const shipping = subtotal >= 500 ? 0 : 50
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Order placed successfully!",
      description: "You will receive a confirmation email shortly.",
    })

    clearCart()
    router.push("/")
    setIsProcessing(false)
  }

  if (state.items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-background via-slate-50/50 to-slate-100/50 dark:via-slate-900/50 dark:to-slate-800/50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link
              href="/cart"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Link>
            <h1 className="text-3xl lg:text-4xl font-light text-white">
              Secure <span className="text-blue-400 font-medium">Checkout</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" required value={formData.city} onChange={handleInputChange} />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          required
                          value={formData.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      Payment Information
                      <Lock className="w-4 h-4 text-green-600 ml-auto" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        name="nameOnCard"
                        required
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          required
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          required
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-400">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                    disabled={isProcessing}
                    onClick={handleSubmit}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Insured Shipping
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
