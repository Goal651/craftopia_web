// Script to download artwork images from Unsplash
// Run with: node scripts/download-images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// High-quality artwork images from Unsplash (free to use)
const images = [
  {
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'abstract-1.jpg',
    category: 'abstract'
  },
  {
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'abstract-2.jpg',
    category: 'abstract'
  },
  {
    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'abstract-3.jpg',
    category: 'abstract'
  },
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'digital-1.jpg',
    category: 'digital'
  },
  {
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'digital-2.jpg',
    category: 'digital'
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'photography-1.jpg',
    category: 'photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop&crop=center&q=80',
    filename: 'photography-2.jpg',
    category: 'photography'
  }
];

function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        console.error(`❌ Error downloading ${filename}:`, err.message);
        reject(err);
      });
    }).on('error', (err) => {
      console.error(`❌ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('🎨 Starting artwork image downloads...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${image.filename}`);
    }
  }
  
  console.log('\n🎉 All images downloaded successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Update your image paths in the code to use /images/filename.jpg');
  console.log('2. Consider optimizing images with next/image for better performance');
  console.log('3. Add more images as needed for your art gallery');
}

// Run the download
downloadAllImages().catch(console.error);
