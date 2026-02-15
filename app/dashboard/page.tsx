"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useArt } from "@/contexts/ArtContext"
import { 
  BarChart3, 
  Eye, 
  Heart, 
  TrendingUp, 
  Plus, 
  Brush, 
  Upload,
  Users,
  Calendar,
  ArrowRight
} from "lucide-react"
import { formatDateSafe } from "@/lib/utils/date-utils"
import Link from "next/link"

interface DashboardStats {
  totalArtworks: number
  totalViews: number
  totalLikes: number
  recentViews: number
}

export default function ArtistDashboard() {
  const { user } = useAuth()
  const { artworks, loading } = useArt()
  const [stats, setStats] = useState<DashboardStats>({
    totalArtworks: 0,
    totalViews: 0,
    totalLikes: 0,
    recentViews: 0
  })

  useEffect(() => {
    if (user && artworks.length > 0) {
      const userArtworks = artworks.filter(artwork => artwork.artist_id === user.id)
      const totalViews = userArtworks.reduce((sum, artwork) => sum + artwork.view_count, 0)
      const totalLikes = Math.floor(totalViews * 0.1) // Simulated likes
      
      setStats({
        totalArtworks: userArtworks.length,
        totalViews,
        totalLikes,
        recentViews: Math.floor(totalViews * 0.3) // Recent views simulation
      })
    }
  }, [user, artworks])

  const userArtworks = artworks.filter(artwork => artwork.artist_id === user?.id).slice(0, 3)

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="glass-strong border-0 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
            <Button asChild className="btn-primary">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container-modern section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Artist <span className="text-gradient-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user.display_name || user.email}! Track your artistic journey.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="btn-primary">
                <Link href="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Artwork
                </Link>
              </Button>
              <Button variant="outline" asChild className="glass-strong">
                <Link href="/my-artworks">
                  <Brush className="w-4 h-4 mr-2" />
                  Manage Artworks
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Artworks",
              value: stats.totalArtworks.toString(),
              icon: Brush,
              color: "from-blue-500 to-cyan-500",
              change: "+2 this month"
            },
            {
              label: "Total Views",
              value: stats.totalViews.toLocaleString(),
              icon: Eye,
              color: "from-purple-500 to-pink-500",
              change: "+12% this week"
            },
            {
              label: "Total Likes",
              value: stats.totalLikes.toLocaleString(),
              icon: Heart,
              color: "from-green-500 to-emerald-500",
              change: "+8 this week"
            },
            {
              label: "Recent Views",
              value: stats.recentViews.toString(),
              icon: TrendingUp,
              color: "from-orange-500 to-red-500",
              change: "+25% today"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-0 overflow-hidden group hover:bg-white/5 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-0.5`}>
                      <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-border/50">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Artworks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brush className="w-5 h-5" />
                  Recent Artworks
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my-artworks" className="text-primary">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 glass rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : userArtworks.length > 0 ? (
                  <div className="space-y-4">
                    {userArtworks.map((artwork) => (
                      <div
                        key={artwork.id}
                        className="flex items-center gap-4 p-4 rounded-lg glass border-0 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/artworks/${artwork.id}`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={artwork.image_url}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{artwork.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              {artwork.view_count}
                            </div>
                            <Badge variant="outline" className="text-xs border-border/50">
                              {artwork.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brush className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="text-lg font-medium mb-2">No artworks yet</h4>
                    <p className="text-muted-foreground mb-4">Start by uploading your first masterpiece!</p>
                    <Button asChild className="btn-primary">
                      <Link href="/upload">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Artwork
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start btn-primary">
                  <Link href="/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Artwork
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glass-strong">
                  <Link href="/my-artworks">
                    <Brush className="w-4 h-4 mr-2" />
                    Manage My Artworks
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glass-strong">
                  <Link href="/profile">
                    <Users className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start glass-strong">
                  <Link href="/artworks">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Gallery
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="glass-card border-0 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      <strong>High-quality images</strong> get 3x more engagement
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      <strong>Detailed descriptions</strong> help collectors connect with your art
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      <strong>Regular uploads</strong> keep your audience engaged
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
