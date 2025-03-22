import mongoose, { Document, Model, Schema } from "mongoose"

export interface IBrand extends Document {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    name: string
    description?: string
    logo?: string
    isActive?: boolean
    deletedAt?: Date | null
}

const brandSchema = new Schema<IBrand>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        name: { type: String, required: true }
    },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Brand: Model<IBrand> = mongoose.model<IBrand>("Brand", brandSchema)
export default Brand