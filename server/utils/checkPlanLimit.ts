import { NextFunction, Request, Response } from "express";
import { IUserProtected } from "./protected";
import { User } from "../models/User";
import Policy from "../models/Policy";
import Product from "../models/Product";
import Brand from "../models/Brand";
import PolicyType from "../models/PolicyType";
import Plan from "../models/Plan";
import Notification from "../models/Notification";

export const checkPlanLimit = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { userId } = req.user as IUserProtected

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { plan } = user;
    const { type } = req.body;

    const policyCount = await Policy.countDocuments({ "user._id": user._id, deletedAt: null });
    const productCount = await Product.countDocuments({ "user._id": user._id, deletedAt: null });
    const brandCount = await Brand.countDocuments({ "user._id": user._id, deletedAt: null });
    const policyTypeCount = await PolicyType.countDocuments({ "user._id": user._id, deletedAt: null });
    const notificationCount = await Notification.countDocuments({ "user._id": user._id, deletedAt: null });
    const familyCount = user.familyMembers.length;

    const userPlan = await Plan.findOne({ name: plan }).lean()

    if (plan === "Free") {
        if (type === "policy" && policyCount >= Number(userPlan?.maxPolicies)) {
            return res.status(400).json({ message: `Free plan allows only ${userPlan?.maxPolicies} policies` })
        }

        if (type === "product" && productCount >= Number(userPlan?.maxProducts)) {
            return res.status(400).json({ message: `Free plan allows only ${userPlan?.maxProducts} products` })
        }

        if (type === "brand" && brandCount >= Number(userPlan?.maxBrands)) {
            return res.status(400).json({ message: `Free plan allows only ${userPlan?.maxBrands} brands` })
        }

        if (type === "policyType" && policyTypeCount >= Number(userPlan?.maxPolicyTypes)) {
            return res.status(400).json({ message: `Free plan allows only ${userPlan?.maxPolicyTypes} policy types` })
        }

        if (type === "notification" && notificationCount >= Number(userPlan?.maxNotifications)) {
            return res.status(400).json({ message: `Free plan allows only ${userPlan?.maxNotifications} notifications` })
        }
    }

    if (plan === "Free" || plan === "Pro" && type === "user") {
        return res.status(400).json({ message: `${plan} plan does not allow adding users` });
    }

    if (userPlan?.maxFamilyMembers !== "Unlimited") {
        if (plan === "Family" && type === "user" && familyCount >= Number(userPlan?.maxFamilyMembers)) {
            return res.status(400).json({ message: `Family plan allows a maximum of ${userPlan?.maxFamilyMembers} family members` });
        }
    }

    next();
};
