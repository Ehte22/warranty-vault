export interface IBrand extends Document {
    _id?: string
    user?: { _id?: string, name?: string }
    name: string
    description?: string
    logo?: string
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}