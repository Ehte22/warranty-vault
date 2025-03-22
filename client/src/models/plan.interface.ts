export interface IPlan {
    _id?: string
    name: string
    maxProducts?: string | null
    maxPolicies?: string | null
    maxPolicyTypes?: string | null
    maxBrands?: string | null
    allowedFamilyMembers?: boolean
    billingCycle: string,
    price: string | null
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}
