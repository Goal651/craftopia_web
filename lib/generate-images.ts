// This file contains image generation utilities and real image URLs
// You can replace these with actual artwork images

export const artworkImages = {
  // High-quality abstract art - blues, purples, blacks (no browns)
  abstract: [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Blue abstract
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center", // Purple digital
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&crop=center", // Blue tech
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center", // Black/blue abstract
  ],
  
  // Digital art and modern pieces - neon, cyber, dark themes
  digital: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center", // Purple neon
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&crop=center", // Blue digital
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center", // Dark tech
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Blue abstract
  ],
  
  // Paintings - blues, greens, purples, blacks
  painting: [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center", // Blue paint
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Abstract blue
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center", // Dark artistic
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center", // Purple art
  ],
  
  // Photography - nature without browns, urban scenes
  photography: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center", // Mountain landscape
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop&crop=center", // Forest green
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center", // Forest path
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Abstract nature
  ],
  
  // Sculptures and 3D art - modern, metallic, dark
  sculpture: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center", // Dark sculpture
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&crop=center", // Modern art
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Abstract form
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center", // Purple modern
  ],
  
  // Mixed media - contemporary, no earth tones
  mixed: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center", // Mixed purple
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop&crop=center", // Digital mixed
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center", // Dark mixed
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop&crop=center", // Blue mixed
  ]
}

// Function to get a consistent image for an artwork based on its ID and category
export function getArtworkImage(id: string, category: string): string {
  const categoryKey = category.toLowerCase() as keyof typeof artworkImages
  const images = artworkImages[categoryKey] || artworkImages.abstract
  
  // Use the ID to consistently select the same image
  const index = parseInt(id) % images.length
  return images[index]
}

// Artist profile images
export const artistImages = {
  "Elena Vasquez": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
  "Marcus Chen": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  "Sofia Rodriguez": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  "David Kim": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
}

// Category banner images - no brown tones
export const categoryImages = {
  "Abstract Art": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop&crop=center", // Blue abstract
  "Digital Art": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop&crop=center", // Purple digital
  "Paintings": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center", // Blue paint
  "Photography": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center", // Mountain landscape
  "Sculptures": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&crop=center", // Dark sculpture
  "Mixed Media": "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=400&fit=crop&crop=center", // Blue tech art
}
