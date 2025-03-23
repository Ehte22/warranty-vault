import { validationRulesSchema } from "../utils/validator";

export const notificationRules: validationRulesSchema = {
    user: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    product: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    policy: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    message: { required: true },
    scheduleDate: { required: true },
}