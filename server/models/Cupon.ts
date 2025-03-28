import mongoose, { Model, Schema } from "mongoose";

export interface ICoupon {
    code: string
    discountType: "Percentage" | "Fixed Amount"
    discountValue: string
    expiryDate: Date
    usageLimit: string
    usedCount: number
    minPurchase?: string
    maxDiscount?: string
    usersAllowed?: { _id: string, name: string }[]
    isActive?: boolean
    deletedAt?: Date | null
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, trim: true },
    discountType: { type: String, required: true, enum: ["Percentage", "Fixed Amount"] },
    discountValue: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: String, required: false },
    usedCount: { type: Number, default: 0 },
    minPurchase: { type: String },
    maxDiscount: { type: String },
    usersAllowed: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, name: { type: String } }],
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema)
export default Coupon