import mongoose, { Model, Schema } from "mongoose"

export interface IProduct {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    brand: { _id: mongoose.Schema.Types.ObjectId, name: string }
    name: string
    model?: string
    purchaseDate?: Date
    image?: string
    isActive?: boolean
    deletedAt?: Date | null
    policies: [mongoose.Schema.Types.ObjectId]
}

const productSchema = new Schema<IProduct>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        name: { type: String, required: true }
    },
    brand: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "Brand" },
        name: { type: String, required: true }
    },
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    purchaseDate: { type: Date, required: true, trim: true },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    policies: [mongoose.Schema.Types.ObjectId],
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema)
export default Product