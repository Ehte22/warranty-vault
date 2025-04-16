export interface IPolicy {
    _id?: string;
    serialNo?: number
    user?: { _id: string, name: string }
    product?: { _id: string, name: string }
    name: { _id: string, name: string }
    provider: string
    expiryDate: Date
    document: string
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}