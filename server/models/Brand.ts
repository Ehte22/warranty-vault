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
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Brand: Model<IBrand> = mongoose.model<IBrand>("brand", brandSchema)
export default Brand