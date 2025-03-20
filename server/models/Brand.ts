import mongoose, { Document, Model, Schema } from "mongoose"

export interface IBrand extends Document {
    name: string
    description?: string
    logo?: string
    isActive?: boolean
    deletedAt?: Date | null
}

const brandSchema = new Schema<IBrand>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    isActive: { type: String, default: true },
    deletedAt: { type: String, default: null },
}, { timestamps: true })

const Brand: Model<IBrand> = mongoose.model<IBrand>("brand", brandSchema)
export default Brand