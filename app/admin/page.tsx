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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { sampleArtworks } from "@/lib/data"
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
  X,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Upload,
  FileImage,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

interface AboutContent {
  biography: string
  mission: string
  achievements: string[]
  exhibitions: string[]
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  socialMedia: {
    instagram: string
    facebook: string
    twitter: string
  }
  profileImage: string
  studioImages: string[]
}

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
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>(sampleArtworks as Artwork[])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Sample orders data with more comprehensive information
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
    {
      id: "ORD-003",
      customerName: "Michael Brown",
      customerEmail: "michael@example.com",
      customerPhone: "+1 (555) 345-6789",
      artworkTitle: "Abstract Emotions",
      artworkId: "3",
      amount: 3200,
      status: "processing",
      date: "2024-01-20",
      shippingAddress: "789 Museum Blvd, Chicago, IL 60601",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "ORD-004",
      customerName: "Emily Davis",
      customerEmail: "emily@example.com",
      customerPhone: "+1 (555) 456-7890",
      artworkTitle: "Cosmic Reflections",
      artworkId: "4",
      amount: 2100,
      status: "pending",
      date: "2024-01-22",
      shippingAddress: "321 Creative Dr, Miami, FL 33101",
      paymentMethod: "Credit Card",
      notes: "Rush delivery requested",
    },
  ])

  // Sample customers data with enhanced information
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
      preferredCategories: ["painting", "sculpture"],
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
      preferredCategories: ["digital", "photography"],
    },
    {
      id: "CUST-003",
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+1 (555) 345-6789",
      location: "Chicago, IL",
      totalOrders: 1,
      totalSpent: 3200,
      joinDate: "2023-11-10",
      status: "active",
      lastOrderDate: "2024-01-20",
      preferredCategories: ["painting"],
    },
    {
      id: "CUST-004",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1 (555) 456-7890",
      location: "Miami, FL",
      totalOrders: 1,
      totalSpent: 2100,
      joinDate: "2024-01-05",
      status: "active",
      lastOrderDate: "2024-01-22",
      preferredCategories: ["digital", "sculpture"],
    },
  ])

  // About content management with enhanced fields
  const [aboutContent, setAboutContent] = useState<AboutContent>({
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
      "Ethereal Visions - Metropolitan Gallery, New York (2024)",
      "Contemporary Voices - Modern Art Museum, Los Angeles (2023)",
      "Digital Renaissance - Tech Art Center, San Francisco (2023)",
      "Emerging Artists Showcase - International Art Fair, Miami (2022)",
      "Color and Form - Barcelona Contemporary Gallery (2021)",
      "New Perspectives - London Art Week (2020)",
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
  })

  const [newArtwork, setNewArtwork] = useState<Partial<Artwork>>({
    title: "",
    artist: "Elena Vasquez",
    description: "",
    price: 0,
    category: "painting",
    medium: "",
    dimensions: "",
    year: new Date().getFullYear(),
    images: [],
    featured: false,
    inStock: true,
    stockQuantity: 1,
    tags: [],
  })

  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
    totalArtworks: artworks.length,
    totalCustomers: customers.length,
    monthlyGrowth: 12.5,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    activeCustomers: customers.filter((customer) => customer.status === "active").length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.amount, 0) / orders.length : 0,
    conversionRate: 3.2,
  }

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || artwork.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleEditArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsEditModalOpen(true)
  }

  const handleDeleteArtwork = (artworkId: string) => {
    setArtworks((prev) => prev.filter((artwork) => artwork.id !== artworkId))
    toast({
      title: "Artwork Deleted",
      description: "The artwork has been successfully removed.",
    })
  }

  const handleSaveArtwork = (updatedArtwork: Artwork) => {
    setArtworks((prev) =>
      prev.map((artwork) =>
        artwork.id === updatedArtwork.id ? { ...updatedArtwork, updatedAt: new Date().toISOString() } : artwork,
      ),
    )
    setIsEditModalOpen(false)
    setSelectedArtwork(null)
    toast({
      title: "Artwork Updated",
      description: "The artwork has been successfully updated.",
    })
  }

  const handleAddArtwork = () => {
    const artwork: Artwork = {
      ...newArtwork,
      id: `artwork-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Artwork

    setArtworks((prev) => [artwork, ...prev])
    setNewArtwork({
      title: "",
      artist: "Elena Vasquez",
      description: "",
      price: 0,
      category: "painting",
      medium: "",
      dimensions: "",
      year: new Date().getFullYear(),
      images: [],
      featured: false,
      inStock: true,
      stockQuantity: 1,
      tags: [],
    })
    setIsAddModalOpen(false)
    toast({
      title: "Artwork Added",
      description: "New artwork has been successfully added to the collection.",
    })
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              trackingNumber:
                newStatus === "shipped" && !order.trackingNumber ? `TRK${Date.now()}` : order.trackingNumber,
            }
          : order,
      ),
    )
    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}.`,
    })
  }

  const handleUpdateAbout = () => {
    toast({
      title: "About Section Updated",
      description: "Your about information has been saved successfully.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      case "pending":
        return "bg-orange-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "processing":
        return <Package2 className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen pt-20 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto mobile-padding py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name}</p>
              </div>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-gold text-white mobile-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Artwork
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Artwork</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-title">Title</Label>
                        <Input
                          id="new-title"
                          value={newArtwork.title}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter artwork title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-price">Price ($)</Label>
                        <Input
                          id="new-price"
                          type="number"
                          value={newArtwork.price}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-category">Category</Label>
                        <Select
                          value={newArtwork.category}
                          onValueChange={(value) => setNewArtwork((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="painting">Painting</SelectItem>
                            <SelectItem value="digital">Digital Art</SelectItem>
                            <SelectItem value="sculpture">Sculpture</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-medium">Medium</Label>
                        <Input
                          id="new-medium"
                          value={newArtwork.medium}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, medium: e.target.value }))}
                          placeholder="e.g., Oil on Canvas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-dimensions">Dimensions</Label>
                        <Input
                          id="new-dimensions"
                          value={newArtwork.dimensions}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, dimensions: e.target.value }))}
                          placeholder="e.g., 24&quot; x 36&quot;"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-year">Year</Label>
                        <Input
                          id="new-year"
                          type="number"
                          value={newArtwork.year}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, year: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-stock">Stock Quantity</Label>
                        <Input
                          id="new-stock"
                          type="number"
                          value={newArtwork.stockQuantity}
                          onChange={(e) =>
                            setNewArtwork((prev) => ({ ...prev, stockQuantity: Number(e.target.value) }))
                          }
                          min="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="new-featured"
                          checked={newArtwork.featured}
                          onChange={(e) => setNewArtwork((prev) => ({ ...prev, featured: e.target.checked }))}
                        />
                        <Label htmlFor="new-featured">Featured Artwork</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-description">Description</Label>
                      <Textarea
                        id="new-description"
                        value={newArtwork.description}
                        onChange={(e) => setNewArtwork((prev) => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Enter artwork description"
                      />
                    </div>
                    <div>
                      <Label>Images</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <FileImage className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button onClick={handleAddArtwork} className="gradient-gold text-white">
                        <Save className="mr-2 h-4 w-4" />
                        Add Artwork
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="card-3d">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="card-3d">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">{stats.totalArtworks}</div>
                    <p className="text-xs text-muted-foreground">+5 new this month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="card-3d">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">{stats.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">{stats.activeCustomers} active</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="card-3d">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">${stats.averageOrderValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+{stats.conversionRate}% conversion</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="artworks" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
                <TabsTrigger value="artworks" className="mobile-text">
                  Artworks
                </TabsTrigger>
                <TabsTrigger value="orders" className="mobile-text">
                  Orders ({stats.pendingOrders})
                </TabsTrigger>
                <TabsTrigger value="customers" className="mobile-text">
                  Customers
                </TabsTrigger>
                <TabsTrigger value="analytics" className="mobile-text">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="about" className="mobile-text">
                  About
                </TabsTrigger>
              </TabsList>

              {/* Artworks Management */}
              <TabsContent value="artworks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <CardTitle>Artwork Management</CardTitle>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search artworks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full sm:w-64"
                          />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="painting">Painting</SelectItem>
                            <SelectItem value="digital">Digital Art</SelectItem>
                            <SelectItem value="sculpture">Sculpture</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden md:table-cell">Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead className="hidden lg:table-cell">Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredArtworks.map((artwork) => (
                            <TableRow key={artwork.id}>
                              <TableCell>
                                <div className="relative w-12 h-12">
                                  <Image
                                    src={artwork.images[0] || "/placeholder.svg?height=48&width=48"}
                                    alt={artwork.title}
                                    fill
                                    className="object-cover rounded-md"
                                    sizes="48px"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{artwork.title}</div>
                                  <div className="text-sm text-muted-foreground hidden sm:block">{artwork.artist}</div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary" className="capitalize">
                                  {artwork.category}
                                </Badge>
                              </TableCell>
                              <TableCell>${artwork.price.toLocaleString()}</TableCell>
                              <TableCell className="hidden md:table-cell">{artwork.stockQuantity}</TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <Badge variant={artwork.inStock ? "default" : "destructive"}>
                                    {artwork.inStock ? "In Stock" : "Out of Stock"}
                                  </Badge>
                                  {artwork.featured && (
                                    <Badge className="bg-gold/20 text-gold border-gold/30">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditArtwork(artwork)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{artwork.title}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteArtwork(artwork.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Orders Management */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <CardTitle>Order Management</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Artwork</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden lg:table-cell">Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{order.customerName}</div>
                                  <div className="text-sm text-muted-foreground hidden sm:block">
                                    {order.customerEmail}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{order.artworkTitle}</TableCell>
                              <TableCell>${order.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order["status"])}
                                >
                                  <SelectTrigger className="w-32">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(order.status)}
                                      <SelectValue />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{order.date}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setSelectedOrder(order)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Order Details - {order.id}</DialogTitle>
                                      </DialogHeader>
                                      {selectedOrder && (
                                        <div className="space-y-6">
                                          <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="font-semibold mb-2">Customer Information</h4>
                                              <div className="space-y-1 text-sm">
                                                <p>
                                                  <strong>Name:</strong> {selectedOrder.customerName}
                                                </p>
                                                <p>
                                                  <strong>Email:</strong> {selectedOrder.customerEmail}
                                                </p>
                                                <p>
                                                  <strong>Phone:</strong> {selectedOrder.customerPhone}
                                                </p>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold mb-2">Order Information</h4>
                                              <div className="space-y-1 text-sm">
                                                <p>
                                                  <strong>Date:</strong> {selectedOrder.date}
                                                </p>
                                                <p>
                                                  <strong>Amount:</strong> ${selectedOrder.amount.toLocaleString()}
                                                </p>
                                                <p>
                                                  <strong>Payment:</strong> {selectedOrder.paymentMethod}
                                                </p>
                                                {selectedOrder.trackingNumber && (
                                                  <p>
                                                    <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                                            <p className="text-sm">{selectedOrder.shippingAddress}</p>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold mb-2">Artwork</h4>
                                            <p className="text-sm">{selectedOrder.artworkTitle}</p>
                                          </div>
                                          {selectedOrder.notes && (
                                            <div>
                                              <h4 className="font-semibold mb-2">Notes</h4>
                                              <p className="text-sm">{selectedOrder.notes}</p>
                                            </div>
                                          )}
                                          <div className="flex items-center gap-2">
                                            <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                                              {getStatusIcon(selectedOrder.status)}
                                              <span className="ml-1 capitalize">{selectedOrder.status}</span>
                                            </Badge>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
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

              {/* Enhanced Customers Management */}
              <TabsContent value="customers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Contact</TableHead>
                            <TableHead className="hidden lg:table-cell">Location</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead className="hidden md:table-cell">Last Order</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                                  <Badge
                                    variant={customer.status === "active" ? "default" : "secondary"}
                                    className="mt-1 text-xs"
                                  >
                                    {customer.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {customer.location}
                                </div>
                              </TableCell>
                              <TableCell>{customer.totalOrders}</TableCell>
                              <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {customer.lastOrderDate && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3" />
                                    {customer.lastOrderDate}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setSelectedCustomer(customer)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Customer Details - {customer.name}</DialogTitle>
                                      </DialogHeader>
                                      {selectedCustomer && (
                                        <div className="space-y-6">
                                          <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                              <h4 className="font-semibold mb-2">Contact Information</h4>
                                              <div className="space-y-1 text-sm">
                                                <p>
                                                  <strong>Name:</strong> {selectedCustomer.name}
                                                </p>
                                                <p>
                                                  <strong>Email:</strong> {selectedCustomer.email}
                                                </p>
                                                <p>
                                                  <strong>Phone:</strong> {selectedCustomer.phone}
                                                </p>
                                                <p>
                                                  <strong>Location:</strong> {selectedCustomer.location}
                                                </p>
                                              </div>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold mb-2">Purchase History</h4>
                                              <div className="space-y-1 text-sm">
                                                <p>
                                                  <strong>Total Orders:</strong> {selectedCustomer.totalOrders}
                                                </p>
                                                <p>
                                                  <strong>Total Spent:</strong> $
                                                  {selectedCustomer.totalSpent.toLocaleString()}
                                                </p>
                                                <p>
                                                  <strong>Join Date:</strong> {selectedCustomer.joinDate}
                                                </p>
                                                {selectedCustomer.lastOrderDate && (
                                                  <p>
                                                    <strong>Last Order:</strong> {selectedCustomer.lastOrderDate}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold mb-2">Preferred Categories</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {selectedCustomer.preferredCategories.map((category) => (
                                                <Badge key={category} variant="secondary" className="capitalize">
                                                  {category}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant={selectedCustomer.status === "active" ? "default" : "secondary"}
                                            >
                                              {selectedCustomer.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Mail className="h-4 w-4" />
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

              {/* Enhanced Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="responsive-grid">
                  <Card className="card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sales Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>This Month</span>
                          <span className="font-semibold text-gold">$12,500</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Last Month</span>
                          <span className="font-semibold">$10,200</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Growth</span>
                          <span className="font-semibold text-green-500">+22.5%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-gold h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Top Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Paintings</span>
                          <span className="font-semibold">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Digital Art</span>
                          <span className="font-semibold">30%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sculptures</span>
                          <span className="font-semibold">25%</span>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Customer Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>New Customers</span>
                          <span className="font-semibold text-gold">15</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Returning</span>
                          <span className="font-semibold">28</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Retention Rate</span>
                          <span className="font-semibold text-green-500">85%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-3d">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Conversion Rate</span>
                          <span className="font-semibold text-gold">{stats.conversionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Avg Order Value</span>
                          <span className="font-semibold">${stats.averageOrderValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Monthly Growth</span>
                          <span className="font-semibold text-green-500">+{stats.monthlyGrowth}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>New order received from John Smith</span>
                        <span className="text-sm text-muted-foreground ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Artwork "Digital Dreams" updated</span>
                        <span className="text-sm text-muted-foreground ml-auto">4 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>New customer registration</span>
                        <span className="text-sm text-muted-foreground ml-auto">6 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Order shipped to Sarah Johnson</span>
                        <span className="text-sm text-muted-foreground ml-auto">1 day ago</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Low stock alert: "Abstract Emotions"</span>
                        <span className="text-sm text-muted-foreground ml-auto">2 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced About Management */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Section Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="biography">Artist Biography</Label>
                        <Textarea
                          id="biography"
                          value={aboutContent.biography}
                          onChange={(e) => setAboutContent((prev) => ({ ...prev, biography: e.target.value }))}
                          rows={6}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="mission">Mission Statement</Label>
                        <Textarea
                          id="mission"
                          value={aboutContent.mission}
                          onChange={(e) => setAboutContent((prev) => ({ ...prev, mission: e.target.value }))}
                          rows={4}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Profile Image</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={aboutContent.profileImage || "/placeholder.svg?height=96&width=96"}
                              alt="Profile"
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Change Image
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Achievements</Label>
                        <div className="space-y-2 mt-2">
                          {aboutContent.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={achievement}
                                onChange={(e) => {
                                  const newAchievements = [...aboutContent.achievements]
                                  newAchievements[index] = e.target.value
                                  setAboutContent((prev) => ({ ...prev, achievements: newAchievements }))
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newAchievements = aboutContent.achievements.filter((_, i) => i !== index)
                                  setAboutContent((prev) => ({ ...prev, achievements: newAchievements }))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAboutContent((prev) => ({
                                ...prev,
                                achievements: [...prev.achievements, ""],
                              }))
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Achievement
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>Exhibitions</Label>
                        <div className="space-y-2 mt-2">
                          {aboutContent.exhibitions.map((exhibition, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={exhibition}
                                onChange={(e) => {
                                  const newExhibitions = [...aboutContent.exhibitions]
                                  newExhibitions[index] = e.target.value
                                  setAboutContent((prev) => ({ ...prev, exhibitions: newExhibitions }))
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newExhibitions = aboutContent.exhibitions.filter((_, i) => i !== index)
                                  setAboutContent((prev) => ({ ...prev, exhibitions: newExhibitions }))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAboutContent((prev) => ({
                                ...prev,
                                exhibitions: [...prev.exhibitions, ""],
                              }))
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Exhibition
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="email">Contact Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={aboutContent.contactInfo.email}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                contactInfo: { ...prev.contactInfo, email: e.target.value },
                              }))
                            }
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Contact Phone</Label>
                          <Input
                            id="phone"
                            value={aboutContent.contactInfo.phone}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                contactInfo: { ...prev.contactInfo, phone: e.target.value },
                              }))
                            }
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={aboutContent.contactInfo.address}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                contactInfo: { ...prev.contactInfo, address: e.target.value },
                              }))
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={aboutContent.socialMedia.instagram}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, instagram: e.target.value },
                              }))
                            }
                            className="mt-2"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={aboutContent.socialMedia.facebook}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, facebook: e.target.value },
                              }))
                            }
                            className="mt-2"
                            placeholder="Page Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            value={aboutContent.socialMedia.twitter}
                            onChange={(e) =>
                              setAboutContent((prev) => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, twitter: e.target.value },
                              }))
                            }
                            className="mt-2"
                            placeholder="@username"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Studio Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                          {aboutContent.studioImages.map((image, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={image || "/placeholder.svg?height=200&width=200"}
                                alt={`Studio ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                                onClick={() => {
                                  const newImages = aboutContent.studioImages.filter((_, i) => i !== index)
                                  setAboutContent((prev) => ({ ...prev, studioImages: newImages }))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                            <Button variant="outline">
                              <Upload className="w-4 h-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleUpdateAbout} className="gradient-gold text-white">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Edit Artwork Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Artwork</DialogTitle>
            </DialogHeader>
            {selectedArtwork && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={selectedArtwork.title}
                      onChange={(e) => setSelectedArtwork((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={selectedArtwork.price}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, price: Number(e.target.value) } : null))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={selectedArtwork.category}
                      onValueChange={(value) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, category: value } : null))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="digital">Digital Art</SelectItem>
                        <SelectItem value="sculpture">Sculpture</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-medium">Medium</Label>
                    <Input
                      id="edit-medium"
                      value={selectedArtwork.medium}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, medium: e.target.value } : null))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-dimensions">Dimensions</Label>
                    <Input
                      id="edit-dimensions"
                      value={selectedArtwork.dimensions}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, dimensions: e.target.value } : null))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-year">Year</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={selectedArtwork.year}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, year: Number(e.target.value) } : null))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={selectedArtwork.stockQuantity}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, stockQuantity: Number(e.target.value) } : null))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={selectedArtwork.featured}
                      onChange={(e) =>
                        setSelectedArtwork((prev) => (prev ? { ...prev, featured: e.target.checked } : null))
                      }
                    />
                    <Label htmlFor="edit-featured">Featured Artwork</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedArtwork.description}
                    onChange={(e) =>
                      setSelectedArtwork((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {selectedArtwork.images.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={image || "/placeholder.svg?height=200&width=200"}
                          alt={`${selectedArtwork.title} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => selectedArtwork && handleSaveArtwork(selectedArtwork)}
                    className="gradient-gold text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
