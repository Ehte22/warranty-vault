import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator, validationRulesSchema } from "../utils/validator"
import Plan from "../models/Plan"
import { User } from "../models/User"
import { IUserProtected } from "../utils/protected"
import { generateToken } from "../utils/generateToken"

// Get All
export const getAllPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

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

    const totalEntries = await Plan.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Plan.find({ deletedAt: null, isActive: true }).sort({ priority: 1 }).lean()
    } else {
        result = await Plan.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
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

    let plan = await Plan.findOne({ name, deletedAt: null }).lean()

    if (plan) {
        return res.status(400).json({ message: "Plan Already Exist" })
    }

    const planRules: validationRulesSchema = {
        name: { required: true },
        title: { required: true },
        priority: { required: true },
        maxProducts: { required: name !== "Free" ? false : true },
        maxPolicies: { required: name !== "Free" ? false : true },
        maxPolicyTypes: { required: name !== "Free" ? false : true },
        maxBrands: { required: name !== "Free" ? false : true },
        maxNotifications: { required: name !== "Free" ? false : true },
        maxFamilyMembers: { required: name === "Family" ? true : false },
        price: {
            object: true,
            monthly: { required: name === "Free" ? false : true },
            yearly: { required: name === "Free" ? false : true },
            required: name === "Free" ? false : true
        },
        includes: { required: true, array: true },
    }

    let data = req.body

    if (name === "Free") {
        data = { ...req.body, price: {} }
    } else if (name === "Family") {
        data = { ...req.body, allowedFamilyMembers: true }
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

    res.status(200).json({ message: "Plan delete successfully" })
})

export const selectPlan = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { selectedPlan = "Free", billingCycle, points } = req.body;

    const { userId } = req.user as IUserProtected
    const user = await User.findById(userId).lean()
    if (!user) {
        return res.status(404).json({ message: "User Not Fund" })
    }

    let userPoints = user.points

    if (points) {
        userPoints = userPoints - +points
    }

    let planType = "Unlimited"

    const today = new Date()
    const startDate = today
    let expiryDate = new Date(today)
    if (selectedPlan !== "Free") {
        if (billingCycle === "monthly") {
            planType = "Monthly"
            expiryDate.setDate(expiryDate.getDate() + 30)
        } else if (billingCycle === "yearly") {
            planType = "Yearly"
            expiryDate.setDate(expiryDate.getDate() + 365)
        }
    }

    await User.findByIdAndUpdate(userId, {
        plan: selectedPlan,
        planType,
        subscription: selectedPlan === "Free" ? { paymentStatus: "Pending" } : { startDate, expiryDate, paymentStatus: "Active" },
        points: userPoints
    }, { new: true });

    const token = generateToken({ userId: user._id, name: user.name, role: user.role })

    const result = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        role: user.role,
        plan: selectedPlan,
        points: userPoints,
        referralCode: user.referralCode,
        referralLink: `${process.env.FRONTEND_URL}/sign-up?ref=${user.referralCode}`,
        token
    }

    res.json({ message: "Plan Update Successfully", result });
});