import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import cloudinary from "../utils/uploadConfig"
import Policy from "../models/Policy"
import { policyRules } from "../rules/policy.rules"
import Product from "../models/Product"

// Get All
export const getAllPolicies = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                        { type: { $regex: searchQuery, $options: "i" } },
                        { provider: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalBrands = await Policy.countDocuments(query)
    const totalPages = Math.ceil(totalBrands / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Policy.find({ "user._id": userId }).sort({ createdAt: -1 }).lean()
    } else {
        result = await Policy.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries: totalBrands,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Policies Fetch Successfully", result, pagination })
})

// Get By ID
export const getPolicyById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Policy.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    res.status(200).json({ message: "Policy Fetch Successfully", result })
})

// Add
export const addPolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { product } = req.body

    let document = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        document = secure_url
    }

    const { userId, name: userName } = req.user as IUserProtected

    const data = { ...req.body, document, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, policyRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Policy.create(data)

    await Product.findByIdAndUpdate(
        product._id,
        { $push: { policies: result._id } },
        { new: true }
    )

    res.status(200).json({ message: "Policy Add Successfully", result })
})

// Update
export const updatePolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const product = await Policy.findById(id).lean()
    if (!product) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    let document = product.document
    if (req.file) {
        const publicId = product.document?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        document = secure_url
    }

    const updatedData = { ...req.body, document };

    await Policy.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ message: "Policy Update Successfully" })
})

// Update Status
export const updatePolicyStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const product = await Policy.findById(id).lean()
    if (!product) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    await Policy.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Policy Status Update Successfully" })
})

// Delete
export const deletePolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const product = await Policy.findById(id)

    if (!product) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    await Policy.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "User delete successfully" })
})