/**
 * Safe date formatting utility
 * Handles various date formats and provides fallbacks
 */

export interface DateFormatOptions {
  includeTime?: boolean
  format?: 'short' | 'medium' | 'long' | 'full'
  locale?: string
}

/**
 * Safely format a date string or timestamp
 * @param dateInput - Date string, timestamp, or Date object
 * @param options - Formatting options
 * @returns Formatted date string or fallback
 */
export function formatDateSafe(
  dateInput: string | number | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  const {
    includeTime = false,
    format = 'medium',
    locale = 'en-US'
  } = options

  // Handle null/undefined
  if (!dateInput) {
    return 'Date not available'
  }

  try {
    let date: Date

    // Handle different input types
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'number') {
      // Handle Unix timestamp (seconds or milliseconds)
      date = new Date(dateInput < 10000000000 ? dateInput * 1000 : dateInput)
    } else if (typeof dateInput === 'string') {
      // Handle string dates
      // Try to parse ISO string first
      if (dateInput.includes('T') || dateInput.includes('-')) {
        date = new Date(dateInput)
      } else {
        // Try to parse as timestamp string
        const timestamp = parseInt(dateInput)
        if (!isNaN(timestamp)) {
          date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
        } else {
          date = new Date(dateInput)
        }
      }
    } else {
      return 'Invalid date format'
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    // Format the date
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'short' : format === 'long' ? 'long' : 'short',
      day: 'numeric'
    }

    if (includeTime) {
      formatOptions.hour = '2-digit'
      formatOptions.minute = '2-digit'
    }

    if (format === 'full') {
      formatOptions.weekday = 'long'
      formatOptions.month = 'long'
    }

    return date.toLocaleDateString(locale, formatOptions)
  } catch (error) {
    console.warn('Date formatting error:', error, 'Input:', dateInput)
    return 'Date error'
  }
}

/**
 * Get relative time (e.g., "2 days ago", "3 hours ago")
 * @param dateInput - Date string or timestamp
 * @returns Relative time string
 */
export function getRelativeTime(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) {
    return 'Unknown time'
  }

  try {
    let date: Date

    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput < 10000000000 ? dateInput * 1000 : dateInput)
    } else {
      date = new Date(dateInput)
    }

    if (isNaN(date.getTime())) {
      return 'Unknown time'
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSeconds < 60) {
      return 'just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    } else {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
    }
  } catch (error) {
    console.warn('Relative time error:', error)
    return 'Unknown time'
  }
}

/**
 * Check if a date is recent (within last 7 days)
 * @param dateInput - Date string or timestamp
 * @returns Boolean indicating if date is recent
 */
export function isRecent(dateInput: string | number | Date | null | undefined): boolean {
  if (!dateInput) return false

  try {
    let date: Date

    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput < 10000000000 ? dateInput * 1000 : dateInput)
    } else {
      date = new Date(dateInput)
    }

    if (isNaN(date.getTime())) return false

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return diffDays <= 7
  } catch (error) {
    return false
  }
}

/**
 * Get a safe date timestamp for sorting
 * @param dateInput - Date string or timestamp
 * @returns Timestamp number or 0 for invalid dates
 */
export function getSafeTimestamp(dateInput: string | number | Date | null | undefined): number {
  if (!dateInput) return 0

  try {
    let date: Date

    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput < 10000000000 ? dateInput * 1000 : dateInput)
    } else {
      date = new Date(dateInput)
    }

    return isNaN(date.getTime()) ? 0 : date.getTime()
  } catch (error) {
    return 0
  }
}

/**
 * Get a safe date for form inputs (YYYY-MM-DD format)
 * @param dateInput - Date string or timestamp
 * @returns Date string in YYYY-MM-DD format or empty string
 */
export function getDateForInput(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return ''

  try {
    let date: Date

    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput < 10000000000 ? dateInput * 1000 : dateInput)
    } else {
      date = new Date(dateInput)
    }

    if (isNaN(date.getTime())) return ''

    return date.toISOString().split('T')[0]
  } catch (error) {
    return ''
  }
}
