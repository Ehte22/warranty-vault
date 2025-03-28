import express from "express"
import * as couponController from "../controllers/coupon.controller"
const couponRouter = express.Router()

couponRouter
    .get("/", couponController.getCoupons)
    .get("/:id", couponController.getCouponById)
    .post("/add", couponController.addCoupon)
    .put("/update/:id", couponController.updateCoupon)
    .put("/status/:id", couponController.updateCouponStatus)
    .put("/delete/:id", couponController.deleteCoupon)
    .post("/apply-coupon", couponController.applyCoupon)

export default couponRouter
