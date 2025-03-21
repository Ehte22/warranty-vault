export interface IProduct {
    name: string,
    brand: { _id: string, name: string }
    image: File
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}