"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Table as TableIcon
} from "lucide-react"
import { toast } from "sonner"

interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  price: number
  category: string
  medium: string
  dimensions: string
  year: number
  images: string[]
  featured: boolean
  inStock: boolean
  stockQuantity: number
  tags: string[]
  rating: number
  likes: number
  views: number
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  artworkTitle: string
  artworkId: string
  amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  shippingAddress: string
  paymentMethod: string
  trackingNumber?: string
  notes?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  totalOrders: number
  totalSpent: number
  joinDate: string
  status: "active" | "inactive"
  lastOrderDate?: string
  preferredCategories: string[]
  avatar?: string
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  // Mock data - in real app, this would come from API
  const [artworks, setArtworks] = useState<Artwork[]>([
    {
      id: "1",
      title: "Ethereal Dreams",
      artist: "Elena Vasquez",
      description: "A mesmerizing abstract piece that captures the essence of dreams and imagination.",
      price: 2500,
      category: "Abstract",
      medium: "Oil on Canvas",
      dimensions: '36" x 48"',
      year: 2024,
      images: ["/placeholder.svg?height=400&width=400&text=Ethereal+Dreams"],
      featured: true,
      inStock: true,
      stockQuantity: 1,
      tags: ["abstract", "colorful", "modern"],
      rating: 4.9,
      likes: 234,
      views: 1250,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
    },
    {
      id: "2",
      title: "Digital Harmony",
      artist: "Elena Vasquez",
      description: "A stunning digital artwork exploring the harmony between technology and nature.",
      price: 1800,
      category: "Digital Art",
      medium: "Digital Print",
      dimensions: '24" x 32"',
      year: 2024,
      images: ["/placeholder.svg?height=400&width=400&text=Digital+Harmony"],
      featured: true,
      inStock: true,
      stockQuantity: 3,
      tags: ["digital", "nature", "technology"],
      rating: 4.8,
      likes: 189,
      views: 980,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
    },
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "John Smith",
      customerEmail: "john@example.com",
      customerPhone: "+1 (555) 123-4567",
      artworkTitle: "Ethereal Dreams",
      artworkId: "1",
      amount: 2500,
      status: "delivered",
      date: "2024-01-15",
      shippingAddress: "123 Art St, New York, NY 10001",
      paymentMethod: "Credit Card",
      trackingNumber: "TRK123456789",
      notes: "Customer requested special packaging",
    },
    {
      id: "ORD-002",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      customerPhone: "+1 (555) 234-5678",
      artworkTitle: "Digital Harmony",
      artworkId: "2",
      amount: 1800,
      status: "shipped",
      date: "2024-01-18",
      shippingAddress: "456 Gallery Ave, Los Angeles, CA 90210",
      paymentMethod: "PayPal",
      trackingNumber: "TRK987654321",
    },
  ])

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "CUST-001",
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      totalOrders: 3,
      totalSpent: 7500,
      joinDate: "2023-06-15",
      status: "active",
      lastOrderDate: "2024-01-15",
      preferredCategories: ["Abstract", "Sculpture"],
    },
    {
      id: "CUST-002",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, CA",
      totalOrders: 2,
      totalSpent: 4200,
      joinDate: "2023-08-22",
      status: "active",
      lastOrderDate: "2024-01-18",
      preferredCategories: ["Digital Art", "Photography"],
    },
  ])

  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
    totalArtworks: artworks.length,
    totalCustomers: customers.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.amount, 0) / orders.length : 0,
    topCategory: "Abstract",
    conversionRate: 3.2,
  }

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || artwork.category.toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  if (!isAdmin()) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <Card className="glass-card rounded-3xl p-12 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access the admin panel.</p>
          <Button asChild className="btn-primary">
            <a href="/">Go Home</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container-padding">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Welcome back, {user?.display_name || user?.email}</p>
            </div>
            <Button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Artwork
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-gradient-violet">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Artworks</p>
                    <p className="text-2xl font-bold text-gradient-aqua">{stats.totalArtworks}</p>
                    <p className="text-xs text-green-600 mt-1">+3 this month</p>
                  </div>
                  <Package className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold text-gradient-violet">{stats.totalCustomers}</p>
                    <p className="text-xs text-green-600 mt-1">+8 this month</p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gradient-aqua">{stats.conversionRate}%</p>
                    <p className="text-xs text-green-600 mt-1">+0.3% from last month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="glass-strong rounded-2xl p-1 grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview" className="rounded-xl">
                Overview
              </TabsTrigger>
              <TabsTrigger value="artworks" className="rounded-xl">
                Artworks
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-xl">
                Orders
              </TabsTrigger>
              <TabsTrigger value="customers" className="rounded-xl">
                Customers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl">
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card rounded-3xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">New order from John Smith</span>
                      <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Artwork "Digital Dreams" updated</span>
                      <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 glass rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">New customer registration</span>
                      <span className="text-xs text-muted-foreground ml-auto">6h ago</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-3xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Top Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Abstract Art</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-3/4 h-full gradient-violet rounded-full" />
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Digital Art</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-3/5 h-full gradient-aqua rounded-full" />
                        </div>
                        <span className="text-sm font-medium">30%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sculptures</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/4 h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" />
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Artworks Tab */}
            <TabsContent value="artworks" className="space-y-6">
              <Card className="glass-card rounded-3xl border-0">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <CardTitle>Artwork Management</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-2 mr-2">
                        <Button
                          variant={viewMode === "table" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setViewMode("table")}
                          className={viewMode === "table" ? "btn-primary" : "glass border-0"}
                        >
                          <TableIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === "grid" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className={viewMode === "grid" ? "btn-primary" : "glass border-0"}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search artworks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 glass border-0"
                        />
                      </div>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40 glass border-0">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-0">
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="digital art">Digital Art</SelectItem>
                          <SelectItem value="sculpture">Sculpture</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {viewMode === "table" ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10">
                            <TableHead>Artwork</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Performance</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredArtworks.map((artwork) => (
                            <TableRow key={artwork.id} className="border-white/10">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                    <Image
                                      src={artwork.images[0] || "/placeholder.svg"}
                                      alt={artwork.title}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{artwork.title}</div>
                                    <div className="text-sm text-muted-foreground">by {artwork.artist}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="gradient-violet text-white border-0">{artwork.category}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">${artwork.price.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={artwork.stockQuantity > 0 ? "default" : "destructive"}>
                                  {artwork.stockQuantity} in stock
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-green-400 text-green-400" />
                                    <span>{artwork.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span>{artwork.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                    <span>{artwork.views}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="glass w-8 h-8 border-0 bg-transparent"
                                    onClick={() => {
                                      setSelectedItem(artwork)
                                      setIsEditModalOpen(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="glass w-8 h-8 border-0 hover:bg-red-500/10 hover:text-red-600 bg-transparent"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-strong border-0">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{artwork.title}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="glass border-0">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            setArtworks((prev) => prev.filter((a) => a.id !== artwork.id))
                                            toast.success("Artwork deleted successfully")
                                          }}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredArtworks.map((artwork, index) => (
                        <ArtCard
                          key={artwork.id}
                          artwork={{
                            ...artwork,
                            image_url: artwork.images[0],
                            artist_name: artwork.artist,
                            artist_id: "admin", // Placeholder for admin view
                            view_count: artwork.views,
                            stock_quantity: artwork.stockQuantity,
                            created_at: artwork.createdAt,
                            updated_at: artwork.updatedAt,
                            category: artwork.category.toLowerCase().replace(" ", "-") as any,
                            image_path: ""
                          }}
                          index={index}
                          variant="dashboard"
                          showActions={true}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="glass-card rounded-3xl border-0">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <CardTitle>Order Management</CardTitle>
                    <div className="flex gap-3">
                      <Button variant="outline" className="glass border-0 bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" className="glass border-0 bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Artwork</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-white/10">
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                              </div>
                            </TableCell>
                            <TableCell>{order.artworkTitle}</TableCell>
                            <TableCell className="font-medium">${order.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${order.status === "delivered"
                                  ? "bg-green-500"
                                  : order.status === "shipped"
                                    ? "bg-blue-500"
                                    : order.status === "processing"
                                      ? "bg-green-500"
                                      : "bg-blue-400"
                                  } text-white border-0`}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="icon" className="glass w-8 h-8 border-0 bg-transparent">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <Card className="glass-card rounded-3xl border-0">
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id} className="border-white/10">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 gradient-violet-aqua rounded-full flex items-center justify-center text-white font-medium">
                                  {customer.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">{customer.location}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {customer.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {customer.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{customer.totalOrders}</TableCell>
                            <TableCell className="font-medium">${customer.totalSpent.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  customer.status === "active"
                                    ? "bg-green-500 text-white border-0"
                                    : "bg-gray-500 text-white border-0"
                                }
                              >
                                {customer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="glass w-8 h-8 border-0 bg-transparent">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="glass w-8 h-8 border-0 bg-transparent">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card rounded-3xl border-0">
                  <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span>This Month</span>
                      <span className="text-2xl font-bold text-gradient-violet">$12,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Last Month</span>
                      <span className="text-xl font-semibold">$10,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Growth</span>
                      <span className="text-xl font-semibold text-green-600">+22.5%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="gradient-violet h-3 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-3xl border-0">
                  <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span>New Customers</span>
                      <span className="text-2xl font-bold text-gradient-aqua">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Returning Customers</span>
                      <span className="text-xl font-semibold">28</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Retention Rate</span>
                      <span className="text-xl font-semibold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="gradient-aqua h-3 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Add Artwork Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="glass-strong border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Artwork</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Artwork title" className="glass border-0 mt-2" />
              </div>
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input id="artist" placeholder="Artist name" className="glass border-0 mt-2" />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" placeholder="0" className="glass border-0 mt-2" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="glass border-0 mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-0">
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="digital">Digital Art</SelectItem>
                    <SelectItem value="sculpture">Sculpture</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="medium">Medium</Label>
                <Input id="medium" placeholder="e.g., Oil on Canvas" className="glass border-0 mt-2" />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" placeholder="e.g., 24&quot; x 36&quot;" className="glass border-0 mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Artwork description" rows={4} className="glass border-0 mt-2" />
            </div>
            <div>
              <Label>Images</Label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center mt-2">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
                <Button variant="outline" className="glass border-0 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => {
                  setIsAddModalOpen(false)
                  toast.success("Artwork added successfully")
                }}
                className="btn-primary flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Artwork
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="glass border-0">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
