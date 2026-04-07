"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const artwork = searchParams.get('artwork')
    const artist = searchParams.get('artist')
    if (artwork) {
      setFormData(prev => ({
        ...prev,
        subject: `Inquiry: ${artwork}`,
        message: artist
          ? `Hi ${artist},\n\nI am interested in your artwork "${artwork}" that I realized on Craftopia. Is it still available?`
          : `I am interested in the artwork "${artwork}".`
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Message sent successfully!",
      description: "Thank you for your inquiry. The artist will get back to you soon.",
    })

    setFormData({ name: "", email: "", subject: "", message: "" })
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card className="glass-strong border-border/50">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Send a Message</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Fill out the form below to connect.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded h-11"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded h-11"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded h-11"
                placeholder="What would you like to discuss?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full btn-primary glow-primary py-7 text-lg font-bold uppercase tracking-widest"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone 1",
      details: "+250 788 821 939",
      description: "Available Monday to  Sunday, 7 AM - 8 PM GMT+2",
    },
    {
      icon: Phone,
      title: "Phone 2",
      details: "+250 785 244 612",
      description: "Available Monday to Sunday 7 AM - 8 PM GMT+2",
    },
    {
      icon: MapPin,
      title: "HQ Location",
      details: "Kigali, Rwanda",
      description: "Visits by appointment only",
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "Within 24 hours",
      description: "We typically respond to all inquiries promptly",
    },
  ]

  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-12 md:space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 md:space-y-6 mb-16"
          >
            <Badge className="glass px-6 py-2 border-primary/20 text-primary">Get in Touch</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground px-4">
              Contact <span className="text-gradient-primary">CRAFTOPIA</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Have questions about a particular artwork, interested in commissioning a piece, or want to learn more? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Suspense fallback={<div>Loading form...</div>}>
                <ContactForm />
              </Suspense>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Reach Out Direct</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Have questions? Our team is here to help you navigate the world of premium art.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="glass border-border/50 hover:bg-muted/30 transition-all duration-300">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                            <info.icon className="w-6 h-6" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                             <h3 className="font-bold text-lg text-foreground">{info.title}</h3>
                             <p className="text-base text-primary font-medium tracking-tight break-words">{info.details}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

