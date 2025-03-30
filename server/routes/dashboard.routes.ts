import express from "express"
import * as dashboardController from "../controllers/dashboard.controller"
import { restrict } from "../utils/protected"
const dashboardRouter = express.Router()

dashboardRouter
    .get("/user", dashboardController.userDashboard)
    .get("/admin", restrict(["Admin"]), dashboardController.adminDashboard)

export default dashboardRouter
