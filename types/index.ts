export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  price: number
  category: "painting" | "digital" | "sculpture" | "photography"
  images: string[]
  inStock: boolean
  stockQuantity: number
  dimensions?: string
  medium?: string
  year?: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "admin"
  createdAt: string
}

export interface CartItem {
  artwork: Artwork
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
}
