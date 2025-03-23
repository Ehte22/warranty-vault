import express from "express"
import * as notificationController from "../controllers/notification.controller"

const notificationRouter = express.Router()

notificationRouter
    .get("/", notificationController.getAllNotifications)
    .get("/:id", notificationController.getNotificationById)
    .post("/add", notificationController.addNotification)
    .put("/update/:id", notificationController.updateNotification)
    .put("/status/:id", notificationController.updateNotificationStatus)
    .put("/delete/:id", notificationController.deleteNotification)

export default notificationRouter