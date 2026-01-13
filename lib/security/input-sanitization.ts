/**
 * Input sanitization utilities for the Public Art Upload System
 * Implements security measures to prevent XSS attacks and ensure data integrity
 */

// XSS prevention patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, // Iframe tags
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, // Object tags
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, // Embed tags
  /<link\b[^<]*>/gi, // Link tags
  /<meta\b[^<]*>/gi, // Meta tags
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, // Style tags
  /javascript:/gi, // JavaScript protocol
  /vbscript:/gi, // VBScript protocol
  /data:/gi, // Data protocol (can be dangerous)
  /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
  /expression\s*\(/gi, // CSS expressions
  /url\s*\(/gi, // CSS url() function
  /@import/gi, // CSS @import
]

// HTML entities for encoding
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Sanitize text input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeTextInput(
  input: string,
  options: {
    allowBasicFormatting?: boolean
    maxLength?: number
    preserveLineBreaks?: boolean
  } = {}
): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()

  // Apply XSS pattern removal
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Remove HTML tags unless basic formatting is allowed
  if (!options.allowBasicFormatting) {
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // Allow only safe HTML tags for basic formatting
    const allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p']
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
    
    sanitized = sanitized.replace(tagPattern, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match
      }
      return ''
    })
  }

  // Encode remaining HTML entities
  sanitized = sanitized.replace(/[&<>"'\/]/g, char => HTML_ENTITIES[char] || char)

  // Handle line breaks
  if (options.preserveLineBreaks) {
    sanitized = sanitized.replace(/\n/g, '<br>')
  }

  // Truncate if max length specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength).trim()
  }

  return sanitized
}

/**
 * Sanitize artwork title with strict rules
 * @param title - The title to sanitize
 * @returns Sanitized title
 */
export function sanitizeArtworkTitle(title: string): string {
  return sanitizeTextInput(title, {
    allowBasicFormatting: false,
    maxLength: 100,
    preserveLineBreaks: false
  })
}

/**
 * Sanitize artwork description with basic formatting allowed
 * @param description - The description to sanitize
 * @returns Sanitized description
 */
export function sanitizeArtworkDescription(description: string): string {
  return sanitizeTextInput(description, {
    allowBasicFormatting: true,
    maxLength: 1000,
    preserveLineBreaks: true
  })
}

/**
 * Sanitize artist name
 * @param name - The artist name to sanitize
 * @returns Sanitized name
 */
export function sanitizeArtistName(name: string): string {
  return sanitizeTextInput(name, {
    allowBasicFormatting: false,
    maxLength: 50,
    preserveLineBreaks: false
  })
}

/**
 * Validate and sanitize filename
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'untitled'
  }

  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[\/\\:*?"<>|]/g, '_') // Replace dangerous characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, '') // Keep only alphanumeric, hyphens, underscores, dots
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots, underscores, hyphens

  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'untitled'
  }

  // Limit length
  if (sanitized.length > 100) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'))
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = nameWithoutExt.substring(0, 100 - extension.length) + extension
  }

  return sanitized
}

/**
 * Check if input contains potentially dangerous content
 * @param input - The input to check
 * @returns True if input appears dangerous
 */
export function containsDangerousContent(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  // Check for XSS patterns
  return XSS_PATTERNS.some(pattern => pattern.test(input))
}

/**
 * Validate that sanitized input is not empty or meaningless
 * @param original - Original input
 * @param sanitized - Sanitized input
 * @returns True if sanitized input is valid
 */
export function isValidSanitizedInput(original: string, sanitized: string): boolean {
  // Check if sanitization removed too much content
  if (!sanitized || sanitized.trim().length === 0) {
    return false
  }

  // Check if sanitized version is too different from original (potential attack)
  const originalLength = original.trim().length
  const sanitizedLength = sanitized.trim().length
  
  // If more than 50% of content was removed, it might be suspicious
  if (originalLength > 0 && sanitizedLength < originalLength * 0.5) {
    return false
  }

  return true
}

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: string
  userId?: string
  action: string
  input: string
  sanitized: string
  dangerous: boolean
  ipAddress?: string
}

/**
 * Log security-related events for monitoring
 * @param entry - The audit entry to log
 */
export function logSecurityEvent(entry: SecurityAuditEntry): void {
  // In production, this would send to a proper logging service
  console.warn('Security Event:', {
    ...entry,
    timestamp: new Date().toISOString()
  })
}