import express from "express"
import * as productController from "../controllers/product.controller"
import multerMiddleware from "../utils/upload"

const productRouter = express.Router()
const upload = multerMiddleware()

productRouter
    .get("/", productController.getAllProducts)
    .get("/:id", productController.getProductById)
    .post("/add", upload.single("image"), productController.addProduct)
    .put("/update/:id", upload.single("image"), productController.updateProduct)
    .put("/status/:id", productController.updateProductStatus)
    .put("/delete/:id", productController.deleteProduct)

export default productRouter