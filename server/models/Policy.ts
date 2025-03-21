import mongoose, { Model, Schema } from "mongoose"

export interface IPolicy {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    product: { _id: mongoose.Schema.Types.ObjectId, name: string }
    type: string
    provider: string
    expiryDate: Date
    document: string
    isActive?: boolean
    deletedAt?: Date | null
}

const policySchema = new Schema<IPolicy>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    product: {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    type: { type: String, required: true, enum: ["Warranty", "Insurance"] },
    provider: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    document: { type: String },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Policy: Model<IPolicy> = mongoose.model<IPolicy>("policy", policySchema)
export default Policy