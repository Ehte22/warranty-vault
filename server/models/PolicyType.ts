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
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        name: { type: String, required: true }
    },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const PolicyType: Model<IPolicyType> = mongoose.model<IPolicyType>("PolicyType", policyTypeSchema)
export default PolicyType