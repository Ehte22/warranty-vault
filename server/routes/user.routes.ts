import express from "express"
import * as userController from "../controllers/user.controller"
import multerMiddleware from "../utils/upload"
import { checkPlanLimit } from "../utils/checkPlanLimit"

const userRouter = express.Router()
const upload = multerMiddleware()

userRouter
    .get("/", userController.getAllUsers)
    .get("/:id", userController.getUserById)
    .post("/add", upload.single("profile"), checkPlanLimit, userController.addUser)
    .put("/update/:id", upload.single("profile"), userController.updateUser)
    .put("/status/:id", userController.updateUserStatus)
    .put("/delete/:id", userController.deleteUser)

export default userRouter