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
    role: {
        type: String,
        enum: ['user', 'staff', 'admin'],
        default: 'user',
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active',
    },
}, {
    timestamps: true,
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
