import express from "express"
import * as brandController from "../controllers/brand.controller"

const brandRouter = express.Router()

brandRouter
    .get("/", brandController.getAllBrands)
    .get("/:id", brandController.getBrandById)
    .post("/add", brandController.addBrand)
    .put("/update/:id", brandController.updateBrand)
    .put("/updateStatus/:id", brandController.updateBrandStatus)
    .put("/delete/:id", brandController.deleteBrand)

export default brandRouter