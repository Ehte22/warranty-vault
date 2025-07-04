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
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedUser = "" } = req.query

    const { userId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            role !== "Admin" ? { "user._id": userId } : selectedUser ? { "user._id": selectedUser } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { "name.name": { $regex: searchQuery, $options: "i" } },
                        { "product.name": { $regex: searchQuery, $options: "i" } },
                        { provider: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Policy.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Policy.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Policy.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
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
    const { product, name, expiryDate } = req.body

    const { userId, name: userName } = req.user as IUserProtected

    const policy = await Policy.findOne({
        "user._id": userId, "product._id": product._id, "name._id": name._id, expiryDate, deletedAt: null
    })

    if (policy) {
        return res.status(400).json({ message: "Policy Already Exist" })
    }

    let document = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        document = secure_url
    }

    const data = { ...req.body, document, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, policyRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Policy.create(data)

    await Product.findByIdAndUpdate(
        product._id,
        { $push: { policies: { _id: result._id, name: result.name.name } } },
        { new: true }
    )

    res.status(200).json({ message: "Policy Add Successfully", result })
})

// Update
export const updatePolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { remove } = req.body

    const policy = await Policy.findById(id).lean()
    if (!policy) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    let document = policy.document
    if (req.file) {
        const publicId = policy.document?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        document = secure_url
    }

    if (remove === "true") {
        const publicId = policy.document?.split("/").pop()?.split(".")[0]
        if (publicId) {
            await cloudinary.uploader.destroy(publicId)
            document = ""
        }
    }

    const updatedData = { ...req.body, document };

    await Policy.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ message: "Policy Update Successfully" })
})

// Update Status
export const updatePolicyStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const policy = await Policy.findById(id).lean()
    if (!policy) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    await Policy.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Policy Status Update Successfully" })
})

// Delete
export const deletePolicy = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const policy = await Policy.findById(id)

    if (!policy) {
        return res.status(404).json({ message: "Policy Not Found" })
    }

    await Policy.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Policy Delete Successfully" })
})