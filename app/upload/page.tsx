"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArtworkUploadForm } from '@/components/upload/artwork-upload-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Edit } from 'lucide-react'
import { UploadErrorBoundary } from '@/components/error-boundaries'
import type { ArtworkRecord } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [uploadedArtwork, setUploadedArtwork] = useState<ArtworkRecord | null>(null)
  const [editingArtwork, setEditingArtwork] = useState<ArtworkRecord | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editId) {
      setLoading(true)
      fetch(`/api/artworks/${editId}`)
        .then(res => {
          if (res.ok) return res.json()
          throw new Error('Artwork not found')
        })
        .then(data => {
          setEditingArtwork(data)
        })
        .catch(error => {
          console.error('Failed to load artwork for editing:', error)
          router.push('/upload')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [editId, router])

  const handleUploadSuccess = (artwork: ArtworkRecord) => {
    setUploadedArtwork(artwork)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 pt-24">
        <div className="container mx-auto max-w-2xl">
          <Card className="glass bg-white/5 backdrop-blur-xl border border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-xl font-bold text-white">Loading artwork...</h1>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadedArtwork) {
    return (
      <div className="min-h-screen bg-black p-4 pt-24">
        <div className="container mx-auto max-w-2xl">
          <Card className="glass bg-white/5 backdrop-blur-xl border border-gray-800">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h1 className="text-2xl font-bold mb-4 text-white">
                {editingArtwork ? 'Artwork Updated Successfully!' : 'Upload Successful!'}
              </h1>
              <p className="text-gray-400 mb-6">
                Your artwork "{uploadedArtwork.title}" has been {editingArtwork ? 'updated' : 'uploaded'} to the public gallery.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push(`/artworks/${uploadedArtwork.id}`)}
                  className="w-full glass border-0 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
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
                    setEditingArtwork(null)
                    router.push('/upload')
                  }}
                  className="w-full"
                >
                  {editingArtwork ? 'Edit Another Artwork' : 'Upload Another Artwork'}
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
      <div className="min-h-screen bg-black p-4 pt-20 sm:pt-24">
        <div className="container-modern max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-3 sm:mb-4 text-white/70 hover:text-white text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="glass border-0 bg-white/5 backdrop-blur-xl">
              <CardHeader className="text-center px-4 sm:px-6 py-6 sm:py-8">
                <CardTitle className="text-center text-xl sm:text-2xl flex items-center justify-center gap-2">
                  {editingArtwork ? (
                    <>
                      <Edit className="w-5 h-5 sm:w-6 sm:h-6" />
                      Edit Your Artwork
                    </>
                  ) : (
                    'Share Your Art with the World'
                  )}
                </CardTitle>
                <p className="text-center text-muted-foreground text-sm sm:text-base mt-2">
                  {editingArtwork 
                    ? 'Update your artwork details and share your creativity with the community.'
                    : 'Upload your artwork to the public gallery and connect with art lovers everywhere.'
                  }
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Upload Form */}
          <ArtworkUploadForm
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            editingArtwork={editingArtwork}
          />
        </div>
      </div>
    </UploadErrorBoundary>
  )
}