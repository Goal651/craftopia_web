// Test script to verify Supabase storage configuration
// Run with: npx tsx scripts/test-storage.ts

import { checkStorageHealth, validateFile, generateStoragePath } from '../lib/supabase/storage'

async function testStorageConfiguration() {
  console.log('🧪 Testing Supabase Storage Configuration...\n')

  // Test 1: Check storage health
  console.log('1. Checking storage bucket health...')
  const healthCheck = await checkStorageHealth()
  if (healthCheck.healthy) {
    console.log('✅ Storage bucket is healthy and accessible')
  } else {
    console.log('❌ Storage health check failed:', healthCheck.error)
    return
  }

  // Test 2: File validation
  console.log('\n2. Testing file validation...')
  
  // Create mock files for testing
  const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
  const invalidTypeFile = new File(['test'], 'test.txt', { type: 'text/plain' })
  const oversizedFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

  const validResult = validateFile(validFile)
  const invalidTypeResult = validateFile(invalidTypeFile)
  const oversizedResult = validateFile(oversizedFile)

  console.log('Valid JPEG file:', validResult.valid ? '✅ Passed' : '❌ Failed')
  console.log('Invalid text file:', !invalidTypeResult.valid ? '✅ Correctly rejected' : '❌ Should be rejected')
  console.log('Oversized file:', !oversizedResult.valid ? '✅ Correctly rejected' : '❌ Should be rejected')

  // Test 3: Path generation
  console.log('\n3. Testing storage path generation...')
  const testUserId = 'test-user-123'
  const testFilename = 'My Artwork (2024).jpg'
  const generatedPath = generateStoragePath(testUserId, testFilename)
  
  console.log('Generated path:', generatedPath)
  console.log('Path format valid:', generatedPath.startsWith(testUserId) ? '✅ Correct user folder' : '❌ Wrong format')
  console.log('Filename sanitized:', generatedPath.includes('My_Artwork') ? '✅ Special chars removed' : '❌ Not sanitized')

  console.log('\n🎉 Storage configuration test completed!')
}

// Run the test if this file is executed directly
if (require.main === module) {
  testStorageConfiguration().catch(console.error)
}

export { testStorageConfiguration }