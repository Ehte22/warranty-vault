import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import razorpay from "razorpay"
import { v4 as uuid } from "uuid"
import crypto from "crypto"
import dotenv from "dotenv"
import Plan from "../models/Plan"
import Coupon from "../models/Cupon"

dotenv.config()

export const initiatePayment = asyncHandler(async (req: Request, res): Promise<any> => {
    const { selectedPlan, billingCycle, code, points } = req.body
    const instance = new razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    })

    const coupon = await Coupon.findOne({ code }).lean()
    if (code && !coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
    }

    const plan = await Plan.findOne({ name: selectedPlan }).lean()
    if (!plan) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    let amount = 0
    if (selectedPlan === "Pro") {
        if (billingCycle === "monthly") {
            amount = +plan.price.monthly
        } else if (billingCycle === "yearly") {
            amount = +plan.price.yearly
        }
    } else if (selectedPlan === "Family") {
        if (billingCycle === "monthly") {
            amount = +plan.price.monthly
        } else if (billingCycle === "yearly") {
            amount = +plan.price.yearly
        }
    }

    let discount = 0
    if (coupon && amount) {
        if (coupon.discountType === "Percentage") {
            discount = (amount * +coupon.discountValue) / 100
            if (coupon.maxDiscount) {
                discount = Math.min(discount, +coupon.maxDiscount)
            }
        } else {
            discount = +coupon.discountValue
        }
        amount = amount - discount
    }

    if (points && amount) {
        amount = amount - points
    }

    if (amount < 1) {
        amount = 1;
    }

    if (amount) {
        instance.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: uuid()
        }, (err: any, order) => {
            if (err) {
                return res.status(500).json({ message: err.message || "Unable to process request" })
            }
            return res.status(200).json({ message: "Initiate success", orderId: order.id, amount })
        })
    }
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    // Use timingSafeEqual for secure comparison
    // const expected = Buffer.from(generatedSignature, "utf-8");
    // const received = Buffer.from(razorpay_signature, "utf-8");

    // const isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (generatedSignature === razorpay_signature) {
        return res.json({ success: true, message: "Payment successful" });
    } else {
        return res.status(400).json({ message: "Payment verification failed" });
    }
});
