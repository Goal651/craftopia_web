"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, X, CheckCircle, AlertCircle, Edit } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import type { ArtworkRecord } from '@/types'
import { useUploadThing } from "@/lib/uploadthing";

// Validation schema
const artworkUploadSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  year: z.number().optional(),
  price: z.number()
    .min(0, 'Price cannot be negative'),
  stock_quantity: z.number()
    .min(0, 'Stock cannot be negative'),
  imageFiles: z.array(z.any()).optional(),
  featured: z.boolean().optional()
})

type ArtworkUploadFormValues = z.infer<typeof artworkUploadSchema>

interface ArtworkUploadFormProps {
  onSuccess?: (artwork: ArtworkRecord) => void
  onError?: (error: string) => void
  editingArtwork?: ArtworkRecord | null
}

export function ArtworkUploadForm({ onSuccess, onError, editingArtwork }: ArtworkUploadFormProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const isEditMode = !!editingArtwork

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      // Handled in onSubmit
    },
    onUploadError: (e: Error) => {
      toast.error(`Error uploading: ${e.message}`);
      setIsUploading(false);
    },
    onUploadProgress: (p: number) => {
      setUploadProgress(p);
    },
  });

  const form = useForm<ArtworkUploadFormValues>({
    resolver: zodResolver(artworkUploadSchema),
    defaultValues: {
      title: editingArtwork?.title || '',
      category: editingArtwork?.category || '',
      medium: editingArtwork?.medium || '',
      dimensions: editingArtwork?.dimensions || '',
      year: editingArtwork?.year || undefined,
      price: editingArtwork?.price || 0,
      stock_quantity: editingArtwork?.stock_quantity || 1,
      imageFiles: undefined,
      featured: editingArtwork?.featured || false
    }
  })

  // Initialize preview URLs with existing images if editing
  useEffect(() => {
    if (editingArtwork) {
      const urls = editingArtwork.image_url 
        ? [editingArtwork.image_url, ...(editingArtwork.images || [])]
        : []
      setPreviewUrls(urls)
    }
  }, [editingArtwork])

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length === 0) {
      toast.error('Please select valid image files')
      return
    }
    
    form.setValue('imageFiles', validFiles)
    form.clearErrors('imageFiles')
    
    const urls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...urls])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    const currentFiles = form.getValues('imageFiles') || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    form.setValue('imageFiles', newFiles)
  }

  const clearAllImages = () => {
    setPreviewUrls([])
    form.setValue('imageFiles', [])
  }

  const onSubmit = async (data: ArtworkUploadFormValues) => {
    if (!user) {
      toast.error('You must be logged in to upload artwork')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      let imageUrl = editingArtwork?.image_url
      let additionalImages: string[] = []

      // Upload new images if files were provided
      if (data.imageFiles && data.imageFiles.length > 0) {
        // 1. Upload all images to Uploadthing
        const uploadRes = await startUpload(data.imageFiles);

        if (!uploadRes || uploadRes.length === 0) {
          throw new Error("Failed to upload images");
        }

        // First image becomes main image, others become additional
        imageUrl = uploadRes[0].url;
        additionalImages = uploadRes.slice(1).map(img => img.url);
      }

      // 2. Save metadata to MongoDB (create or update)
      const endpoint = isEditMode ? `/api/artworks/${editingArtwork.id}` : '/api/artworks'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          medium: data.medium,
          dimensions: data.dimensions,
          year: data.year,
          price: data.price,
          stock_quantity: data.stock_quantity,
          image_url: imageUrl,
          images: additionalImages,
          artist_id: user.id,
          artist_name: user.display_name || user.email,
          featured: data.featured
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'save'} artwork details`)
      }

      const result = await response.json()
      toast.success(`Artwork ${isEditMode ? 'updated' : 'uploaded'} successfully!`)
      form.reset()
      setPreviewUrl(null)
      onSuccess?.(result.artwork)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${isEditMode ? 'Update' : 'Upload'} failed`
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!user) {
    return (
      <Card className="glass border-border/50 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to upload your artwork.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-strong border-border/50">
      <CardHeader className="px-6 sm:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {isEditMode ? <Edit className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              {isEditMode ? 'Edit Artwork' : 'Upload Artwork'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in the details below to showcase your art.
            </p>
          </div>
        </div>
      </CardHeader>
                            </div>
                          ))}
                        </div>
                        {previewUrls.length > 0 && (
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground group-hover:text-primary transition-colors">
                            <Upload className="w-8 h-8" />
                          </div>
                          <p className="text-base font-medium text-foreground mb-1">
                            Drag and drop your image
                          </p>
                          <p className="text-sm text-muted-foreground mb-6">
                            or click to browse your files
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files
                              if (files) handleFileSelect(files)
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-6 py-2 h-10"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Browse Files
                          </Button>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">Upload JPG, PNG, or WebP files up to 8MB</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Price (RWF)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Set to 0 if not for sale</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Available Copies</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Inventory quantity</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span>{isEditMode ? 'Updating...' : 'Uploading...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-background text-foreground btn-primary glow-primary py-7 font-semibold uppercase tracking-widest transition-all"
            >
              {isUploading ? (isEditMode ? "Updating..." : "Processing...") : (isEditMode ? "Save Changes" : "Publish Artwork")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}