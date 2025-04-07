export interface IUser {
    _id?: string
    name: string;
    email: string;
    phone: string
    password?: string;
    confirmPassword?: string
    profile?: string
    role?: 'Admin' | 'User'
    status?: 'active' | 'inactive';
    token?: string
    plan?: string
    type?: string
    referralCode?: string
    referrals?: { _id: string, name: string }[]
    referredBy?: string
    referralLink?: string
    points?: number
    subscription?: {
        startDate: string
        expiryDate: string
        paymentStatus: string
    }
}