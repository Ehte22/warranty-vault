import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import cloudinary from "../utils/uploadConfig"
import { IUser, User } from "../models/User"
import { registerRules } from "../rules/user.rules"
import bcryptjs from "bcryptjs"

// Get All
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

    const { userId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } },
                        { email: { $regex: searchQuery, $options: "i" } },
                        { phone: { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await User.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    const owner = await User.findById(userId).lean()

    let result: any[] = []
    if (isFetchAll) {
        if (owner && owner.plan === "Family") {
            result = await User.find({ _id: { $in: owner.familyMembers } }).sort({ createdAt: -1 }).lean()
        } else if (role === "Admin") {
            result = await User.find({ "user._id": userId, deletedAt: null }).sort({ createdAt: -1 }).lean()
        }
    } else {
        if (owner && owner.plan === "Family") {
            result = await User.find({ _id: { $in: owner.familyMembers } }).sort({ createdAt: -1 }).lean()
        } else if (role === "Admin") {
            result = await User.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
        }
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Users Fetch Successfully", result, pagination })
})

// Get By ID
export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await User.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "User Not Found" })
    }

    res.status(200).json({ message: "User Fetch Successfully", result })
})

// Add
export const addUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, phone, password }: IUser = req.body

    const user = await User.findOne({ $or: [{ email }, { phone }] }).lean()

    const { userId } = req.user as IUserProtected

    const owner = await User.findById(userId).lean()

    if (user) {
        if (user.email == email) {
            return res.status(409).json({ message: "Email already exist" })
        }
        if (user.phone == phone) {
            return res.status(409).json({ message: "Phone number already exist" })
        }
    }

    let profile = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    const data = {
        ...req.body, profile,
        role: "User",
        subscription: owner?.subscription,
        plan: owner?.plan === "Family Yearly" ? "Pro Yearly" : "Pro Monthly"
    }
    const { isError, error } = customValidator(data, registerRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const hashPassword = await bcryptjs.hash(password, 10)

    const newUser = await User.create({ ...data, password: hashPassword })

    await User.findByIdAndUpdate(userId, { $push: { familyMembers: newUser._id } })

    const result = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profile: newUser.profile,
        role: newUser.role,
        plan: newUser.plan,
    }

    res.status(200).json({ message: "User Add Successfully", result })
})

// Update
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const user = await User.findById(id).lean()
    if (!user) {
        return res.status(404).json({ message: "User Not Found" })
    }

    let profile = user.profile
    if (req.file) {
        const publicId = user.profile?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    const updatedData = { ...req.body, profile };

    await User.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    res.status(200).json({ message: "User Update Successfully" })
})

// Update Status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const user = await User.findById(id).lean()
    if (!user) {
        return res.status(404).json({ message: "User Not Found" })
    }

    await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
    res.status(200).json({ message: "User Status Update Successfully" })
})

// Delete
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: "User Not Found" })
    }

    await User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "User delete successfully" })
})