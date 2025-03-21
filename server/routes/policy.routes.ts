import express from "express"
import * as policyController from "../controllers/policy.controller"
import multerMiddleware from "../utils/upload"

const policyRouter = express.Router()
const upload = multerMiddleware()

policyRouter
    .get("/", policyController.getAllPolicies)
    .get("/:id", policyController.getPolicyById)
    .post("/add", upload.single("document"), policyController.addPolicy)
    .put("/update/:id", upload.single("document"), policyController.updatePolicy)
    .put("/status/:id", policyController.updatePolicyStatus)
    .put("/delete/:id", policyController.deletePolicy)

export default policyRouter