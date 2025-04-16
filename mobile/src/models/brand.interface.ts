export interface IBrand extends Document {
    _id?: string
    serialNo?: number
    user?: { _id?: string, name?: string }
    name: string
    description?: string
    logo?: string
    remove?: boolean
    isActive?: boolean
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}