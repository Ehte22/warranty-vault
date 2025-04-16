export interface INotification {
    _id?: string
    serialNo?: number
    user?: { _id: string, name: string }
    product?: { _id: string, name: string }
    policy?: { _id: string, name: string }
    message: string
    status?: string
    scheduleDate: Date
    deletedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}