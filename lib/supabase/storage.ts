import { createClient } from './client'

// Storage configuration constants
export const STORAGE_BUCKET = 'artworks'
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// File validation utilities
export function validateFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type)
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

export function validateFileExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return ALLOWED_EXTENSIONS.includes(extension)
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Empty files are not allowed. Please select a valid image file.'
    }
  }

  if (!validateFileType(file)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a JPG, PNG, or WebP image.'
    }
  }

  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: 'File size too large. Please select an image under 10MB.'
    }
  }

  if (!validateFileExtension(file.name)) {
    return {
      valid: false,
      error: 'Invalid file extension. Please use .jpg, .jpeg, .png, or .webp files.'
    }
  }

  return { valid: true }
}

// Storage path utilities
export function generateStoragePath(userId: string, filename: string): string {
  // Create a unique filename to avoid conflicts
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const extension = filename.substring(filename.lastIndexOf('.'))
  const cleanFilename = filename
    .substring(0, filename.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9-_]/g, '_')
  
  return `${userId}/${timestamp}_${randomSuffix}_${cleanFilename}${extension}`
}

export function getPublicUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// Storage operations
export async function uploadArtworkImage(
  file: File,
  userId: string
): Promise<{ success: boolean; path?: string; url?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate storage path
    const path = generateStoragePath(userId, file.name)

    // Upload file
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      })

    if (error) {
      console.error('Storage upload error:', error)
      return { 
        success: false, 
        error: 'Failed to upload image. Please try again.' 
      }
    }

    // Get public URL
    const publicUrl = getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { 
      success: false, 
      error: 'An unexpected error occurred during upload.' 
    }
  }
}

export async function deleteArtworkImage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return { 
        success: false, 
        error: 'Failed to delete image.' 
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { 
      success: false, 
      error: 'An unexpected error occurred during deletion.' 
    }
  }
}

// Utility to check if storage bucket exists and is accessible
export async function checkStorageHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      return { healthy: false, error: error.message }
    }

    const artworksBucket = data.find(bucket => bucket.id === STORAGE_BUCKET)
    if (!artworksBucket) {
      return { 
        healthy: false, 
        error: `Storage bucket '${STORAGE_BUCKET}' not found` 
      }
    }

    return { healthy: true }
  } catch (error) {
    return { 
      healthy: false, 
      error: 'Failed to check storage health' 
    }
  }
}