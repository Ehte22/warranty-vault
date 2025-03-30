import express from "express"
import * as couponController from "../controllers/coupon.controller"
import { restrict } from "../utils/protected"
const couponRouter = express.Router()

couponRouter
    .get("/", restrict(["Admin"]), couponController.getCoupons)
    .get("/:id", restrict(["Admin"]), couponController.getCouponById)
    .post("/add", restrict(["Admin"]), couponController.addCoupon)
    .put("/update/:id", restrict(["Admin"]), couponController.updateCoupon)
    .put("/status/:id", restrict(["Admin"]), couponController.updateCouponStatus)
    .put("/delete/:id", restrict(["Admin"]), couponController.deleteCoupon)
    .post("/apply-coupon", couponController.applyCoupon)

export default couponRouter
