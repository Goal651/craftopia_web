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

export function ArtworkUploadFormNew({ onSuccess, onError, editingArtwork }: ArtworkUploadFormProps) {
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
      setPreviewUrls([])
      onSuccess?.(result)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'upload'} artwork`)
      onError?.(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {isEditMode ? 'Edit Artwork' : 'Upload New Artwork'}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Fill in the details below to showcase your art.
        </p>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="imageFiles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    {isEditMode ? 'Artwork Images (Optional - leave unchanged to keep current)' : 'Artwork Images'}
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 relative overflow-hidden ${dragActive
                          ? 'border-primary bg-primary/5 scale-[0.99]'
                          : 'border-border hover:border-primary/40 hover:bg-muted/30'
                        }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {previewUrls.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative inline-block group">
                                <div className="relative rounded-lg overflow-hidden shadow-2xl border border-border/50">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          {previewUrls.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={clearAllImages}
                              className="mt-4"
                            >
                              Clear All Images
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground group-hover:text-primary transition-colors">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-foreground mb-1">
                              Drag and drop your images
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                              or click to browse your files
                            </p>
                          </div>
                        </>
                      )}
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
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">Upload JPG, PNG, or WebP files up to 8MB each</FormDescription>
                  <FormMessage />
                </FormItem>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Title</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter artwork title"
                        className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-border/50 focus:bg-background transition-all">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="digital">Digital Art</SelectItem>
                          <SelectItem value="sculpture">Sculpture</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="mixed-media">Mixed Media</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="medium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Medium</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g., Oil on Canvas, Digital, etc."
                          className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Dimensions</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder='e.g., 24" x 36"'
                          className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Year (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          className="bg-muted/30 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                </FormField>
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary border-border focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium">Featured Artwork</FormLabel>
                  </FormItem>
                )}
              />

            {isUploading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div>
                      <p className="text-lg font-medium">Uploading artwork...</p>
                      <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                  </div>
                </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isUploading}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="min-w-32"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Artwork' : 'Upload Artwork'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
