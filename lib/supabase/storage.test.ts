import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { 
  validateFile, 
  validateFileType, 
  validateFileSize, 
  validateFileExtension,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE 
} from './storage'

/**
 * Property-Based Tests for File Upload Validation
 * Feature: public-art-upload
 */

describe('File Upload Validation Property Tests', () => {
  /**
   * Property 1: File Upload Validation
   * For any file upload attempt, the system should validate both file type (JPG, PNG, WebP only) 
   * and file size (under 10MB), rejecting invalid files with appropriate error messages
   * **Validates: Requirements 1.2, 1.3, 7.1, 7.2**
   */
  it('Property 1: File Upload Validation - validates file type and size correctly across all inputs', async () => {
    await fc.assert(
      fc.property(
        // Generate test files with various properties
        fc.record({
          // File name with various extensions
          fileName: fc.oneof(
            // Valid extensions
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpg`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.jpeg`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.png`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.webp`),
            // Invalid extensions
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.gif`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.bmp`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.svg`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.pdf`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.exe`),
            fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.txt`)
          ),
          // MIME type
          mimeType: fc.oneof(
            // Valid MIME types
            fc.constant('image/jpeg'),
            fc.constant('image/png'),
            fc.constant('image/webp'),
            // Invalid MIME types
            fc.constant('image/gif'),
            fc.constant('image/bmp'),
            fc.constant('image/svg+xml'),
            fc.constant('application/pdf'),
            fc.constant('application/octet-stream'),
            fc.constant('text/plain'),
            fc.constant('video/mp4')
          ),
          // File size in bytes
          fileSize: fc.integer({ min: 0, max: 20 * 1024 * 1024 }) // 0 to 20MB
        }),
        (testData) => {
          // Create a mock File object
          const mockFile = {
            name: testData.fileName,
            type: testData.mimeType,
            size: testData.fileSize
          } as File

          // Test individual validation functions
          const typeValid = validateFileType(mockFile)
          const sizeValid = validateFileSize(mockFile)
          const extensionValid = validateFileExtension(mockFile.name)

          // Test comprehensive validation
          const validation = validateFile(mockFile)

          // Determine expected validity
          const expectedTypeValid = ALLOWED_FILE_TYPES.includes(testData.mimeType)
          const expectedSizeValid = testData.fileSize <= MAX_FILE_SIZE
          const expectedExtensionValid = ['.jpg', '.jpeg', '.png', '.webp'].some(ext => 
            testData.fileName.toLowerCase().endsWith(ext)
          )
          // Overall validity includes empty file check
          const expectedOverallValid = expectedTypeValid && expectedSizeValid && expectedExtensionValid && testData.fileSize > 0

          // Verify individual validation functions work correctly
          expect(typeValid).toBe(expectedTypeValid)
          expect(sizeValid).toBe(expectedSizeValid)
          expect(extensionValid).toBe(expectedExtensionValid)

          // Verify comprehensive validation (includes empty file check)
          expect(validation.valid).toBe(expectedOverallValid)

          // Verify error messages are provided for invalid files
          if (!expectedOverallValid) {
            expect(validation.error).toBeDefined()
            expect(typeof validation.error).toBe('string')
            expect(validation.error!.length).toBeGreaterThan(0)

            // Verify specific error messages based on validation failure type
            // Note: Empty file check happens first, so check in order of validation
            if (testData.fileSize === 0) {
              expect(validation.error).toContain('Empty files are not allowed')
            } else if (!expectedTypeValid) {
              expect(validation.error).toContain('Invalid file type')
              expect(validation.error).toContain('JPG, PNG, or WebP')
            } else if (!expectedSizeValid) {
              expect(validation.error).toContain('File size too large')
              expect(validation.error).toContain('10MB')
            } else if (!expectedExtensionValid) {
              expect(validation.error).toContain('Invalid file extension')
              expect(validation.error).toContain('.jpg, .jpeg, .png, or .webp')
            }
          } else {
            // Valid files should not have error messages
            expect(validation.error).toBeUndefined()
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in requirements
    )
  })

  /**
   * Additional property test for edge cases and boundary conditions
   */
  it('Property 1 (Extended): File validation handles edge cases and boundary conditions', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          // Test boundary file sizes
          fileSize: fc.oneof(
            fc.constant(0), // Empty file
            fc.constant(1), // 1 byte
            fc.constant(MAX_FILE_SIZE - 1), // Just under limit
            fc.constant(MAX_FILE_SIZE), // Exactly at limit
            fc.constant(MAX_FILE_SIZE + 1), // Just over limit
            fc.constant(MAX_FILE_SIZE * 2) // Well over limit
          ),
          // Test edge case file names
          fileName: fc.oneof(
            fc.constant('.jpg'), // No name, just extension
            fc.constant('file.JPG'), // Uppercase extension
            fc.constant('file.JPEG'), // Uppercase extension
            fc.constant('file.PNG'), // Uppercase extension
            fc.constant('file.WEBP'), // Uppercase extension
            fc.constant('file.jpg.txt'), // Double extension
            fc.constant('file'), // No extension
            fc.constant(''), // Empty name
            fc.string({ minLength: 1, maxLength: 5 }).map(name => `${name}.jpg`)
          ),
          mimeType: fc.constantFrom(...ALLOWED_FILE_TYPES)
        }),
        (testData) => {
          const mockFile = {
            name: testData.fileName,
            type: testData.mimeType,
            size: testData.fileSize
          } as File

          const validation = validateFile(mockFile)

          // File should be valid only if all conditions are met
          const expectedValid = (
            testData.fileSize <= MAX_FILE_SIZE &&
            testData.fileSize > 0 && // Non-empty file
            ALLOWED_FILE_TYPES.includes(testData.mimeType) &&
            ['.jpg', '.jpeg', '.png', '.webp'].some(ext => 
              testData.fileName.toLowerCase().endsWith(ext)
            ) &&
            testData.fileName.length > 0 // Non-empty filename
          )

          expect(validation.valid).toBe(expectedValid)

          if (!expectedValid) {
            expect(validation.error).toBeDefined()
            expect(validation.error!.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property test for security-related file validation
   * Tests Requirements 7.1, 7.2 - reject files with executable extensions or suspicious content
   */
  it('Property 1 (Security): File validation rejects potentially dangerous files', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          fileName: fc.oneof(
            // Potentially dangerous extensions
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.exe`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.bat`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.cmd`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.scr`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.com`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.pif`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.js`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.vbs`),
            // Files masquerading as images
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.jpg.exe`),
            fc.string({ minLength: 1, maxLength: 20 }).map(name => `${name}.png.bat`)
          ),
          mimeType: fc.oneof(
            // Suspicious MIME types
            fc.constant('application/octet-stream'),
            fc.constant('application/x-executable'),
            fc.constant('application/x-msdownload'),
            fc.constant('text/javascript'),
            fc.constant('application/javascript'),
            // MIME type that doesn't match extension
            fc.constant('image/jpeg'), // But with .exe extension
            fc.constant('image/png')   // But with .bat extension
          ),
          fileSize: fc.integer({ min: 1, max: MAX_FILE_SIZE })
        }),
        (testData) => {
          const mockFile = {
            name: testData.fileName,
            type: testData.mimeType,
            size: testData.fileSize
          } as File

          const validation = validateFile(mockFile)

          // All these files should be rejected for security reasons
          expect(validation.valid).toBe(false)
          expect(validation.error).toBeDefined()
          
          // Error should indicate the security issue
          const errorMessage = validation.error!.toLowerCase()
          expect(
            errorMessage.includes('invalid file type') ||
            errorMessage.includes('invalid file extension')
          ).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})