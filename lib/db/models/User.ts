import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    display_name: {
        type: String,
        required: true,
    },
    avatar_url: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
