"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArtworkUploadForm } from '@/components/upload/artwork-upload-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Edit } from 'lucide-react'
import type { ArtworkRecord } from '@/types'

function UploadPageContent() {
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
      <div className="min-h-screen bg-background p-6 pt-24 sm:pt-32 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <Card className="glass-strong border-border/50">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-6"></div>
              <h1 className="text-xl font-medium text-foreground">Loading artwork...</h1>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadedArtwork) {
    return (
      <div className="min-h-screen bg-background p-6 pt-24 sm:pt-32 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <Card className="glass-strong border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-foreground">
                {editingArtwork ? 'Artwork Updated' : 'Upload Successful!'}
              </h1>
              <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                Your masterpiece has been {editingArtwork ? 'successfully updated' : 'added to our collection'}.
              </p>

              <div className="space-y-4 max-w-xs mx-auto">
                <Button
                  onClick={() => router.push(`/artworks/${uploadedArtwork.id}`)}
                  className="w-full btn-primary glow-primary py-6 text-base"
                >
                  View Artwork
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/gallery')}
                  className="w-full glass border-border hover:bg-muted py-6 text-base"
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
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  {editingArtwork ? 'Edit Another' : 'Upload More'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-16 sm:py-24 lg:py-32">
      <div className="w-full max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-8 p-0 text-muted-foreground hover:text-foreground group flex items-center"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium tracking-wide uppercase">Back to previous</span>
            </Button>

            <div className="space-y-4">
              <Badge className="glass px-4 py-1.5 border-primary/20 text-primary">Creator Space</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                {editingArtwork ? 'Refine Your' : 'Share Your'} <span className="text-gradient-primary">Masterpiece</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                {editingArtwork 
                  ? 'Fine-tune the details of your artwork to ensure it perfectly represents your artistic vision.'
                  : 'Join our community of elite artists. Your creative journey starts with a single upload.'
                }
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <ArtworkUploadForm
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            editingArtwork={editingArtwork}
          />
        </div>
      </div>
    )
  }

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black p-4 pt-24">
        <div className="container mx-auto max-w-2xl">
          <Card className="glass bg-white/5 backdrop-blur-xl border border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-xl font-bold text-white">Loading...</h1>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  )
}