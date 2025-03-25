import express from "express"
import * as brandController from "../controllers/brand.controller"
import multerMiddleware from "../utils/upload"
import { checkPlanLimit } from "../utils/checkPlanLimit"

const brandRouter = express.Router()
const upload = multerMiddleware()

brandRouter
    .get("/", brandController.getAllBrands)
    .get("/:id", brandController.getBrandById)
    .post("/add", upload.single("logo"), checkPlanLimit, brandController.addBrand)
    .put("/update/:id", upload.single("logo"), brandController.updateBrand)
    .put("/status/:id", brandController.updateBrandStatus)
    .put("/delete/:id", brandController.deleteBrand)

export default brandRouter