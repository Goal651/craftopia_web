/**
 * Image processing and security utilities
 * Handles EXIF data removal and image validation for security
 */

import piexif from 'piexifjs'

/**
 * Strip EXIF data from image file to protect user privacy
 * @param file - The image file to process
 * @returns Promise<File> - New file without EXIF data
 */
export async function stripExifData(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Only process JPEG files (EXIF is primarily in JPEG)
    if (file.type !== 'image/jpeg') {
      resolve(file)
      return
    }

    const reader = new FileReader()
    
    reader.onload = function(event) {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const dataView = new DataView(arrayBuffer)
        
        // Convert to base64 for piexifjs
        const base64 = arrayBufferToBase64(arrayBuffer)
        const dataUrl = `data:${file.type};base64,${base64}`
        
        // Remove EXIF data
        const cleanedDataUrl = piexif.remove(dataUrl)
        
        // Convert back to File
        fetch(cleanedDataUrl)
          .then(res => res.blob())
          .then(blob => {
            const cleanedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified
            })
            resolve(cleanedFile)
          })
          .catch(reject)
          
      } catch (error) {
        console.warn('Failed to strip EXIF data, using original file:', error)
        resolve(file)
      }
    }
    
    reader.onerror = () => {
      console.warn('Failed to read file for EXIF stripping, using original file')
      resolve(file)
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert ArrayBuffer to base64 string
 * @param buffer - The ArrayBuffer to convert
 * @returns Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Validate image file content to ensure it's actually an image
 * @param file - The file to validate
 * @returns Promise<boolean> - True if file is a valid image
 */
export async function validateImageContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // Check file type first
    if (!file.type.startsWith('image/')) {
      resolve(false)
      return
    }

    // Create an image element to test if file is actually an image
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      // Additional checks for minimum dimensions (prevent 1x1 pixel attacks)
      if (img.width < 10 || img.height < 10) {
        resolve(false)
        return
      }
      resolve(true)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
    
    img.src = url
    
    // Timeout after 5 seconds
    setTimeout(() => {
      URL.revokeObjectURL(url)
      resolve(false)
    }, 5000)
  })
}

/**
 * Check for suspicious file characteristics
 * @param file - The file to check
 * @returns Object with security assessment
 */
export function assessImageSecurity(file: File): {
  safe: boolean
  warnings: string[]
  blocked: boolean
} {
  const warnings: string[] = []
  let blocked = false

  // Check file size (too small might be suspicious)
  if (file.size < 100) {
    warnings.push('File size is suspiciously small')
    blocked = true
  }

  // Check file size (too large might be a DoS attempt)
  if (file.size > 50 * 1024 * 1024) { // 50MB
    warnings.push('File size is too large')
    blocked = true
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
    /\.html$/i,
    /\.htm$/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    warnings.push('Filename contains suspicious extension')
    blocked = true
  }

  // Check for double extensions
  if ((file.name.match(/\./g) || []).length > 1) {
    warnings.push('Filename contains multiple extensions')
  }

  // Check MIME type consistency
  const expectedMimeTypes: Record<string, string[]> = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.webp': ['image/webp']
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  const expectedTypes = expectedMimeTypes[extension]
  
  if (expectedTypes && !expectedTypes.includes(file.type)) {
    warnings.push('MIME type does not match file extension')
    blocked = true
  }

  return {
    safe: warnings.length === 0,
    warnings,
    blocked
  }
}

/**
 * Process image file with all security measures
 * @param file - The file to process
 * @returns Promise with processed file and security info
 */
export async function processImageSecurely(file: File): Promise<{
  success: boolean
  file?: File
  error?: string
  warnings?: string[]
}> {
  try {
    // Security assessment
    const security = assessImageSecurity(file)
    if (security.blocked) {
      return {
        success: false,
        error: 'File failed security checks: ' + security.warnings.join(', ')
      }
    }

    // Validate image content
    const isValidImage = await validateImageContent(file)
    if (!isValidImage) {
      return {
        success: false,
        error: 'File is not a valid image or is corrupted'
      }
    }

    // Strip EXIF data
    const processedFile = await stripExifData(file)

    return {
      success: true,
      file: processedFile,
      warnings: security.warnings.length > 0 ? security.warnings : undefined
    }

  } catch (error) {
    console.error('Image processing error:', error)
    return {
      success: false,
      error: 'Failed to process image file'
    }
  }
}

/**
 * Generate secure filename with timestamp and random suffix
 * @param originalName - Original filename
 * @param userId - User ID for folder organization
 * @returns Secure filename
 */
export function generateSecureFilename(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  
  // Sanitize the base name
  const baseName = originalName
    .substring(0, originalName.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 20) // Limit length
  
  return `${userId}/${timestamp}_${randomSuffix}_${baseName}${extension}`
}