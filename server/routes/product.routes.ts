import express from "express"
import * as productController from "../controllers/product.controller"
import multerMiddleware from "../utils/upload"
import { checkPlanLimit } from "../utils/checkPlanLimit"

const productRouter = express.Router()
const upload = multerMiddleware()

productRouter
    .get("/", productController.getAllProducts)
    .get("/:id", productController.getProductById)
    .post("/add", upload.single("image"), checkPlanLimit, productController.addProduct)
    .put("/update/:id", upload.single("image"), productController.updateProduct)
    .put("/status/:id", productController.updateProductStatus)
    .put("/delete/:id", productController.deleteProduct)

export default productRouter