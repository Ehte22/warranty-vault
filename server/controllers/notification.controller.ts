import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import Notification from "../models/Notification"
import { notificationRules } from "../rules/notification.rules"

// Get All
export const getAllNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

    const { userId } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            { "user._id": userId },
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { "product.name": { $regex: searchQuery, $options: "i" } },
                        { "policy.name": { $regex: searchQuery, $options: "i" } },
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Notification.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Notification.find({ "user._id": userId, deletedAt: null }).sort({ createdAt: -1 }).lean()
    } else {
        result = await Notification.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Notifications Fetch Successfully", result, pagination })
})

// Get By ID
export const getNotificationById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Notification.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Notification Not Found" })
    }

    res.status(200).json({ message: "Notification Fetch Successfully", result })
})

// Add
export const addNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { product, policy, scheduleDate } = req.body

    const { userId, name: userName } = req.user as IUserProtected

    const notification = await Notification.findOne({
        "user._id": userId,
        "product._id": product._id,
        "policy._id": policy._id,
        scheduleDate: {
            $gte: new Date(scheduleDate).setHours(0, 0, 0, 0),
            $lt: new Date(scheduleDate).setHours(23, 59, 59, 999)
        }
    }).lean()
    if (notification) {
        return res.status(400).json({ message: "Notification Already Exist" })
    }

    const data = { ...req.body, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, notificationRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Notification.create(data)

    res.status(200).json({ message: "Notification Add Successfully", result })
})

// Update
export const updateNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const notification = await Notification.findById(id).lean()
    if (!notification) {
        return res.status(404).json({ message: "Notification Not Found" })
    }

    await Notification.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Notification Update Successfully" })
})

// Update Status
export const updateNotificationStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const notification = await Notification.findById(id).lean()
    if (!notification) {
        return res.status(404).json({ message: "Notification Not Found" })
    }

    await Notification.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Notification Status Update Successfully" })
})

// Delete
export const deleteNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const notification = await Notification.findById(id)

    if (!notification) {
        return res.status(404).json({ message: "Notification Not Found" })
    }

    await Notification.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Notification delete successfully" })
})