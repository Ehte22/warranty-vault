import mongoose, { Model, Schema } from "mongoose"

export interface IPolicy {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    product: { _id: mongoose.Schema.Types.ObjectId, name: string }
    type: { _id: mongoose.Schema.Types.ObjectId, name: string }
    provider: string
    expiryDate: Date
    document: string
    isActive?: boolean
    deletedAt?: Date | null
}

const policySchema = new Schema<IPolicy>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "User", },
        name: { type: String, required: true }
    },
    product: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "Product" },
        name: { type: String, required: true }
    },
    type: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "PolicyType" },
        name: { type: String, required: true }
    },
    provider: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true, trim: true },
    document: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Policy: Model<IPolicy> = mongoose.model<IPolicy>("Policy", policySchema)
export default Policy