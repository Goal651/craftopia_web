import mongoose from "mongoose"

const ArtworkViewSchema = new mongoose.Schema({
    artwork_id: {
        type: String,
        required: true,
        ref: 'Artwork'
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    viewed_at: {
        type: Date,
        default: Date.now
    },
    ip_address: {
        type: String,
        required: false // For anonymous users
    },
    user_agent: {
        type: String,
        required: false // For analytics
    }
}, {
    timestamps: { createdAt: 'viewed_at', updatedAt: false }
})

// Compound index to prevent duplicate views from same user
ArtworkViewSchema.index({ artwork_id: 1, user_id: 1 }, { unique: true })

// Index for querying user's view history
ArtworkViewSchema.index({ user_id: 1 })

// Index for querying artwork views
ArtworkViewSchema.index({ artwork_id: 1 })

// Index for analytics
ArtworkViewSchema.index({ viewed_at: -1 })

export default mongoose.models.ArtworkView || mongoose.model("ArtworkView", ArtworkViewSchema)
