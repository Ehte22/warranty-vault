import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import razorpay from "razorpay"
import { v4 as uuid } from "uuid"
import crypto from "crypto"
import dotenv from "dotenv"
import Plan from "../models/Plan"

dotenv.config()

export const initiatePayment = asyncHandler(async (req: Request, res): Promise<any> => {
    const { selectedPlan, billingCycle } = req.body
    const instance = new razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    })

    const plan = await Plan.findOne({ name: selectedPlan }).lean()
    if (!plan) {
        return res.status(404).json({ message: "Plan Not Found" })
    }

    let amount
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

    if (amount) {
        instance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: uuid()
        }, (err: any, order) => {
            if (err) {
                return res.status(500).json({ message: err.message || "Unable to process request" })
            }
            return res.status(200).json({ message: "initiate success", orderId: order.id, amount })
        })
    }
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
        return res.json({ success: true, message: "Payment successful" });
    } else {
        return res.status(400).json({ message: "Payment verification failed" });
    }
});
