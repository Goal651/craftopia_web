"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArtworkUploadForm } from '@/components/upload/artwork-upload-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { UploadErrorBoundary } from '@/components/error-boundaries'
import type { ArtworkRecord } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const [uploadedArtwork, setUploadedArtwork] = useState<ArtworkRecord | null>(null)

  const handleUploadSuccess = (artwork: ArtworkRecord) => {
    setUploadedArtwork(artwork)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  if (uploadedArtwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-2xl pt-8">
          <Card className="glass border-0 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold mb-4">Upload Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Your artwork "{uploadedArtwork.title}" has been uploaded to the public gallery.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => router.push(`/artworks/${uploadedArtwork.id}`)}
                  className="w-full glass border-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  View Your Artwork
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/gallery')}
                  className="w-full glass border-0 bg-transparent"
                >
                  Browse Gallery
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUploadedArtwork(null)
                  }}
                  className="w-full"
                >
                  Upload Another Artwork
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <UploadErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="container mx-auto max-w-2xl pt-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4 text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Card className="glass border-0 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Share Your Art with the World
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Upload your artwork to the public gallery and connect with art lovers everywhere.
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Upload Form */}
          <ArtworkUploadForm
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
        </div>
      </div>
    </UploadErrorBoundary>
  )
}