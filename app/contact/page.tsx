"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Message sent successfully!",
      description: "Thank you for your inquiry. Elena will get back to you within 24 hours.",
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

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "elena@artisangallery.com",
      description: "For inquiries about artworks and commissions",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (555) 123-4567",
      description: "Available Monday to Friday, 9 AM - 6 PM EST",
    },
    {
      icon: MapPin,
      title: "Studio Location",
      details: "New York, NY",
      description: "Studio visits by appointment only",
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "Within 24 hours",
      description: "We typically respond to all inquiries promptly",
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-background via-pastel-mint/10 to-pastel-peach/10 dark:via-pastel-mint/5 dark:to-pastel-peach/5">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-gold/20 text-gold border-gold/30">Get in Touch</Badge>
            <h1 className="text-4xl lg:text-6xl font-light text-charcoal dark:text-white">
              Contact <span className="text-gold font-medium">Elena</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about a particular artwork, interested in commissioning a piece, or want to learn more
              about Elena's artistic process? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-light text-charcoal dark:text-white">Send a Message</h2>
                      <p className="text-muted-foreground">
                        Fill out the form below and Elena will get back to you personally.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl"
                            placeholder="Your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl"
                          placeholder="What would you like to discuss?"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="border-0 bg-white/50 dark:bg-card/50 focus:bg-white dark:focus:bg-card rounded-xl resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gradient-gold text-white hover:opacity-90 transition-opacity"
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
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-charcoal dark:text-white">Get in Touch</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're a collector, art enthusiast, or simply curious about Elena's work, we're here to help.
                  Reach out through any of the channels below.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                            <info.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-charcoal dark:text-white">{info.title}</h3>
                            <p className="text-gold font-medium">{info.details}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* FAQ Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-pastel-lavender/20 to-pastel-peach/20 dark:from-pastel-lavender/10 dark:to-pastel-peach/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-gold" />
                        <h3 className="font-semibold text-charcoal dark:text-white">Frequently Asked</h3>
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          <strong>Commissioning:</strong> Elena accepts select commissions. Please include details about
                          your vision, preferred medium, and timeline.
                        </p>
                        <p>
                          <strong>Shipping:</strong> All artworks are professionally packaged and insured. International
                          shipping available.
                        </p>
                        <p>
                          <strong>Authentication:</strong> Every piece comes with a certificate of authenticity signed
                          by the artist.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
