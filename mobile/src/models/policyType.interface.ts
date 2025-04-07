export interface IPolicyType {
    _id?: string
    user?: { _id: string, name: string }
    name: string
    description: string,
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}