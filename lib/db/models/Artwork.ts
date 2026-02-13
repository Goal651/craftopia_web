import mongoose from "mongoose"

const ArtworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: [
            'painting', 'digital-art', 'photography',
            'sculpture', 'mixed-media', 'drawing', 'other'
        ],
    },
    image_url: {
        type: String,
        required: true,
    },
    image_path: {
        type: String,
    },
    artist_id: {
        type: String,
        required: true,
    },
    artist_name: {
        type: String,
        required: true,
    },
    view_count: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
})

// Text index for search
ArtworkSchema.index({
    title: "text",
    artist_name: "text",
    description: "text"
})

export default mongoose.models.Artwork || mongoose.model("Artwork", ArtworkSchema)
