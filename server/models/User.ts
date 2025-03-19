import mongoose, { Schema } from "mongoose";

export interface IUser extends Document {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone: number
    confirmPassword?: string
    profile?: string
    role: 'Admin' | 'User'
    status: 'active' | 'inactive';
    sessionToken: string | null
}

export interface IOTP extends Document {
    username: string
    otp: string
    expiry: Date
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: Number, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    profile: { type: String, trim: true },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: "User",
        required: true
    },
    status: { type: String, default: "active", enum: ['active', 'inactive'] },
    sessionToken: { type: String, default: null },
}, { timestamps: true });

const OTPSchema = new Schema<IOTP>({
    username: { type: String },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true }
}, { timestamps: true })

export const User = mongoose.model<IUser>("User", userSchema);
export const OTP = mongoose.model<IOTP>("Otp", OTPSchema)

