import mongoose, { Model, Schema } from "mongoose"

export interface IPolicyType {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    name: string
    description: string,
    isActive?: boolean
    deletedAt?: Date | null
}

const policyTypeSchema = new Schema<IPolicyType>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    name: { type: String, required: true, unique: true },
    description: { type: String, },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const PolicyType: Model<IPolicyType> = mongoose.model<IPolicyType>("policyType", policyTypeSchema)
export default PolicyType