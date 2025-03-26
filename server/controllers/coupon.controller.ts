import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import Coupon from "../models/Cupon"
import { couponRules } from "../rules/coupon.rules"

// Get All
export const getCoupons = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

    const { userId } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            { role: "Admin" },
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { code: { $regex: searchQuery, $options: "i" } },
                        { discountValue: { $regex: searchQuery, $options: "i" } },
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Coupon.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Coupon.find({ deletedAt: null }).sort({ createdAt: -1 }).lean()
    } else {
        result = await Coupon.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Coupons Fetch Successfully", result, pagination })
})

// Get By ID
export const getCouponById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Coupon.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Coupon Not Found" })
    }

    res.status(200).json({ message: "Coupon Fetch Successfully", result })
})

// Add
export const addCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { code, discountValue } = req.body

    const coupon = await Coupon.findOne({ code, discountValue, deletedAt: null }).lean()
    if (coupon) {
        return res.status(400).json({ message: "Coupon Already Exist" })
    }

    const { isError, error } = customValidator(req.body, couponRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Coupon.create(req.body)

    res.status(200).json({ message: "Coupon Create Successfully", result })
})

// Update
export const updateCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const coupon = await Coupon.findById(id).lean()
    if (!coupon) {
        return res.status(404).json({ message: "Coupon Not Found" })
    }

    await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Coupon Update Successfully" })
})

// Update Status
export const updateCouponStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const coupon = await Coupon.findById(id).lean()
    if (!coupon) {
        return res.status(404).json({ message: "Coupon Not Found" })
    }

    await Coupon.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Coupon Status Update Successfully" })
})

// Delete
export const deleteCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const coupon = await Coupon.findById(id)

    if (!coupon) {
        return res.status(404).json({ message: "Coupon Not Found" })
    }

    await Coupon.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Coupon delete successfully" })
})