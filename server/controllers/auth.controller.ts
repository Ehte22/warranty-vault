import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import bcryptjs from "bcryptjs"
import jwt, { JwtPayload } from "jsonwebtoken"
import crypto from "crypto"
import { IOTP, IUser, OTP, User } from "../models/User"
import { sendEmail } from "../utils/email"
import { customValidator } from "../utils/validator"
import { forgotPasswordRules, registerRules, resetPasswordRules, sendOTPRules, signInRules, verifyOTPRules } from "../rules/user.rules"
import { generateResetToken, generateToken } from "../utils/generateToken"
import { otpVerificationTemplate } from "../templates/otpVerificationTemplate"
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate"
import dotenv from "dotenv";
import { IUserProtected } from "../utils/protected"
import cloudinary from "../utils/uploadConfig"
import passport from "../services/passport"

dotenv.config({})

// Sign Up
export const SignUp = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, email, phone, password, confirmPassword }: IUser = req.body

    const user = await User.findOne({ $or: [{ email }, { phone }] }).select("-password, -__v, -updatedAt, -createdAt").lean()

    if (user) {
        if (user.email == email) {
            return res.status(409).json({ message: "Email already exist" })
        }
        if (user.phone == phone) {
            return res.status(409).json({ message: "Phone number already exist" })
        }
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password do not match" })
    }

    let profile = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    const { isError, error } = customValidator({ ...req.body, profile, role: "User" }, registerRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const hashPassword = await bcryptjs.hash(password, 10)

    const newUser = await User.create({
        name,
        email,
        phone,
        password: hashPassword,
        profile
    })

    const token = generateToken({ userId: newUser._id, name: newUser.name, role: newUser.role })

    const result = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profile: newUser.profile,
        role: newUser.role,
        plan: newUser.plan,
        token
    }

    return res.status(200).json({ message: "Sign up successfully", result })
})

// Sign In
export const signIn = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password }: IUser = req.body

    const { isError, error } = customValidator(req.body, signInRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error })
    }

    const user = await User.findOne({ email }).select("-password, -__v, -updatedAt, -createdAt").lean()

    if (!user) {
        return res.status(401).json({ message: "Invalid Credential - Email not found" })
    }


    const verifyPassword = await bcryptjs.compare(password, user.password)
    if (!verifyPassword) {
        return res.status(401).json({ message: "Invalid Credential - Password do not match" })
    }

    if (user.status === "inactive") {
        return res.status(403).json({ message: "Your account has been deactivated. Contact support." });
    }

    const token = generateToken({ userId: user._id, name: user.name, role: user.role })

    // await User.findByIdAndUpdate(user._id, { sessionToken: token })

    const result = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        role: user.role,
        plan: user.plan,
        token
    }
    res.status(200).json({ message: "Sign in successfully", result })
})

// Sign Out
export const signOut = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const { userId } = req.user as IUserProtected

    await User.findByIdAndUpdate(userId, { sessionToken: null })

    res.status(200).json({ message: "Sign out successfully" });
});

// Google Login
export const googleLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })(req, res, next)
})

// Google Login Response
export const googleLoginResponse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: Error, user: IUser, info: any) => {
        if (err) {
            return res.status(400).json({ message: err.message })
        }

        if (!user) {
            return res.status(400).json({ message: info.message })
        }

        const token = generateToken({ userId: user._id, name: user.name, role: user.role })

        // await User.findByIdAndUpdate(user._id, { sessionToken: token })

        const result = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile: user.profile,
            role: user.role,
            token
        }

        const redirectUrl = `${process.env.FRONTEND_URL}?result=${encodeURIComponent(JSON.stringify(result))}`
        res.redirect(redirectUrl)

    })(req, res, next)
})

// Send OTP
export const sendOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { username }: IOTP = req.body
    const { isError, error } = customValidator(req.body, sendOTPRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({ username, otp, expiry: otpExpiry })

    const otpVerificationTemp = otpVerificationTemplate(otp)

    await sendEmail({
        to: username,
        subject: 'Your OTP Code',
        text: otpVerificationTemp,
    });

    res.status(200).json({ message: "OTP sent successfully" })
})

// Verify OTP
export const verifyOTP = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, otp }: IOTP = req.body

    const { isError, error } = customValidator(req.body, verifyOTPRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const result = await OTP.findOne({ username, otp })

    if (!result) {
        return res.status(400).json({ message: "Invalid OTP or expired" })
    }

    if (result) {
        if (new Date() > result?.expiry) {
            return res.status(400).json({ message: "OTP expired" })
        }

        if (result?.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
    }

    await OTP.deleteOne({ username, otp });
    res.status(200).json({ message: "OTP verified successfully" })

})

// Forgot Password
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email } = req.body

    const { isError, error } = customValidator(req.body, forgotPasswordRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error })
    }

    const user = await User.findOne({ email }).lean()

    if (!user) {
        return res.status(404).json({ message: "User not found with given email" })
    }

    const resetToken = await generateResetToken({ email })
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const resetPasswordTemp = resetPasswordTemplate(resetLink)

    await sendEmail({
        to: email,
        subject: "Password Reset Request",
        text: resetPasswordTemp
    });

    res.status(200).json({ message: "Password reset email sent successfully" });
})

// Reset Password
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { password, confirmPassword, token } = req.body

    const { isError, error } = customValidator(req.body, resetPasswordRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error })
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password do not match" })
    }

    const secretKey = process.env.JWT_KEY

    let decodedToken: string | JwtPayload | null = null

    try {
        if (secretKey) {
            decodedToken = jwt.verify(token, secretKey);
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    if (!decodedToken) {
        return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    const email = (decodedToken as JwtPayload).email
    if (!email) {
        return res.status(422).json({ message: "Email not verified" })
    }

    const user = await User.findOne({ email }).lean()

    const hashPass = await bcryptjs.hash(password, 10)

    await User.findByIdAndUpdate(user?._id, { password: hashPass })

    res.status(200).json({ message: "Password reset success" })
})

