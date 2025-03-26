import { validationRulesSchema } from "../utils/validator";

export const couponRules: validationRulesSchema = {
    code: { required: true, min: 2, max: 100 },
    discountType: { required: true },
    discountValue: { required: true },
    expiryDate: { required: true },
    usageLimit: { required: true },
    minPurchase: { required: false },
    maxDiscount: { required: false },
    usersAllowed: { required: false },
    usedCount: { required: false },
}