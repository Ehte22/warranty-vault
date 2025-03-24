export interface IPlan {
    _id?: string
    name: string
    title: string
    priority: string
    maxProducts?: string | null
    maxPolicies?: string | null
    maxPolicyTypes?: string | null
    maxBrands?: string | null
    allowedFamilyMembers?: boolean
    billingCycle: string,
    price: { monthly: string, yearly: string }
    includes?: string[]
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}
