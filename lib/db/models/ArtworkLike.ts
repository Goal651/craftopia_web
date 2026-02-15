import mongoose from "mongoose"

const ArtworkLikeSchema = new mongoose.Schema({
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
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
})

// Compound index to prevent duplicate likes
ArtworkLikeSchema.index({ artwork_id: 1, user_id: 1 }, { unique: true })

// Index for querying user's likes
ArtworkLikeSchema.index({ user_id: 1 })

// Index for querying artwork likes
ArtworkLikeSchema.index({ artwork_id: 1 })

export default mongoose.models.ArtworkLike || mongoose.model("ArtworkLike", ArtworkLikeSchema)
