"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/AuthContext"
import { ArtCard } from "@/components/ui/art-card"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Save,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Upload,
  Star,
  Heart,
  Mail,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  RefreshCw,
  UserX,
  UserCheck,
  ShieldCheck,
  UserPlus,
  MoreVertical,
  ChevronRight,
  Activity,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { ArtworkRecord } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface DashboardStats {
  totalArtworks: number
  totalUsers: number
  totalViews: number
  activeArtists: number
}

interface AdminUser {
  id: string
  email: string
  display_name: string
  avatar_url: string
  createdAt: string
  updatedAt: string
  created_at?: string
  updated_at?: string
  artwork_count: number
  total_views: number
  role: 'user' | 'staff' | 'admin'
  status: 'active' | 'suspended'
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isUserViewModalOpen, setIsUserViewModalOpen] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkRecord | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [artworks, setArtworks] = useState<ArtworkRecord[]>([])
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({})
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const allCategories = [
    { id: 'painting', label: 'Painting' },
    { id: 'digital-art', label: 'Digital Art' },
    { id: 'photography', label: 'Photography' },
    { id: 'sculpture', label: 'Sculpture' },
    { id: 'mixed-media', label: 'Mixed Media' },
    { id: 'drawing', label: 'Drawing' },
    { id: 'other', label: 'Other' }
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes, artworksRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/artworks?limit=100')
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
        setCategoryDistribution(data.categoryCounts)
        setRecentActivity(data.recentArtworks)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }

      if (artworksRes.ok) {
        const data = await artworksRes.json()
        setArtworks(data.artworks)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin()) {
      fetchData()
    }
  }, [user])

  const handleDeleteArtwork = async (id: string) => {
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setArtworks(artworks.filter(a => a.id !== id))
        toast.success("Artwork deleted successfully")
      } else {
        throw new Error('Failed to delete')
      }
    } catch (err) {
      toast.error("Error deleting artwork")
    }
  }

  const handleUpdateUser = async (id: string, updates: Partial<AdminUser>) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u))
        toast.success("User updated successfully")
      } else {
        throw new Error('Failed to update')
      }
    } catch (err) {
      toast.error("Error updating user")
    }
  }

  const handleUpdateArtwork = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedArtwork) return

    try {
      const formData = new FormData(e.currentTarget)
      const updates = {
        title: formData.get('title'),
        price: Number(formData.get('price')),
        category: formData.get('category'),
        medium: formData.get('medium'),
        dimensions: formData.get('dimensions'),
        description: formData.get('description'),
      }

      const res = await fetch(`/api/artworks/${selectedArtwork.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        const { artwork } = await res.json()
        setArtworks(artworks.map(a => a.id === artwork.id ? artwork : a))
        setIsEditModalOpen(false)
        toast.success("Artwork updated successfully")
      } else {
        throw new Error('Failed to update')
      }
    } catch (err) {
      toast.error("Error updating artwork")
    }
  }

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || artwork.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredUsers = users.filter((u) => 
    u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAdmin()) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-strong border-0 p-12 text-center max-w-md shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
            <p className="text-muted-foreground mb-8 text-lg">You don't have administrative privileges to access this panel.</p>
            <Button asChild className="btn-primary w-full py-6 text-lg">
              <a href="/">Return to Homepage</a>
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center gap-6 bg-background">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-xl font-medium text-muted-foreground animate-pulse">Synchronizing Dashboard Data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background/95 selection:bg-primary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b border-white/5">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Admin Command Center</h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground text-lg italic">Signed in as <span className="text-primary font-semibold">{user?.display_name || user?.email}</span></p>
                <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} className="h-8 w-8 hover:bg-white/5">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <Button className="btn-primary px-8 py-6 text-lg shadow-xl shadow-primary/20" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Upload New Masterpiece
            </Button>
          </div>

          {/* Stats Overview with better visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Artworks', value: stats?.totalArtworks, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Registered Users', value: stats?.totalUsers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Global Views', value: stats?.totalViews?.toLocaleString(), icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Active Artists', value: stats?.activeArtists, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card border-0 overflow-hidden relative group hover:bg-white/5 transition-all duration-500">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
                  <CardContent className="p-8 space-y-4">
                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content with enhanced tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="glass-strong rounded-2xl p-1.5 grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="overview" className="rounded-xl py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                Dashboard Overview
              </TabsTrigger>
              <TabsTrigger value="artworks" className="rounded-xl py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                Art Inventory
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white">
                User Network
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="glass-strong border-0 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-white">Recent Movements</CardTitle>
                      <CardDescription className="text-muted-foreground">Latest uploads across the platform</CardDescription>
                    </div>
                    <Activity className="w-6 h-6 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                      <motion.div 
                        key={activity.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-bold text-base block">{activity.title}</span> 
                            <span className="text-muted-foreground italic text-xs">by</span> <span className="text-primary font-medium">{activity.artist_name}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">{new Date(activity.createdAt || activity.created_at).toLocaleDateString()}</p>
                          <ChevronRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-primary transition-colors" />
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-12 space-y-4">
                        <Package className="w-12 h-12 text-white/5 mx-auto" />
                        <p className="text-muted-foreground">No recent activity found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-strong border-0 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-white">Creative Landscape</CardTitle>
                      <CardDescription className="text-muted-foreground">Distribution by artwork category</CardDescription>
                    </div>
                    <PieChart className="w-6 h-6 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {allCategories.map((cat, i) => {
                      const count = categoryDistribution[cat.id] || 0;
                      const percentage = stats?.totalArtworks ? (count / stats.totalArtworks) * 100 : 0;
                      return (
                        <div key={cat.id} className="space-y-2">
                          <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-white flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-primary opacity-${100 - (i * 10)}`} />
                              {cat.label}
                            </span>
                            <span className="text-muted-foreground">{count} pieces</span>
                          </div>
                          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Artworks Tab */}
            <TabsContent value="artworks" className="space-y-6">
              <Card className="glass-strong border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-white">Art Inventory Management</CardTitle>
                      <CardDescription className="text-muted-foreground">Total of {artworks.length} items curated</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center glass p-1 rounded-xl">
                        <Button
                          variant={viewMode === "table" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("table")}
                          className="rounded-lg h-10 px-4"
                        >
                          <TableIcon className="w-4 h-4 mr-2" />
                          List
                        </Button>
                        <Button
                          variant={viewMode === "grid" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="rounded-lg h-10 px-4"
                        >
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Grid
                        </Button>
                      </div>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="Filter art or artist..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 glass border-0 w-64 focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-12 glass border-0 w-48 font-medium">
                          <SelectValue placeholder="All Genres" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-0">
                          <SelectItem value="all">All Genres</SelectItem>
                          {allCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {viewMode === "table" ? (
                    <div className="overflow-x-auto p-2">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold uppercase tracking-wider p-6">Masterpiece</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Genre</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Valuation</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Engagement</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase tracking-wider text-right pr-10">Command</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence mode="popLayout">
                            {filteredArtworks.map((artwork) => (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={artwork.id} 
                                className="border-white/5 hover:bg-white/5 transition-all duration-300 group"
                              >
                                <TableCell className="p-6">
                                  <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform duration-500">
                                      <Image
                                        src={artwork.image_url || "/placeholder.svg"}
                                        alt={artwork.title}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-bold text-white text-lg line-clamp-1">{artwork.title}</div>
                                      <div className="text-sm text-primary font-medium flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3" />
                                        {artwork.artist_name}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/30 text-primary py-1 px-3 tracking-widest bg-primary/5">
                                    {artwork.category.replace('-', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-lg font-bold text-white">
                                    {artwork.price ? `$${artwork.price.toLocaleString()}` : '--'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 bg-blue-500/10 w-fit py-1.5 px-4 rounded-full border border-blue-500/20">
                                    <Eye className="w-4 h-4 text-blue-400" />
                                    <span className="font-bold text-blue-400">{artwork.view_count || 0}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="glass w-10 h-10 hover:bg-emerald-500/20 hover:text-emerald-400 border-0"
                                      onClick={() => {
                                        setSelectedArtwork(artwork)
                                        setIsViewModalOpen(true)
                                      }}
                                    >
                                      <Eye className="w-5 h-5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="glass w-10 h-10 hover:bg-primary/20 hover:text-primary border-0"
                                      onClick={() => {
                                        setSelectedArtwork(artwork)
                                        setIsEditModalOpen(true)
                                      }}
                                    >
                                      <Edit className="w-5 h-5" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="glass w-10 h-10 hover:bg-red-500/20 hover:text-red-500 border-0"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="glass-strong border-0 shadow-2xl scale-105">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-2xl text-white font-bold">Incinerate Masterpiece?</AlertDialogTitle>
                                          <AlertDialogDescription className="text-muted-foreground text-lg py-4">
                                            This action is irreversible. <span className="text-white font-bold">"{artwork.title}"</span> will be permanently purged from the global archives.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-4">
                                          <AlertDialogCancel className="glass border-0 py-6 text-lg">Retain Artwork</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteArtwork(artwork.id)}
                                            className="bg-red-600 hover:bg-red-700 py-6 text-lg font-bold shadow-lg shadow-red-600/20"
                                          >
                                            Confirm Purge
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                  <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:hidden ml-auto" />
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                          {filteredArtworks.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-20">
                                <div className="space-y-4">
                                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-10 h-10 text-muted-foreground" />
                                  </div>
                                  <p className="text-xl text-muted-foreground">No matches found in inventory.</p>
                                  <Button variant="outline" onClick={() => {setSearchTerm(""); setFilterCategory("all")}}>Clear All Filters</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
                      {filteredArtworks.map((artwork, index) => (
                        <div key={artwork.id} className="relative group">
                          <ArtCard
                            artwork={artwork}
                            index={index}
                            variant="dashboard"
                            showActions={false}
                          />
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                            <Button 
                              size="icon" 
                              className="glass bg-black/60 hover:bg-primary/40 border-0 shadow-2xl backdrop-blur-xl"
                              onClick={() => {
                                setSelectedArtwork(artwork)
                                setIsEditModalOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" className="glass bg-black/60 hover:bg-red-500/40 border-0 shadow-2xl backdrop-blur-xl">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-strong border-0 shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Purge Artwork?</AlertDialogTitle>
                                  <AlertDialogDescription>Permanently remove this item from the collection.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="glass border-0">Abort</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteArtwork(artwork.id)} className="bg-red-600 hover:bg-red-700 font-bold">Purge</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="glass-strong border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold text-white">Citizen & Staff Network</CardTitle>
                      <CardDescription className="text-muted-foreground">{users.length} authenticated profiles managed</CardDescription>
                    </div>
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Locate user by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 glass border-0 w-80 focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto p-2">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider p-6">Individual</TableHead>
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Classification</TableHead>
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Portfolio</TableHead>
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider">Joined</TableHead>
                          <TableHead className="text-muted-foreground font-bold uppercase tracking-wider text-right pr-10">Command</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence mode="popLayout">
                          {filteredUsers.map((u) => (
                            <motion.tr 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={u.id} 
                              className="border-white/5 hover:bg-white/5 transition-all duration-300 group"
                            >
                              <TableCell className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-2xl shadow-primary/10 border-2 border-white/5">
                                    {u.avatar_url ? (
                                      <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                      u.display_name?.charAt(0).toUpperCase() || '?'
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-lg">{u.display_name}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                                      <Mail className="w-3 h-3" />
                                      {u.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Select 
                                  defaultValue={u.role} 
                                  onValueChange={(val: any) => handleUpdateUser(u.id, { role: val })}
                                >
                                  <SelectTrigger className="glass border-0 h-9 px-3 text-xs font-bold uppercase tracking-widest w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-strong border-0">
                                    <SelectItem value="user" className="text-xs uppercase font-bold tracking-widest">Citizen</SelectItem>
                                    <SelectItem value="staff" className="text-xs uppercase font-bold tracking-widest text-secondary">Staff</SelectItem>
                                    <SelectItem value="admin" className="text-xs uppercase font-bold tracking-widest text-primary">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2 text-sm text-white font-medium">
                                    <Package className="w-3 h-3 text-primary" />
                                    {u.artwork_count} Artworks
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Eye className="w-3 h-3 text-emerald-400" />
                                    {u.total_views.toLocaleString()} Global Views
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] font-bold uppercase tracking-widest py-1 px-3 ${
                                    u.status === 'active' 
                                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                                      : 'border-red-500/30 text-red-400 bg-red-500/5'
                                  }`}
                                >
                                  {u.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-white font-medium">
                                  {new Date(u.createdAt || u.created_at || Date.now()).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-10">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="glass h-10 px-4 hover:bg-emerald-500/20 hover:text-emerald-500 border-0 flex items-center gap-2"
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setIsUserViewModalOpen(true)
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </Button>
                                  {u.status === 'active' ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="glass h-10 px-4 hover:bg-red-500/20 hover:text-red-500 border-0 flex items-center gap-2"
                                      onClick={() => handleUpdateUser(u.id, { status: 'suspended' })}
                                    >
                                      <UserX className="w-4 h-4" />
                                      Suspend
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="glass h-10 px-4 hover:bg-emerald-500/20 hover:text-emerald-500 border-0 flex items-center gap-2"
                                      onClick={() => handleUpdateUser(u.id, { status: 'active' })}
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      Restore
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Artwork Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-strong border-0 max-w-2xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/5">
            <DialogTitle className="text-3xl font-bold text-white">Refine Masterpiece</DialogTitle>
            <CardDescription className="text-muted-foreground text-lg">Modify details for <span className="text-primary italic font-medium">{selectedArtwork?.title}</span></CardDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateArtwork}>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Masterpiece Title</Label>
                  <Input name="title" defaultValue={selectedArtwork?.title} className="h-12 glass border-0 focus:ring-2 focus:ring-primary/50 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Market Valuation ($)</Label>
                  <Input name="price" type="number" defaultValue={selectedArtwork?.price} className="h-12 glass border-0 focus:ring-2 focus:ring-primary/50 text-white font-mono text-lg" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Art Genre</Label>
                  <Select name="category" defaultValue={selectedArtwork?.category}>
                    <SelectTrigger className="h-12 glass border-0 text-white font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-0">
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Artistic Medium</Label>
                  <Input name="medium" defaultValue={selectedArtwork?.medium} className="h-12 glass border-0 focus:ring-2 focus:ring-primary/50 text-white" placeholder="e.g., Oil on Canvas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Spatial Dimensions</Label>
                  <Input name="dimensions" defaultValue={selectedArtwork?.dimensions} className="h-12 glass border-0 focus:ring-2 focus:ring-primary/50 text-white" placeholder='e.g., 24" x 36"' />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Narrative & Description</Label>
                <Textarea name="description" defaultValue={selectedArtwork?.description || ''} rows={5} className="glass border-0 focus:ring-2 focus:ring-primary/50 text-white leading-relaxed p-4" />
              </div>
            </div>
            <DialogFooter className="bg-white/5 p-8 border-t border-white/5 gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="px-8 h-14 text-lg hover:bg-white/5 text-muted-foreground hover:text-white">
                Abort Changes
              </Button>
              <Button type="submit" className="btn-primary px-10 h-14 text-lg shadow-xl shadow-primary/20">
                <Save className="w-5 h-5 mr-2" />
                Commit Updates
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Artwork Modal Placeholder - Reuse logic from edit or link to upload page */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="glass-strong border-0 max-w-2xl shadow-2xl p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">System Expansion</h2>
            <p className="text-muted-foreground text-lg italic">The administrative upload gateway is being optimized for batch processing.</p>
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild className="btn-primary py-8 text-xl font-bold shadow-2xl shadow-primary/20">
              <a href="/upload">Proceed to Universal Upload Gateway</a>
            </Button>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="h-14 text-muted-foreground hover:text-white text-lg">
              Remain in Command Center
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Artwork Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="glass-strong border-0 max-w-4xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-white/5 p-8 border-b border-white/5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-bold text-white">{selectedArtwork?.title}</DialogTitle>
                <CardDescription className="text-primary text-lg font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {selectedArtwork?.artist_name}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold uppercase border-primary/30 text-primary py-1 px-4 tracking-widest bg-primary/5">
                {selectedArtwork?.category.replace('-', ' ')}
              </Badge>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative aspect-square md:aspect-auto h-full min-h-[400px]">
              <Image
                src={selectedArtwork?.image_url || "/placeholder.svg"}
                alt={selectedArtwork?.title || "Artwork"}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 space-y-8 bg-white/5 overflow-y-auto max-h-[600px]">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">Description</h4>
                <p className="text-white leading-relaxed text-lg italic">
                  {selectedArtwork?.description || "No description provided for this masterpiece."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market Value</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {selectedArtwork?.price ? `$${selectedArtwork.price.toLocaleString()}` : "Price on Request"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Engagement</p>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Eye className="w-5 h-5" />
                    <p className="text-2xl font-bold">{selectedArtwork?.view_count || 0}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Artistic Medium</p>
                  <p className="text-lg text-white font-medium">{selectedArtwork?.medium || "Mixed Media"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Spatial Dimensions</p>
                  <p className="text-lg text-white font-medium">{selectedArtwork?.dimensions || "Variable"}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Digital Signature</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate opacity-50">{selectedArtwork?.id}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white/5 p-6 border-t border-white/5">
            <Button onClick={() => setIsViewModalOpen(false)} className="btn-primary px-8">
              Conclude Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isUserViewModalOpen} onOpenChange={setIsUserViewModalOpen}>
        <DialogContent className="glass-strong border-0 max-w-2xl shadow-2xl p-0 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/5">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-4xl overflow-hidden shadow-2xl border-4 border-background">
                {selectedUser?.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt={selectedUser.display_name} className="w-full h-full object-cover" />
                ) : (
                  selectedUser?.display_name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
            </div>
            <div className="absolute bottom-4 right-8">
              <Badge 
                className={`text-[10px] font-bold uppercase tracking-widest py-1 px-4 ${
                  selectedUser?.status === 'active' 
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                    : 'border-red-500/30 text-red-400 bg-red-500/10'
                }`}
              >
                {selectedUser?.status}
              </Badge>
            </div>
          </div>
          <div className="p-8 pt-16 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-white">{selectedUser?.display_name}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  {selectedUser?.email}
                </p>
              </div>
              <Badge className={`text-xs font-bold uppercase py-1.5 px-4 tracking-widest ${
                selectedUser?.role === 'admin' ? 'bg-primary shadow-lg shadow-primary/20' : 
                selectedUser?.role === 'staff' ? 'bg-secondary' : 'bg-white/10'
              }`}>
                {selectedUser?.role}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass p-4 rounded-2xl text-center space-y-1 group hover:bg-white/5 transition-colors">
                <Package className="w-5 h-5 text-primary mx-auto opacity-50" />
                <p className="text-2xl font-bold text-white">{selectedUser?.artwork_count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Artworks</p>
              </div>
              <div className="glass p-4 rounded-2xl text-center space-y-1 group hover:bg-white/5 transition-colors">
                <Eye className="w-5 h-5 text-emerald-400 mx-auto opacity-50" />
                <p className="text-2xl font-bold text-white">{selectedUser?.total_views.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Views</p>
              </div>
              <div className="glass p-4 rounded-2xl text-center space-y-1 group hover:bg-white/5 transition-colors">
                <Calendar className="w-5 h-5 text-purple-400 mx-auto opacity-50" />
                <p className="text-lg font-bold text-white">
                  {selectedUser?.createdAt ? new Date(selectedUser.createdAt).getFullYear() : '2024'}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Member Since</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Network Directives</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedUser?.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-12 px-6 rounded-xl"
                    onClick={() => {
                      if (selectedUser) handleUpdateUser(selectedUser.id, { status: 'suspended' })
                      setIsUserViewModalOpen(false)
                    }}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 h-12 px-6 rounded-xl"
                    onClick={() => {
                      if (selectedUser) handleUpdateUser(selectedUser.id, { status: 'active' })
                      setIsUserViewModalOpen(false)
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Restore Account
                  </Button>
                )}
                {selectedUser?.role !== 'admin' && (
                  <Button 
                    variant="outline" 
                    className="border-primary/20 text-primary hover:bg-primary/10 h-12 px-6 rounded-xl"
                    onClick={() => {
                      if (selectedUser) handleUpdateUser(selectedUser.id, { role: selectedUser.role === 'staff' ? 'user' : 'staff' })
                      setIsUserViewModalOpen(false)
                    }}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {selectedUser?.role === 'staff' ? 'Revoke Staff Access' : 'Promote to Staff'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white/5 p-6 border-t border-white/5">
            <Button onClick={() => setIsUserViewModalOpen(false)} variant="ghost" className="hover:bg-white/5">
              Close Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
