import { ValidationRules, validationRulesSchema } from "../utils/validator";

export const couponRules: validationRulesSchema = {
    code: { required: true, min: 2, max: 100 },
    discountType: { required: true },
    discountValue: { required: true },
    expiryDate: { required: true },
    minPurchase: { required: false },
    usageLimit: { required: false },
    maxDiscount: { required: false },
    usedCount: { required: false },
    usersAllowed: [
        {
            _id: { required: true },
            name: { required: true }
        }
    ],
}   