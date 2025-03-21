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
    type: { required: true },
    provider: { required: true },
    expiryDate: { required: true },
    document: { required: false },
}