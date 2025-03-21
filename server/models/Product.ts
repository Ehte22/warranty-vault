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
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    brand: {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String, required: true }
    },
    name: { type: String, required: true },
    model: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    policies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Policy" }],
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Product: Model<IProduct> = mongoose.model<IProduct>("product", productSchema)
export default Product