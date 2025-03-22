import express from "express"
import * as policyTypeController from "../controllers/policyType.controller"

const policyTypeRouter = express.Router()

policyTypeRouter
    .get("/", policyTypeController.getAllPolicyTypes)
    .get("/:id", policyTypeController.getPolicyTypeById)
    .post("/add", policyTypeController.addPolicyType)
    .put("/update/:id", policyTypeController.updatePolicyType)
    .put("/status/:id", policyTypeController.updatePolicyTypeStatus)
    .put("/delete/:id", policyTypeController.deletePolicy)

export default policyTypeRouter