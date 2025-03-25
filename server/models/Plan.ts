import mongoose, { Model, Schema } from "mongoose"

export interface IPlan {
    name: string
    title: string
    priority: string
    maxProducts: string
    maxPolicies: string
    maxPolicyTypes: string
    maxBrands: string | null
    maxNotifications: string
    allowedFamilyMembers?: boolean
    maxFamilyMembers?: string
    billingCycle: string,
    price: { monthly: string, yearly: string }
    includes: string[]
    isActive?: boolean
    deletedAt?: Date | null
}

const planSchema = new Schema<IPlan>({
    name: { type: String, required: true, enum: ["Free", "Pro", "Family"] },
    title: { type: String, required: true },
    priority: { type: String, required: true },
    maxProducts: { type: String, trim: true },
    maxPolicies: { type: String, trim: true },
    maxPolicyTypes: { type: String, trim: true },
    maxBrands: { type: String, trim: true },
    maxNotifications: { type: String, trim: true },
    allowedFamilyMembers: { type: Boolean, default: false },
    maxFamilyMembers: { type: String },
    price: {
        monthly: { type: String, default: "0" },
        yearly: { type: String, default: "0" },
    },
    includes: [{ type: String }],
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Plan: Model<IPlan> = mongoose.model<IPlan>("Plan", planSchema)
export default Plan