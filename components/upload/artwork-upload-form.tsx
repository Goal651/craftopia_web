"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
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
import { useAuth } from '@/contexts/auth-context'
import { useUploadErrorHandler } from '@/components/error-boundaries'
import type { ArtworkCategory, ArtworkRecord } from '@/types'

// Validation schema based on requirements
const artworkUploadSchema = z.object({
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
  imageFile: z.instanceof(File, { message: 'Please select an image file' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be under 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPG, PNG, or WebP format'
    )
})

type ArtworkUploadForm = z.infer<typeof artworkUploadSchema>

interface ArtworkUploadFormProps {
  onSuccess?: (artwork: ArtworkRecord) => void
  onError?: (error: string) => void
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

export function ArtworkUploadForm({ onSuccess, onError }: ArtworkUploadFormProps) {
  const { user } = useAuth()
  const { handleError: handleUploadError, retry, reset, hasError } = useUploadErrorHandler()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const form = useForm<ArtworkUploadForm>({
    resolver: zodResolver(artworkUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      imageFile: undefined
    }
  })

  // Handle file selection
  const handleFileSelect = (file: File) => {
    form.setValue('imageFile', file)
    form.clearErrors('imageFile')
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Handle form submission
  const onSubmit = async (data: ArtworkUploadForm) => {
    if (!user) {
      toast.error('You must be logged in to upload artwork')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('category', data.category)
      formData.append('imageFile', data.imageFile)

      const response = await fetch('/api/artworks/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          toast.warning(warning)
        })
      }
      
      toast.success('Artwork uploaded successfully!')
      
      // Reset form
      form.reset()
      setPreviewUrl(null)
      
      onSuccess?.(result.artwork)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      // Handle different types of errors
      if (error instanceof Error) {
        handleUploadError(error)
      }
      
      toast.error(errorMessage)
      onError?.(errorMessage)
      
      // Increment retry count for internal tracking
      setRetryCount(prev => prev + 1)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!user) {
    return (
      <Card className="glass border-0 bg-white/5 backdrop-blur-xl border border-gray-800">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please log in to upload your artwork to the public gallery.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-0 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Your Artwork
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Area */}
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artwork Image</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {previewUrl ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-48 rounded-lg object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => {
                                form.setValue('imageFile', null as any)
                                setPreviewUrl(null)
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {form.getValues('imageFile')?.name}
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-2">
                            Drag and drop your image here, or click to browse
                          </p>
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
                            className="glass border-0 bg-transparent"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload JPG, PNG, or WebP files up to 10MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter artwork title"
                      className="glass border-0 bg-white/5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass border-0 bg-white/5">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your artwork..."
                      className="glass border-0 bg-white/5 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share the story behind your artwork (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full glass border-0 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Artwork
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}