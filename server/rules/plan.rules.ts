import { validationRulesSchema } from "../utils/validator";

export const planRules: validationRulesSchema = {
    name: { required: true },
    maxProducts: { required: true },
    maxPolicies: { required: true },
    maxPolicyTypes: { required: true },
    maxBrands: { required: true },
    billingCycle: { required: true },
    price: { required: false },
}