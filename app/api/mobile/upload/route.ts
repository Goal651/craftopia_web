import { NextRequest, NextResponse } from 'next/server'
import { UTApi } from 'uploadthing/server'
import { getMobileSession, unauthorized, forbidden } from '@/lib/mobile-auth'
import { isAdminUser } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * Admin-only image upload for the mobile app.
 * Accepts multipart/form-data with one or more `files` entries (images),
 * uploads them to UploadThing, and returns their public URLs.
 */
export async function POST(request: NextRequest) {
    try {
        const session = getMobileSession(request)
        if (!session) return unauthorized()
        if (!isAdminUser(session)) return forbidden()

        const formData = await request.formData()
        const entries = formData.getAll('files').filter((e): e is File => e instanceof File)

        if (entries.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        for (const file of entries) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'Only image files are allowed' },
                    { status: 400 }
                )
            }
            if (file.size > 8 * 1024 * 1024) {
                return NextResponse.json(
                    { error: 'Images must be 8MB or smaller' },
                    { status: 400 }
                )
            }
        }

        const utapi = new UTApi()
        const results = await utapi.uploadFiles(entries)

        const urls: string[] = []
        const errors: string[] = []
        for (const result of results) {
            if (result && 'data' in result && result.data?.url) {
                urls.push(result.data.url)
            } else if (result && 'error' in result && result.error) {
                errors.push(result.error.message || 'Upload failed')
            }
        }

        if (urls.length === 0) {
            return NextResponse.json(
                { error: errors[0] || 'Upload failed' },
                { status: 500 }
            )
        }

        return NextResponse.json({ urls, errors })
    } catch (error) {
        console.error('Mobile upload error:', error)
        return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 })
    }
}
