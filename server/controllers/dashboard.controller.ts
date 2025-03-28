import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import Product from "../models/Product"
import Policy from "../models/Policy"
import Notification from "../models/Notification"
import { IUserProtected } from "../utils/protected"
import { User } from "../models/User"
import Brand from "../models/Brand"

export const userDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user as IUserProtected

    const subscriptionDetails = await User.findById(userId)
        .select("plan subscription.expiryDate subscription.paymentStatus")

    const productCount = await Product.countDocuments({ "user_id": userId, deletedAt: null })
    const policyCount = await Policy.countDocuments({ "user_id": userId, deletedAt: null })

    const expiringPolicies = await Policy.aggregate([
        {
            $match: {
                user: userId,
                deletedAt: null,
                expiryDate: {
                    $gte: new Date(),
                    $lte: new Date(new Date().setDate(new Date().getDate() + 30))
                }
            }
        },
        { $project: { name: 1, expiryDate: 1 } }
    ])

    const referralStats = await User.aggregate([
        { $match: { referredBy: userId, deletedAt: null } },
        { $group: { _id: "$referredBy", count: { $sum: 1 } } }
    ])

    const notificationStats = await Notification.aggregate([
        { $match: { user: userId, deletedAt: null, } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const result = {
        subscriptionDetails,
        productCount,
        policyCount,
        expiringPolicies,
        referralStats,
        notificationStats
    }

    res.status(200).json({ message: "User Dashboard Fetch Successfully", result })
})

export const adminDashboard = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const totalUsers = await User.countDocuments({ deletedAt: null })
    const totalProducts = await Product.countDocuments({ deletedAt: null })
    const totalPolicies = await Policy.countDocuments({ deletedAt: null })
    const totalBrands = await Brand.countDocuments({ deletedAt: null })

    const subscriptionStats = await User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: "$plan", count: { $sum: 1 } } }
    ])

    const statusStats = await User.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const referralStats = await User.aggregate([
        { $match: { deletedAt: null, referredBy: { $ne: null } } },
        { $group: { _id: "$referredBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    const expiryTrend = await Policy.aggregate([
        { $match: { deletedAt: null, expiryDate: { $gte: new Date() } } },
        { $group: { _id: { $month: "$expiryDate" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ])

    const result = {
        totalUsers,
        totalProducts,
        totalPolicies,
        totalBrands,
        subscriptionStats,
        statusStats,
        referralStats,
        expiryTrend
    }

    res.status(200).json({ message: "Admin Dashboard Fetch Successfully", result })

})


