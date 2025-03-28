import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/payment`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: customBaseQuery,
    tagTypes: ["payment"],
    endpoints: (builder) => {
        return {
            initiatePayment: builder.mutation<{ message: string, orderId: string, amount: number }, { selectedPlan: string, billingCycle: string, code: string }>({
                query: plan => {
                    return {
                        url: "/initiate-payment",
                        method: "POST",
                        body: plan
                    }
                },
            }),

            verifyPayment: builder.mutation<{ success: boolean, message: string }, any>({
                query: (paymentData) => {
                    return {
                        url: "/verify-payment",
                        method: "POST",
                        body: paymentData
                    }
                },
            })

        }
    }
})

export const {
    useInitiatePaymentMutation,
    useVerifyPaymentMutation
} = paymentApi
