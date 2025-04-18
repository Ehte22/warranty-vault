import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import Product from "../models/Product"
import Policy from "../models/Policy"
import Notification from "../models/Notification"
import { IUserProtected } from "../utils/protected"
import { User } from "../models/User"
import Brand from "../models/Brand"
import mongoose from "mongoose"

export const userDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = req.user as IUserProtected
    const { selectedUser } = req.query

    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)

    const user = role === "Admin"
        ? selectedUser && new mongoose.Types.ObjectId(selectedUser as string)
        : new mongoose.Types.ObjectId(userId)

    const subscriptionDetails = await User.findById(user)
        .select("plan subscription.expiryDate subscription.paymentStatus")

    const productCount = await Product.countDocuments({ "user._id": user, deletedAt: null })

    const policyCount = await Policy.countDocuments({ "user._id": user, deletedAt: null })

    const expiringPolicies = await Policy.aggregate([
        {
            $match: {
                deletedAt: null,
                expiryDate: {
                    $gte: startOfYear,
                    $lte: endOfYear
                },
                $expr: { $eq: ["$user._id", user] },
            }
        },
        {
            $group: {
                _id: { $month: "$expiryDate" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);


    const referralStats = await User.aggregate([
        {
            $match: {
                referredBy: user,
                deletedAt: null
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const notificationStats = await Notification.aggregate([
        { $match: { $expr: { $eq: ["$user._id", user] }, deletedAt: null, } },
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
    const totalUsers = await User.countDocuments({ deletedAt: null, role: { $ne: "Admin" } })
    const totalProducts = await Product.countDocuments({ deletedAt: null })
    const totalPolicies = await Policy.countDocuments({ deletedAt: null })
    const totalBrands = await Brand.countDocuments({ deletedAt: null })

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)

    const defaultIncomeStats = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        year: currentYear,
        totalIncome: 0,
        count: 0
    }));

    const incomeStats = await User.aggregate([
        {
            $match: {
                deletedAt: null,
                plan: { $in: ["Pro", "Family"] },
                "subscription.paymentStatus": "Active",
            }
        },
        {
            $lookup: {
                from: "plans",
                localField: "plan",
                foreignField: "name",
                as: "planDetails",
            }
        },
        { $unwind: "$planDetails" },
        {
            $group: {
                _id: {
                    month: { $month: "$subscription.startDate" },
                    year: { $year: "$subscription.startDate" }
                },
                totalIncome: {
                    $sum: {
                        $cond: [
                            { $eq: ["$planType", "Monthly"] },
                            { $toDouble: "$planDetails.price.monthly" },
                            { $toDouble: "$planDetails.price.yearly" }
                        ]
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                totalIncome: 1,
                count: 1
            }
        }
    ]);

    const mergedIncomeStats = [...incomeStats, ...defaultIncomeStats]
        .filter((value, index, self) =>
            index === self.findIndex((v) => v.month === value.month && v.year === value.year)
        )
        .sort((a, b) => a.year - b.year || a.month - b.month);

    const statusStats = await User.aggregate([
        { $match: { deletedAt: null, role: { $ne: "Admin" } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ])

    const referralStats = await User.aggregate([
        { $match: { deletedAt: null, referredBy: { $ne: null } } },
        { $group: { _id: "$referredBy", count: { $sum: 1 } } },
        {
            $lookup: {
                from: "users",  // Collection name for users
                localField: "_id",
                foreignField: "_id",
                as: "referrer"
            }
        },
        { $unwind: "$referrer" }, // Convert array to object
        { $sort: { count: -1 } },
        {
            $project: {
                _id: 0, // Hide MongoDB _id field
                referrerId: "$referrer._id",
                referrerName: "$referrer.name",
                count: 1
            }
        }
    ]);

    const expiryTrend = await User.aggregate([
        {
            $match: {
                "subscription.expiryDate": { $gte: startOfYear, $lte: endOfYear }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$subscription.expiryDate" },
                    year: { $year: "$subscription.expiryDate" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                count: 1
            }
        }
    ]);



    const result = {
        totalUsers,
        totalProducts,
        totalPolicies,
        totalBrands,
        incomeStats: mergedIncomeStats,
        statusStats,
        referralStats,
        expiryTrend,
    }


    res.status(200).json({ message: "Admin Dashboard Fetch Successfully", result })
})


