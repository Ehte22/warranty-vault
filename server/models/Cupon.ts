import mongoose, { Model, Schema } from "mongoose";

export interface ICoupon {
    code: string
    discountType: "Percentage" | "Fixed Amount"
    discountValue: string
    expiryDate: Date
    usageLimit: string
    minPurchase?: string
    maxDiscount?: string
    userAllowed?: string
    usedCount?: string
}

const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true, trim: true },
    discountType: { type: String, required: true, enum: ["Percentage", "Fixed Amount"] },
    discountValue: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: String, required: true },
    minPurchase: { type: String },
    maxDiscount: { type: String },
    userAllowed: { type: String },
    usedCount: { type: String }
}, { timestamps: true })

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema)
export default Coupon