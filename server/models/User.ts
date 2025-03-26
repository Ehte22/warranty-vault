import mongoose, { Schema } from "mongoose";

export interface IUser extends Document {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone: string
    confirmPassword?: string
    profile?: string
    role: 'Admin' | 'User'
    status: 'active' | 'inactive';
    sessionToken: string | null
    plan?: string
    subscription?: {
        startDate: string
        expiryDate: string
        paymentStatus: string
    }
    owner: { _id: mongoose.Schema.Types.ObjectId, name: string }
    new?: boolean
}

export interface IOTP extends Document {
    username: string
    otp: string
    expiry: Date
}

const userSchema = new Schema<IUser>({
    owner: {
        _id: { type: mongoose.Types.ObjectId },
        name: { type: String }
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, default: "", trim: true },
    password: { type: String, trim: true },
    profile: { type: String, trim: true },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: "User",
        required: true
    },
    status: { type: String, default: "active", enum: ['active', 'inactive'] },
    sessionToken: { type: String, default: null },
    plan: { type: String, enum: ["Free", "Pro", "Family"], default: "Free" },
    subscription: {
        startDate: { type: Date },
        expiryDate: { type: Date },
        paymentStatus: { type: String, enum: ["Active", "Expired", "Pending"], default: "Pending" },
    }

}, { timestamps: true });

const OTPSchema = new Schema<IOTP>({
    username: { type: String },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true }
}, { timestamps: true })

export const User = mongoose.model<IUser>("User", userSchema);
export const OTP = mongoose.model<IOTP>("Otp", OTPSchema)

