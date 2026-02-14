import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/mongodb'
import Artwork from '@/lib/db/models/Artwork'

export async function GET() {
    try {
        await dbConnect()

        const categoryCounts = await Artwork.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ])

        // Map the aggregation result to a cleaner format
        const categories = categoryCounts.map(item => ({
            name: item._id,
            count: item.count
        }))

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Fetch categories error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
