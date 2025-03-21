export interface IPolicyType {
    user: { _id: mongoose.Schema.Types.ObjectId, name: string }
    name: string
    description: string,
    isActive?: boolean
    deletedAt?: Date | null
}