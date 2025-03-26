import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import Brand, { IBrand } from "../models/Brand"
import { customValidator } from "../utils/validator"
import { addBrandRules } from "../rules/brand.rules"
import cloudinary from "../utils/uploadConfig"

// Get All
export const getAllBrands = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                        { name: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Brand.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Brand.find({ "user._id": userId, deletedAt: null }).sort({ createdAt: -1 }).lean()
    } else {
        result = await Brand.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Brands Fetch Successfully", result, pagination })
})

// Get By ID
export const getBrandById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Brand.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Brand Not Found" })
    }

    res.status(200).json({ message: "Brand Fetch Successfully", result })
})

// Add
export const addBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name } = req.body

    let logo = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        logo = secure_url
    }

    const { userId, name: userName } = req.user as IUserProtected

    const data = { ...req.body, logo, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, addBrandRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const brand = await Brand.findOne({ "user._id": userId, name, deletedAt: null }).lean()
    if (brand) {
        return res.status(400).json({ message: "Brand Already Exist" })
    }

    const result = await Brand.create(data)

    res.status(200).json({ message: "Brand Add Successfully", result })
})

// Update
export const updateBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const brand = await Brand.findById(id).lean()
    if (!brand) {
        return res.status(404).json({ message: "Brand Not Found" })
    }

    let logo = brand.logo
    if (req.file) {
        const publicId = brand.logo?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        logo = secure_url
    }

    const updatedData = { ...req.body, logo };
    const isSame = Object.keys(updatedData).every(key =>
        updatedData[key as keyof IBrand] == brand[key as keyof IBrand]
    );


    if (isSame) {
        return res.status(200).json({ message: "No Changes Detected" });
    }

    await Brand.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ message: "Brand Update Successfully" })
})

// Update Status
export const updateBrandStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const brand = await Brand.findById(id).lean()
    if (!brand) {
        return res.status(404).json({ message: "Brand Not Found" })
    }

    await Brand.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Brand Status Update Successfully" })
})

// Delete
export const deleteBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const brand = await Brand.findById(id)

    if (!brand) {
        return res.status(404).json({ message: "Brand Not Found" })
    }

    await Brand.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Brand delete successfully" })
})