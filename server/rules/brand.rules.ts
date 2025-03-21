import { validationRulesSchema } from "../utils/validator";

export const addBrandRules: validationRulesSchema = {
    user: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    name: { required: true, min: 2, max: 100 },
    description: { required: false, min: 2, max: 500 },
    logo: { required: false },
}