export interface Artwork {
  id: string
  title: string
  artist: string
  description: string
  price: number
  category: string
  images: string[]
  featured: boolean
  inStock: boolean
  stockQuantity: number
  dimensions?: string
  medium?: string
  year?: number
  createdAt: string
}

export const sampleArtworks: Artwork[] = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "Elena Vasquez",
    description:
      "A mesmerizing blend of soft pastels and flowing forms that captures the essence of dreams and subconscious thoughts. This piece explores the boundary between reality and imagination through delicate brushstrokes and luminous colors that seem to dance across the canvas.",
    price: 2800,
    category: "painting",
    images: ["/images/artwork-1.jpg", "/images/artwork-1-detail.jpg"],
    featured: true,
    inStock: true,
    stockQuantity: 1,
    dimensions: '36" x 48"',
    medium: "Oil on Canvas",
    year: 2024,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Midnight Horizon",
    artist: "Elena Vasquez",
    description:
      "An abstract landscape that captures the magical moment when day meets night. Deep blue and purple hues dance across the canvas, creating depth and movement that draws the viewer into a world of mystery and tranquility. The interplay of light and shadow creates an almost three-dimensional effect.",
    price: 3200,
    category: "painting",
    images: ["/images/artwork-2.jpg", "/images/artwork-2-detail.jpg"],
    featured: true,
    inStock: true,
    stockQuantity: 1,
    dimensions: '40" x 30"',
    medium: "Acrylic on Canvas",
    year: 2024,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    title: "Digital Serenity",
    artist: "Elena Vasquez",
    description:
      "A contemporary digital artwork that explores the intersection of technology and nature. Soft geometric forms blend with organic shapes, creating a harmonious composition that speaks to our modern relationship with the digital world while maintaining a connection to natural beauty.",
    price: 1800,
    category: "digital",
    images: ["/images/artwork-3.jpg"],
    featured: true,
    inStock: true,
    stockQuantity: 5,
    dimensions: '24" x 36" (Print)',
    medium: "Digital Art Print on Archival Paper",
    year: 2024,
    createdAt: "2024-01-08",
  },
  {
    id: "4",
    title: "Whispers of Light",
    artist: "Elena Vasquez",
    description:
      "A delicate exploration of light and shadow through mixed media techniques. This piece combines traditional painting methods with modern materials to create a textured surface that changes with the viewing angle and lighting conditions, offering a new experience with each encounter.",
    price: 2400,
    category: "painting",
    images: ["/images/artwork-4.jpg"],
    featured: false,
    inStock: true,
    stockQuantity: 1,
    dimensions: '30" x 40"',
    medium: "Mixed Media on Canvas",
    year: 2023,
    createdAt: "2023-12-20",
  },
  {
    id: "5",
    title: "Sculptural Flow",
    artist: "Elena Vasquez",
    description:
      "A contemporary bronze sculpture that captures movement in static form. The flowing lines and smooth surfaces create a sense of grace and elegance, while the interplay of light and shadow adds depth and dimension. This piece represents the artist's exploration into three-dimensional form.",
    price: 4500,
    category: "sculpture",
    images: ["/images/artwork-5.jpg"],
    featured: true,
    inStock: true,
    stockQuantity: 1,
    dimensions: '18" x 12" x 24"',
    medium: "Bronze with Patina Finish",
    year: 2023,
    createdAt: "2023-11-15",
  },
  {
    id: "6",
    title: "Urban Poetry",
    artist: "Elena Vasquez",
    description:
      "A photographic series that captures the hidden beauty in urban environments. Through careful composition and lighting, everyday city scenes are transformed into poetic visual narratives that reveal the extraordinary in the ordinary, finding art in the most unexpected places.",
    price: 1200,
    category: "photography",
    images: ["/images/artwork-6.jpg"],
    featured: false,
    inStock: true,
    stockQuantity: 10,
    dimensions: '20" x 30" (Print)',
    medium: "Fine Art Photography Print",
    year: 2023,
    createdAt: "2023-10-30",
  },
  {
    id: "7",
    title: "Celestial Dance",
    artist: "Elena Vasquez",
    description:
      "An abstract painting inspired by the movement of celestial bodies and cosmic phenomena. Swirling forms and cosmic colors create a sense of infinite space and movement, inviting viewers to contemplate their place in the universe and the beauty of the cosmos.",
    price: 3800,
    category: "painting",
    images: ["/images/artwork-7.jpg"],
    featured: true,
    inStock: false,
    stockQuantity: 0,
    dimensions: '48" x 60"',
    medium: "Oil on Canvas",
    year: 2023,
    createdAt: "2023-09-12",
  },
  {
    id: "8",
    title: "Digital Metamorphosis",
    artist: "Elena Vasquez",
    description:
      "A digital artwork that explores themes of transformation and change in the modern world. Organic forms morph and evolve across the composition, creating a visual metaphor for growth and adaptation in our rapidly changing digital age.",
    price: 2100,
    category: "digital",
    images: ["/images/artwork-8.jpg"],
    featured: false,
    inStock: true,
    stockQuantity: 3,
    dimensions: '32" x 24" (Print)',
    medium: "Digital Art Print on Canvas",
    year: 2023,
    createdAt: "2023-08-25",
  },
  {
    id: "9",
    title: "Harmony in Chaos",
    artist: "Elena Vasquez",
    description:
      "A striking composition that finds order within disorder. Bold strokes and vibrant colors create a dynamic tension that resolves into perfect balance, representing the artist's philosophy that beauty can be found even in the most chaotic moments of life.",
    price: 2600,
    category: "painting",
    images: ["/images/artwork-9.jpg"],
    featured: false,
    inStock: true,
    stockQuantity: 1,
    dimensions: '36" x 36"',
    medium: "Acrylic and Oil on Canvas",
    year: 2024,
    createdAt: "2024-02-14",
  },
  {
    id: "10",
    title: "Reflections of Time",
    artist: "Elena Vasquez",
    description:
      "A contemplative piece that explores the passage of time through layered imagery and subtle color transitions. The work invites viewers to reflect on their own journey through life, with each layer representing different moments and memories.",
    price: 3400,
    category: "painting",
    images: ["/images/artwork-10.jpg"],
    featured: true,
    inStock: true,
    stockQuantity: 1,
    dimensions: '42" x 54"',
    medium: "Oil and Mixed Media on Canvas",
    year: 2024,
    createdAt: "2024-03-01",
  },
]
