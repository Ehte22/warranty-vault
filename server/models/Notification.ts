import mongoose, { Model, Schema } from "mongoose"

export interface INotification {
    user: { _id: mongoose.Types.ObjectId, name: string }
    product: { _id: mongoose.Types.ObjectId, name: string }
    policy: { _id: any, name: string }
    message: string
    status: string
    scheduleDate: Date
    sentAt?: Date | null
    deletedAt?: Date | null
}

const notificationSchema = new Schema<INotification>({
    user: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        name: { type: String, required: true }
    },
    product: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "Product" },
        name: { type: String, required: true }
    },
    policy: {
        _id: { type: mongoose.Schema.ObjectId, required: true, ref: "Policy" },
        name: { type: String, required: true }
    },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Sent"], default: "Pending" },
    scheduleDate: { type: Date, required: true },
    sentAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
}, { timestamps: true })

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema)
export default Notification