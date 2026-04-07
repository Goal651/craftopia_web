"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, Calendar, MapPin, Mail, Phone, Instagram, Facebook, Twitter, ExternalLink } from "lucide-react"

export default function AboutPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // This would typically come from your admin-managed content
  const aboutContent = {
    biography:
      "Elena Vasquez is a contemporary artist whose work explores the intersection of emotion and form. With over 15 years of experience, her pieces have been featured in galleries worldwide and are collected by art enthusiasts globally. Born in Barcelona, Spain, Elena's artistic journey began at the prestigious School of Fine Arts, where she developed her unique style that blends traditional techniques with modern digital innovation.",
    mission:
      "To create art that transcends traditional boundaries and speaks to the human soul through color, form, and emotion. My work aims to bridge the gap between the physical and digital worlds, creating pieces that resonate with contemporary audiences while honoring classical artistic traditions.",
    achievements: [
      "International Contemporary Art Award 2023",
      "Gallery of Modern Art Solo Exhibition 2022",
      "Artist of the Year 2021 - Contemporary Arts Foundation",
      "Digital Art Innovation Prize 2020",
      "Featured in Art Monthly Magazine 2019",
      "Emerging Artist Grant Recipient 2018",
    ],
    exhibitions: [
      { title: "Ethereal Visions", venue: "Metropolitan Gallery, New York", year: "2024" },
      { title: "Contemporary Voices", venue: "Modern Art Museum, Los Angeles", year: "2023" },
      { title: "Digital Renaissance", venue: "Tech Art Center, San Francisco", year: "2023" },
      { title: "Emerging Artists Showcase", venue: "International Art Fair, Miami", year: "2022" },
      { title: "Color and Form", venue: "Barcelona Contemporary Gallery", year: "2021" },
      { title: "New Perspectives", venue: "London Art Week", year: "2020" },
    ],
    contactInfo: {
      email: "elena@artisangallery.com",
      phone: "+1 (555) 987-6543",
      address: "123 Artist Studio, Barcelona, Spain",
    },
    socialMedia: {
      instagram: "@elenavasquezart",
      facebook: "Elena Vasquez Art",
      twitter: "@elenavasquez",
    },
    profileImage: "/images/elena-portrait.jpg",
    studioImages: ["/images/studio-1.jpg", "/images/studio-2.jpg", "/images/studio-3.jpg"],
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16 lg:space-y-24"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center space-y-6">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30">About CRAFTOPIA</Badge>
              <h1 className="text-4xl lg:text-6xl font-light text-foreground">
                The Future of <span className="text-gradient-primary">Digital Art</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A contemporary artist whose work explores the intersection of emotion and form, creating pieces that
                resonate with audiences worldwide.
              </p>
            </div>
          </motion.section>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Artist Image */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="relative aspect-[4/5] rounded overflow-hidden shadow-2xl">
                <Image
                  src={aboutContent.profileImage || "/placeholder.svg"}
                  alt="Elena Vasquez"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

            
            </motion.div>

            {/* Biography and Mission */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl lg:text-3xl font-light text-foreground">Biography</h2>
                <p className="text-muted-foreground leading-relaxed">{aboutContent.biography}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-2xl lg:text-3xl font-light text-foreground">Mission</h2>
                <p className="text-muted-foreground leading-relaxed">{aboutContent.mission}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Get in Touch</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">hello@craftopia.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">+1 (555) 000-1234</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">San Francisco, CA</span>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-center gap-4 pt-4">
                  <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary border-primary/20 bg-transparent">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary border-primary/20 bg-transparent">
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:text-primary border-primary/20 bg-transparent">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
