import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import PolicyType from "../models/PolicyType"

// Get All
export const getAllPolicyTypes = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                        { name: { $regex: searchQuery, $options: "i" } },
                    ]
                }
                : {}
        ]
    }

    const totalBrands = await PolicyType.countDocuments(query)
    const totalPages = Math.ceil(totalBrands / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await PolicyType.find({ "user._id": userId }).sort({ createdAt: -1 }).lean()
    } else {
        result = await PolicyType.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries: totalBrands,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Policy Types Fetch Successfully", result, pagination })
})

// Get By ID
export const getPolicyTypeById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await PolicyType.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Policy Type Not Found" })
    }

    res.status(200).json({ message: "Policy Type Fetch Successfully", result })
})

// Add
export const addPolicyType = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name } = req.body

    const policyType = await PolicyType.findOne({ name }).lean()
    if (policyType) {
        return res.status(400).json({ message: "Policy type Already Exist" })
    }

    const { userId, name: userName } = req.user as IUserProtected

    const data = { ...req.body, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, { name: { required: true, min: 2, max: 100 } })

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await PolicyType.create(data)

    res.status(200).json({ message: "Policy Type Add Successfully", result })
})

// Update
export const updatePolicyType = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const policyType = await PolicyType.findById(id).lean()
    if (!policyType) {
        return res.status(404).json({ message: "Policy Type Not Found" })
    }

    await PolicyType.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Policy Type Update Successfully" })
})

// Update Status
export const updatePolicyTypeStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const policyType = await PolicyType.findById(id).lean()
    if (!policyType) {
        return res.status(404).json({ message: "Policy Type Not Found" })
    }

    await PolicyType.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "PolicyType Status Update Successfully" })
})

// Delete
export const deletePolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const policyType = await PolicyType.findById(id)

    if (!policyType) {
        return res.status(404).json({ message: "Policy Type Not Found" })
    }

    await PolicyType.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "User delete successfully" })
})