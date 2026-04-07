export interface ArtworkRecord {
  id: string
  title: string
  description: string | null
  image_url: string
  image_path: string
  artist_id: string
  artist_name: string
  createdAt: string
  updatedAt: string
  created_at?: string // Optional for backward compatibility
  updated_at?: string // Optional for backward compatibility
  view_count: number
  price: number
  stock_quantity: number
  year?: number
  featured?: boolean
  images?: string[]
  medium?: string
  dimensions?: string
  inStock?: boolean
}

export interface User {
  id:string
  email: string,
  phone_number: string,
  display_name: string,
  avatar_url: string,
  bio: string,
  role: string,
  status: string,
}