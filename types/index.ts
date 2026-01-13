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

// Supabase-specific types for public art upload system
export interface ArtworkUpload {
  title: string
  description: string
  category: ArtworkCategory
  image_file: File
}

export interface ArtworkRecord {
  id: string
  title: string
  description: string | null
  category: ArtworkCategory
  image_url: string
  image_path: string
  artist_id: string
  artist_name: string
  created_at: string
  view_count: number
}

export type ArtworkCategory = 
  | 'painting' 
  | 'digital-art' 
  | 'photography' 
  | 'sculpture' 
  | 'mixed-media' 
  | 'drawing' 
  | 'other'

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    display_name?: string
    avatar_url?: string
  }
}

export interface UserProfile {
  id: string
  display_name: string
  avatar_url?: string | null
  bio?: string | null
  created_at: string
  updated_at: string
}
