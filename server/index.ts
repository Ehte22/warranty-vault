import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cron from "node-cron";
import rateLimit from "express-rate-limit";
import { app, server } from "./utils/socket";
import redisClient from "./services/redisClient";
import passport from "./services/passport"
import authRouter from "./routes/auth.routes";
import brandRouter from "./routes/brand.routes";
import { protectedRoute } from "./utils/protected";
import productRouter from "./routes/product.routes";
import policyRouter from "./routes/policy.routes";
import policyTypeRouter from "./routes/policyType.routes";
import planRouter from "./routes/plan.routes";
import notificationRouter from "./routes/notification.routes";
import paymentRouter from "./routes/payment.routes";
import userRouter from "./routes/user.routes";
import couponRouter from "./routes/coupon.routes";
import dashboardRouter from "./routes/dashboard.routes";
import { checkAndDeactivateExpiredSubscriptionUser, sendNotifications, sendSubscriptionReminders } from "./utils/checkSubscription";

dotenv.config()
app.use(express.json())
app.use(express.static("invoices"))
app.use(morgan("dev"))

// app.use(rateLimit({
//     windowMs: 1000 * 60 * 15,
//     max: 50,
//     message: "We have received to many request from this IP. Please try after 15 minutes."
// }))

app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: true,
    credentials: true
}))

app.use(passport.initialize())

redisClient.on("connect", () => {
    console.log('Connected to Redis');
})

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", protectedRoute, userRouter)
app.use("/api/v1/brand", protectedRoute, brandRouter)
app.use("/api/v1/product", protectedRoute, productRouter)
app.use("/api/v1/policy", protectedRoute, policyRouter)
app.use("/api/v1/policy-type", protectedRoute, policyTypeRouter)
app.use("/api/v1/plan", protectedRoute, planRouter)
app.use("/api/v1/notification", protectedRoute, notificationRouter)
app.use("/api/v1/coupon", protectedRoute, couponRouter)
app.use("/api/v1/payment", protectedRoute, paymentRouter)
app.use("/api/v1/dashboard", protectedRoute, dashboardRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "Resource not found", });
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: "Something went wrong", error: err.message });
})

mongoose.connect(process.env.MONGO_URL || "").catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});

cron.schedule("0 0 * * *", async () => {
    await sendSubscriptionReminders()
    await checkAndDeactivateExpiredSubscriptionUser();
    await sendNotifications()
});

// Start the Server
const PORT = process.env.PORT || 5000
mongoose.connection.once("open", async () => {
    console.log("MongoDb Connected")
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    });
});

