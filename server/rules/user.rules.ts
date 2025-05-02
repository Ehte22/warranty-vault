import { validationRulesSchema } from "../utils/validator";

export const registerRules: validationRulesSchema = {
    name: { required: true },
    email: { required: true, email: true },
    phone: {
        required: true, pattern: /^[6-9]\d{9}$/
    },
    password: { required: true, min: 8, max: 16 },
    role: { required: true },
    referralCode: { required: true },
    profile: { required: false },
}

export const sendOTPRules: validationRulesSchema = {
    username: { required: true },
}

export const verifyOTPRules: validationRulesSchema = {
    username: { required: true },
    otp: { required: true }
}

export const signInRules: validationRulesSchema = {
    username: { required: true },
    password: { required: true }
}

export const forgotPasswordRules: validationRulesSchema = {
    email: { required: true, email: true },
}

export const resetPasswordRules: validationRulesSchema = {
    password: { required: true, min: 8, max: 16 },
    confirmPassword: { required: true },
}