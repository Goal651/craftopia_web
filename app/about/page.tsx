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
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto mobile-padding py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16 lg:space-y-24"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center space-y-6">
            <div className="space-y-4">
              <Badge className="bg-gold/20 text-gold border-gold/30">About the Artist</Badge>
              <h1 className="text-4xl lg:text-6xl font-light text-foreground">
                Meet <span className="text-gold font-medium">Elena Vasquez</span>
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
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={aboutContent.profileImage || "/placeholder.svg"}
                  alt="Elena Vasquez"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4 card-3d">
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-gold">15+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-4 card-3d">
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-gold">50+</div>
                    <div className="text-sm text-muted-foreground">Artworks</div>
                  </CardContent>
                </Card>
                <Card className="text-center p-4 card-3d">
                  <CardContent className="p-0">
                    <div className="text-2xl font-bold text-gold">200+</div>
                    <div className="text-sm text-muted-foreground">Collectors</div>
                  </CardContent>
                </Card>
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
                    <Mail className="w-5 h-5 text-gold" />
                    <span className="text-muted-foreground">{aboutContent.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gold" />
                    <span className="text-muted-foreground">{aboutContent.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gold" />
                    <span className="text-muted-foreground">{aboutContent.contactInfo.address}</span>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-center gap-4 pt-4">
                  <Button variant="outline" size="icon" className="hover:bg-gold/20 hover:text-gold bg-transparent">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-gold/20 hover:text-gold bg-transparent">
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:bg-gold/20 hover:text-gold bg-transparent">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Achievements Section */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-light text-foreground">
                Awards & <span className="text-gold font-medium">Recognition</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Elena's work has been recognized by prestigious institutions and art organizations worldwide.
              </p>
            </div>

            <div className="responsive-grid">
              {aboutContent.achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 card-3d hover:shadow-lg transition-shadow">
                    <CardContent className="p-0 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement}</h3>
                        <p className="text-sm text-muted-foreground">Recognition</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Exhibitions Section */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-light text-foreground">
                Recent <span className="text-gold font-medium">Exhibitions</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Elena's artworks have been featured in galleries and exhibitions around the world.
              </p>
            </div>

            <div className="space-y-4">
              {aboutContent.exhibitions.map((exhibition, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 card-3d hover:shadow-lg transition-shadow">
                    <CardContent className="p-0 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pastel-lavender/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{exhibition.title}</h3>
                          <p className="text-muted-foreground">{exhibition.venue}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{exhibition.year}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Studio Images */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-light text-foreground">
                Behind the <span className="text-gold font-medium">Scenes</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Take a glimpse into Elena's creative process and studio environment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {aboutContent.studioImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Studio ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section variants={itemVariants} className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-light text-foreground">
                Explore Elena's <span className="text-gold font-medium">Collection</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the full range of Elena's contemporary artworks and find the perfect piece for your collection.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="gradient-gold text-white hover:opacity-90 transition-opacity mobile-button" asChild>
                <a href="/artworks">
                  View Collection
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-white mobile-button bg-transparent"
                asChild
              >
                <a href="/contact">Commission Artwork</a>
              </Button>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  )
}
