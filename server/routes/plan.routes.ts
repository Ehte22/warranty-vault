import express from "express"
import * as planController from "../controllers/plan.controller"
import { restrict } from "../utils/protected"

const planRouter = express.Router()

planRouter
    .get("/", planController.getAllPlans)
    .get("/:id", planController.getPlanById)
    .post("/add", restrict(["Admin"]), planController.addPlan)
    .put("/update/:id", restrict(["Admin"]), planController.updatePlan)
    .put("/status/:id", restrict(["Admin"]), planController.updatePlanStatus)
    .put("/delete/:id", restrict(["Admin"]), planController.deletePlan)
    .put("/select-plan", planController.selectPlan)

export default planRouter