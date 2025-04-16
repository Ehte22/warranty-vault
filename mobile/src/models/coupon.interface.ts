export interface ICoupon {
    _id?: string
    serialNo?: number
    code: string
    discountType: "Percentage" | "Fixed Amount"
    discountValue: string
    expiryDate: Date
    usageLimit?: string
    usedCount: string
    minPurchase?: string
    maxDiscount?: string
    usersAllowed?: { _id?: string, name?: string }[]
    isActive?: boolean
    deletedAt?: Date | null
}