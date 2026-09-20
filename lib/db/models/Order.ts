import mongoose from "mongoose"

const OrderSchema = new mongoose.Schema(
    {
        artwork_id: {
            type: String,
            required: true,
        },
        // Snapshot of artwork info at order time (survives artwork edits)
        artwork_title: {
            type: String,
            default: "Untitled",
        },
        artwork_image: {
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
        price: {
            type: Number,
            required: true,
        },
        buyer_name: {
            type: String,
            required: true,
            trim: true,
        },
        buyer_phone: {
            type: String,
            required: true,
            trim: true,
        },
        delivery_address: {
            type: String,
            required: true,
            trim: true,
        },
        note: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["new", "contacted", "delivered", "cancelled"],
            default: "new",
        },
    },
    {
        timestamps: true,
    }
)

OrderSchema.index({ artist_id: 1, status: 1 })
OrderSchema.index({ artwork_id: 1 })

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
