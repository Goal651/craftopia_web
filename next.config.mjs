/** @type {import('next').NextConfig} */
const nextConfig = {

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase timeout for file uploads (UploadThing)
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '20mb',
    },
    external: {
      url: 'https://uploadthing.com',
    },
  },
  // Increase body size limit for uploads
  experimental: {
    serverComponentsExternalPackages: ['uploadthing'],
  },
}

export default nextConfig
