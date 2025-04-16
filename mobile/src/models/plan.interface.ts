export interface IPlan {
    _id?: string
    serialNo?: number
    name: string
    title: string
    priority: string
    maxProducts?: string | null
    maxPolicies?: string | null
    maxPolicyTypes?: string | null
    maxBrands?: string | null
    allowedFamilyMembers?: boolean
    maxFamilyMembers?: string
    maxNotifications?: string
    billingCycle: string
    type: string
    price: { monthly: string, yearly: string }
    includes?: string[]
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}
