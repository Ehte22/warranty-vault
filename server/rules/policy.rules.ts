import { validationRulesSchema } from "../utils/validator";

export const policyRules: validationRulesSchema = {
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
    name: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    provider: { required: true },
    expiryDate: { required: true },
    document: { required: true },
}