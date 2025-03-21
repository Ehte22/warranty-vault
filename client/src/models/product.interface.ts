export interface IProduct {
    _id?: string
    name: string,
    brand: { _id: string, name: string }
    image: string
    model: string;
    purchaseDate: Date
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date | null
}