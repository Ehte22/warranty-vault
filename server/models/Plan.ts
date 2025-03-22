import mongoose, { Model, Schema } from "mongoose"

export interface IPlan {
    name: string
    maxProducts?: string | null
    maxPolicies?: string | null
    maxPolicyTypes?: string | null
    maxBrands?: string | null
    allowedFamilyMembers?: boolean
    billingCycle: string,
    price: string | null
    isActive?: boolean
    deletedAt?: Date | null
}

const planSchema = new Schema<IPlan>({
    name: { type: String, required: true, enum: ["Free", "Pro", "Family"] },
    maxProducts: { type: String, required: true, trim: true },
    maxPolicies: { type: String, trim: true },
    maxPolicyTypes: { type: String, trim: true },
    maxBrands: { type: String, trim: true },
    allowedFamilyMembers: { type: Boolean, default: false },
    billingCycle: { type: String, required: true, enum: ["Monthly", "Yearly"] },
    price: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Plan: Model<IPlan> = mongoose.model<IPlan>("Plan", planSchema)
export default Plan