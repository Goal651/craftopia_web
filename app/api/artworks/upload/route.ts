import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadArtworkImage, validateFile } from '@/lib/supabase/storage'
import { 
  sanitizeArtworkTitle, 
  sanitizeArtworkDescription,
  isValidSanitizedInput,
  logSecurityEvent 
} from '@/lib/security/input-sanitization'
import { processImageSecurely } from '@/lib/security/image-processing'
import type { ArtworkCategory, ArtworkRecord } from '@/types'

// Validate category
function isValidCategory(category: string): category is ArtworkCategory {
  const validCategories: ArtworkCategory[] = [
    'painting',
    'digital-art', 
    'photography',
    'sculpture',
    'mixed-media',
    'drawing',
    'other'
  ]
  return validCategories.includes(category as ArtworkCategory)
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const imageFile = formData.get('imageFile') as File

    // Validate required fields
    if (!title || !category || !imageFile) {
      return NextResponse.json(
        { error: 'Title, category, and image file are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs with enhanced security
    const sanitizedTitle = sanitizeArtworkTitle(title)
    const sanitizedDescription = sanitizeArtworkDescription(description || '')

    // Validate sanitized inputs
    if (!isValidSanitizedInput(title, sanitizedTitle)) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        userId: user.id,
        action: 'title_sanitization_failed',
        input: title,
        sanitized: sanitizedTitle,
        dangerous: true
      })
      
      return NextResponse.json(
        { error: 'Title contains invalid content' },
        { status: 400 }
      )
    }

    if (description && !isValidSanitizedInput(description, sanitizedDescription)) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        userId: user.id,
        action: 'description_sanitization_failed',
        input: description,
        sanitized: sanitizedDescription,
        dangerous: true
      })
      
      return NextResponse.json(
        { error: 'Description contains invalid content' },
        { status: 400 }
      )
    }

    // Validate category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category selected' },
        { status: 400 }
      )
    }

    // Process image with security measures (EXIF stripping, validation)
    const imageProcessingResult = await processImageSecurely(imageFile)
    if (!imageProcessingResult.success) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        userId: user.id,
        action: 'image_security_check_failed',
        input: imageFile.name,
        sanitized: '',
        dangerous: true
      })
      
      return NextResponse.json(
        { error: imageProcessingResult.error },
        { status: 400 }
      )
    }

    const processedImageFile = imageProcessingResult.file!

    // Additional file validation
    const fileValidation = validateFile(processedImageFile)
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      )
    }

    // Get user display name and sanitize it
    const rawDisplayName = user.user_metadata?.display_name || user.email || 'Anonymous'
    const displayName = sanitizeArtworkTitle(rawDisplayName)

    // Upload image to storage
    const uploadResult = await uploadArtworkImage(processedImageFile, user.id)
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      )
    }

    // Save artwork metadata to database
    const { data: artwork, error: dbError } = await supabase
      .from('artworks')
      .insert({
        title: sanitizedTitle,
        description: sanitizedDescription,
        category,
        image_url: uploadResult.url!,
        image_path: uploadResult.path!,
        artist_id: user.id,
        artist_name: displayName,
        view_count: 0
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      
      // Clean up uploaded image if database save fails
      try {
        const { deleteArtworkImage } = await import('@/lib/supabase/storage')
        await deleteArtworkImage(uploadResult.path!)
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded image:', cleanupError)
      }

      return NextResponse.json(
        { error: 'Failed to save artwork information' },
        { status: 500 }
      )
    }

    // Log successful upload
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: 'artwork_upload_success',
      input: `${title} | ${imageFile.name}`,
      sanitized: `${sanitizedTitle} | ${processedImageFile.name}`,
      dangerous: false
    })

    // Return success response
    const artworkRecord: ArtworkRecord = {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description || '',
      category: artwork.category as ArtworkCategory,
      image_url: artwork.image_url,
      image_path: artwork.image_path,
      artist_id: artwork.artist_id,
      artist_name: artwork.artist_name,
      created_at: artwork.created_at,
      updated_at: artwork.updated_at,
      view_count: artwork.view_count
    }

    return NextResponse.json({
      success: true,
      artwork: artworkRecord,
      warnings: imageProcessingResult.warnings
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}