"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import type { ArtworkRecord } from '@/types'
import { useUploadThing } from "@/lib/uploadthing";

// Validation schema - ONLY price, stock, and images
const artworkUploadSchema = z.object({
  price: z.number().min(0, 'Price cannot be negative'),
  stock_quantity: z.number().min(0, 'Stock cannot be negative'),
  imageFiles: z.array(z.any()).optional()
})

type ArtworkUploadFormValues = z.infer<typeof artworkUploadSchema>

interface ArtworkUploadFormProps {
  onSuccess?: (artwork: ArtworkRecord) => void
  onError?: (error: string) => void
  editingArtwork?: ArtworkRecord | null
}

export function ArtworkUploadFormSimple({ onSuccess, onError, editingArtwork }: ArtworkUploadFormProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
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
  });

  const form = useForm<ArtworkUploadFormValues>({
    resolver: zodResolver(artworkUploadSchema),
    defaultValues: {
      price: editingArtwork?.price || 0,
      stock_quantity: editingArtwork?.stock_quantity || 1,
      imageFiles: undefined
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

    try {
      let imageUrl = editingArtwork?.image_url
      let additionalImages: string[] = []

      // Start with existing images if editing
      if (isEditMode && editingArtwork?.images) {
        additionalImages = [...editingArtwork.images]
      }

      // Upload new images if files were provided
      if (data.imageFiles && data.imageFiles.length > 0) {
        const uploadRes = await startUpload(data.imageFiles);

        if (!uploadRes || uploadRes.length === 0) {
          throw new Error("Failed to upload images");
        }

        // In edit mode, add new images to existing ones
        if (isEditMode) {
          // Append new images to existing additional images
          additionalImages = [...additionalImages, ...uploadRes.map(img => img.url)]
        } else {
          // In create mode, first image becomes main, others become additional
          imageUrl = uploadRes[0].url;
          additionalImages = uploadRes.slice(1).map(img => img.url);
        }
      }

      // Save metadata to MongoDB
      const endpoint = isEditMode ? `/api/artworks/${editingArtwork.id}` : '/api/artworks'
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: data.price,
          stock_quantity: data.stock_quantity,
          image_url: imageUrl,
          images: additionalImages,
          artist_id: user.id,
          artist_name: user.display_name || user.email,
          category: 'Artworks', // Default category
          title: 'Artwork' // Default title
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
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {isEditMode ? 'Edit Artwork' : 'Upload New Artwork'}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your artwork images and set pricing information.
        </p>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 relative overflow-hidden ${
                        dragActive
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
                        <>
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
                  <FormDescription className="text-xs sm:text-sm">
                    Upload JPG, PNG, or WebP files up to 8MB each
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isUploading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div>
                      <p className="text-lg font-medium">Uploading artwork...</p>
                      <p className="text-sm text-muted-foreground">Please wait</p>
                    </div>
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
