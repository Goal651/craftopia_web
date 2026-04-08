import mongoose from "mongoose"

const ArtworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
    },
    image_url: {
        type: String,
        required: true,
    },
    image_path: {
        type: String,
    },
    images: [{
        type: String,
    }],
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
    price: {
        type: Number,
        default: 0,
    },
    stock_quantity: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        default: 'Artwork',
    },
    medium: {
        type: String,
    },
    dimensions: {
        type: String,
    },
    year: {
        type: Number,
    },
    featured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

// Text index for search
ArtworkSchema.index({
    title: "text",
    artist_name: "text"
})

export default mongoose.models.Artwork || mongoose.model("Artwork", ArtworkSchema)
