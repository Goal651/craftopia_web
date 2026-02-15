import mongoose from "mongoose"

const ArtworkCommentSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000 // Limit comment length
    },
    parent_id: {
        type: String,
        ref: 'ArtworkComment',
        default: null // For threaded comments
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    likes_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Index for querying comments by artwork
ArtworkCommentSchema.index({ artwork_id: 1, created_at: -1 })

// Index for querying user's comments
ArtworkCommentSchema.index({ user_id: 1, created_at: -1 })

// Index for threaded comments
ArtworkCommentSchema.index({ parent_id: 1 })

// Index for filtering deleted comments
ArtworkCommentSchema.index({ is_deleted: 1 })

export default mongoose.models.ArtworkComment || mongoose.model("ArtworkComment", ArtworkCommentSchema)
