import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/payment` }),
    tagTypes: ["payment"],
    endpoints: (builder) => {
        return {
            initiatePayment: builder.mutation<{ message: string, orderId: string, amount: number }, { selectedPlan: string, billingCycle: string }>({
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
