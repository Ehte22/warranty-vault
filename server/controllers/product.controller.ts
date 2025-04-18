import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import cloudinary from "../utils/uploadConfig"
import { productRules } from "../rules/product.rules"
import Product from "../models/Product"

// Get All
export const getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                        { name: { $regex: searchQuery, $options: "i" } },
                        { "brand.name": { $regex: searchQuery, $options: "i" } },
                        { model: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Product.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Product.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Product.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Products Fetch Successfully", result, pagination })
})

// Get By ID
export const getProductById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Product.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Product Not Found" })
    }

    res.status(200).json({ message: "Product Fetch Successfully", result })
})

// Add
export const addProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { model } = req.body

    let image = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        image = secure_url
    }

    const { userId, name: userName } = req.user as IUserProtected

    const product = await Product.findOne({ "user._id": userId, model, deletedAt: null }).lean()
    if (product) {
        return res.status(400).json({ message: "Product Already Exist" })
    }

    const data = { ...req.body, image, user: { _id: userId, name: userName } }

    const { isError, error } = customValidator(data, productRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Product.create(data)

    res.status(200).json({ message: "Product Add Successfully", result })
})

// Update
export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { remove } = req.body
    console.log(req.body);
    console.log(req.file);

    const product = await Product.findById(id).lean()
    if (!product) {
        return res.status(404).json({ message: "Product Not Found" })
    }

    let image = product.image
    if (req.file) {
        const publicId = product.image?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        image = secure_url
    }

    if (remove === "true") {
        const publicId = product.image?.split("/").pop()?.split(".")[0]
        if (publicId) {
            await cloudinary.uploader.destroy(publicId)
            image = ""
        }
    }

    const updatedData = { ...req.body, image };

    await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ message: "Product Update Successfully" })
})

// Update Status
export const updateProductStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const product = await Product.findById(id).lean()
    if (!product) {
        return res.status(404).json({ message: "Product Not Found" })
    }

    await Product.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Product Status Update Successfully" })
})

// Delete
export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const product = await Product.findById(id)

    if (!product) {
        return res.status(404).json({ message: "Product Not Found" })
    }

    await Product.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Product Delete Successfully" })
})