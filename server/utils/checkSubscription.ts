import { User } from "../models/User";
import { sendEmail } from "./email";
import { subscriptionReminderTemplate } from "../templates/subscriptionReminderTemplate";
import moment from "moment-timezone";
import Notification from "../models/Notification";
import { notificationEmailTemplate } from "../templates/notificationEmailTemplate";

const INDIA_TIMEZONE = "Asia/Kolkata";

export const checkAndDeactivateExpiredSubscriptionUser = async () => {
    const todayIST = moment().tz(INDIA_TIMEZONE).startOf("day").toDate();

    await User.updateMany(
        { "subscription.expiryDate": { $lt: todayIST }, plan: { $ne: "Free" } },
        { $set: { plan: "Free", planType: "Unlimited" } },
    );

};

export const sendSubscriptionReminders = async () => {
    const todayIST = moment().tz(INDIA_TIMEZONE).startOf("day"); // Get start of the day in IST
    const daysBeforeExpiry = [30, 15, 5];

    for (const days of daysBeforeExpiry) {
        const reminderDate = todayIST.clone().add(days, "days"); // Future date for reminders
        const startOfDay = reminderDate.startOf("day").toDate();
        const endOfDay = reminderDate.endOf("day").toDate();

        // Fetch users who are expiring on that date & are "User Admin"
        const expiringUsers = await User.find({
            "subscription.expiryDate": { $gte: startOfDay, $lte: endOfDay },
            plan: { $ne: "Free" },
            role: "User"
        });

        if (expiringUsers.length > 0) {
            const emailPromises = expiringUsers.map(user =>
                sendEmail({
                    to: user.email,
                    subject: `Plan Expiry Reminder: ${days} days left`,
                    text: subscriptionReminderTemplate({ name: user.name, days })
                })
            );

            await Promise.all(emailPromises); // Send all emails concurrently
        }
    }
};

export const sendNotifications = async () => {
    const todayIST = moment().tz(INDIA_TIMEZONE).startOf("day").toDate();
    const endOfDayIST = moment(todayIST).endOf("day").toDate();

    const notifications = await Notification.find({
        scheduleDate: { $gte: todayIST, $lt: endOfDayIST },
        status: "Pending",
    }).populate("policy._id")

    if (notifications.length === 0) {
        return;
    }

    const userIds = notifications.map(n => n.user._id);
    const users = await User.find({ _id: { $in: userIds } }, "email name"); // Fetch only needed fields

    const userMap = new Map(users.map(user => [user._id.toString(), user]));

    for (const notification of notifications) {
        const user = userMap.get(notification.user._id.toString());

        if (!user) {
            continue;
        }

        await sendEmail({
            to: user.email,
            subject: `Policy Expiry Reminder`,
            text: notificationEmailTemplate({
                name: notification.user.name,
                product: notification.product.name,
                policy: notification.policy.name,
                expiryDate: moment(notification.policy._id.expiryDate).format("DD MMM YYYY"),
                message: notification.message,
            }),
        });

        await Notification.updateOne(
            { _id: notification._id },
            { $set: { status: "Sent", sentAt: new Date() } }
        );
    }
};
