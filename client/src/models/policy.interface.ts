export interface IPolicy {
    _id?: string;
    user?: { _id: string, name: string }
    product?: { _id: string, name: string }
    type: { _id: string, name: string }
    provider: string
    expiryDate: Date
    document: string
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}