import express from "express"
import * as planController from "../controllers/plan.controller"

const planRouter = express.Router()

planRouter
    .get("/", planController.getAllPlans)
    .get("/:id", planController.getPlanById)
    .post("/add", planController.addPlan)
    .put("/update/:id", planController.updatePlan)
    .put("/status/:id", planController.updatePlanStatus)
    .put("/delete/:id", planController.deletePlan)

export default planRouter