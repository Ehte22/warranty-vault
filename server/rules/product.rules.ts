import { validationRulesSchema } from "../utils/validator";

export const productRules: validationRulesSchema = {
    user: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    brand: {
        object: true,
        _id: { required: true },
        name: { required: true }
    },
    name: { required: true, min: 2, max: 100 },
    model: { required: true },
    purchaseDate: { required: true },
    image: { required: false },
}