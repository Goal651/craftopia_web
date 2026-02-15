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
import type { ArtworkCategory, ArtworkRecord } from '@/types'
import { useUploadThing } from "@/lib/uploadthing";

// Validation schema
const createArtworkUploadSchema = (isEditMode: boolean) => z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z.enum([
    'painting',
    'digital-art',
    'photography',
    'sculpture',
    'mixed-media',
    'drawing',
    'other'
  ] as const, {
    message: 'Please select a category'
  }),
  imageFile: isEditMode 
    ? z.instanceof(File, { message: 'Please select an image file' })
        .refine((file) => file.size <= 8 * 1024 * 1024, 'File size must be under 8MB')
        .refine(
          (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
          'File must be JPG, PNG, or WebP format'
        )
        .optional()
    : z.instanceof(File, { message: 'Please select an image file' })
        .refine((file) => file.size <= 8 * 1024 * 1024, 'File size must be under 8MB')
        .refine(
          (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
          'File must be JPG, PNG, or WebP format'
        )
})

type ArtworkUploadFormValues = z.infer<ReturnType<typeof createArtworkUploadSchema>>

interface ArtworkUploadFormProps {
  onSuccess?: (artwork: ArtworkRecord) => void
  onError?: (error: string) => void
  editingArtwork?: ArtworkRecord | null
}

const categoryLabels: Record<ArtworkCategory, string> = {
  'painting': 'Painting',
  'digital-art': 'Digital Art',
  'photography': 'Photography',
  'sculpture': 'Sculpture',
  'mixed-media': 'Mixed Media',
  'drawing': 'Drawing',
  'other': 'Other'
}

export function ArtworkUploadForm({ onSuccess, onError, editingArtwork }: ArtworkUploadFormProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
    resolver: zodResolver(createArtworkUploadSchema(isEditMode)),
    defaultValues: {
      title: editingArtwork?.title || '',
      description: editingArtwork?.description || '',
      category: editingArtwork?.category || undefined,
      imageFile: undefined
    }
  })

  // Initialize preview URL with existing image if editing
  useEffect(() => {
    if (editingArtwork?.image_url) {
      setPreviewUrl(editingArtwork.image_url)
    }
  }, [editingArtwork])

  const handleFileSelect = (file: File) => {
    form.setValue('imageFile', file)
    form.clearErrors('imageFile')
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
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

      // Only upload new image if a file was provided
      if (data.imageFile) {
        // 1. Upload to Uploadthing
        const uploadRes = await startUpload([data.imageFile]);

        if (!uploadRes || uploadRes.length === 0) {
          throw new Error("Failed to upload image");
        }

        imageUrl = uploadRes[0].url;
      }

      // 2. Save metadata to MongoDB (create or update)
      const endpoint = isEditMode ? `/api/artworks/${editingArtwork.id}` : '/api/artworks'
      const method = isEditMode ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          image_url: imageUrl,
          artist_id: user.id,
          artist_name: user.display_name || user.email
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
    <Card className="glass border-border/50 bg-card/50 backdrop-blur-xl">
      <CardHeader className="text-center px-4 sm:px-6 py-6 sm:py-8">
        <CardTitle className="flex items-center justify-center gap-2 text-foreground text-lg sm:text-xl">
          {isEditMode ? <Edit className="w-5 h-5 sm:w-6 sm:h-6" /> : <Upload className="w-5 h-5 sm:w-6 sm:h-6" />}
          {isEditMode ? 'Edit Your Artwork' : 'Upload Your Artwork'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    {isEditMode ? 'Artwork Image (Optional - leave unchanged to keep current)' : 'Artwork Image'}
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                        }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {previewUrl ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-32 sm:max-h-48 rounded-lg object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8"
                              onClick={() => {
                                form.setValue('imageFile', null as any)
                                setPreviewUrl(null)
                              }}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{form.getValues('imageFile')?.name}</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Drag and drop your image here, or click to browse</p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileSelect(file)
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="glass border-0 bg-transparent text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Choose File
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

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artwork title" className="glass border-border/50 bg-background/50 h-10 sm:h-12 text-sm sm:text-base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass border-border/50 bg-background/50 h-10 sm:h-12 text-sm sm:text-base">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-sm sm:text-base">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your artwork..." className="glass border-border/50 bg-background/50 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base p-3 sm:p-4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              className="w-full btn-primary glow-primary py-3 sm:py-4 text-sm sm:text-base font-medium"
            >
              {isUploading ? (isEditMode ? "Updating..." : "Uploading...") : (isEditMode ? "Update Artwork" : "Upload Artwork")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}