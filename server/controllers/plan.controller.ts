import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import cloudinary from "../utils/uploadConfig"
import Plan from "../models/Plan"
import { planRules } from "../rules/plan.rules"

// Get All
export const getAllPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

    const { userId } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalBrands = await Plan.countDocuments(query)
    const totalPages = Math.ceil(totalBrands / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Plan.find().sort({ createdAt: -1 }).lean()
    } else {
        result = await Plan.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries: totalBrands,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Plans Fetch Successfully", result, pagination })
})

// Get By ID
export const getPlanById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Plan.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    res.status(200).json({ message: "Plan Fetch Successfully", result })
})

// Add
export const addPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name } = req.body

    const plan = await Plan.findOne({ name }).lean()
    if (plan) {
        return res.status(400).json({ message: "Plan Already Exist" })
    }

    let data = req.body
    if (name === "Free") {
        data = { ...req.body, maxProducts: "2", maxPolicies: "2", maxPolicyTypes: "2", maxBrands: "2" }
    } else if (name === "Pro") {
        data = { ...req.body, maxProducts: null, maxPolicies: null, maxPolicyTypes: null, maxBrands: null }
    } else if (name === "Family") {
        data = { ...req.body, maxProducts: null, maxPolicies: null, maxPolicyTypes: null, maxBrands: null, allowedFamilyMembers: true }
    }

    const { isError, error } = customValidator(data, planRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Plan.create(data)

    res.status(200).json({ message: "Plan Add Successfully", result })
})

// Update
export const updatePlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const plan = await Plan.findById(id).lean()
    if (!plan) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    await Plan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Plan Update Successfully" })
})

// Update Status
export const updatePlanStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const plan = await Plan.findById(id).lean()
    if (!plan) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    await Plan.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Plan Status Update Successfully" })
})

// Delete
export const deletePlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const plan = await Plan.findById(id)

    if (!plan) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    await Plan.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "User delete successfully" })
})