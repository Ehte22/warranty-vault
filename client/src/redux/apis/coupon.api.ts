import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { ICoupon } from "../../models/coupon.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/coupon`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const couponApi = createApi({
    reducerPath: "couponApi",
    baseQuery: customBaseQuery,
    tagTypes: ["coupon"],
    endpoints: (builder) => {
        return {
            getCoupons: builder.query<{ result: ICoupon[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedUser: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: ICoupon[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["coupon"]
            }),

            getCouponById: builder.query<ICoupon, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: ICoupon }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["coupon"]
            }),

            addCoupon: builder.mutation<{ message: string, result: ICoupon }, ICoupon>({
                query: couponData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: couponData
                    }
                },
                transformResponse: (data: { message: string, result: ICoupon }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["coupon"]
            }),

            updateCoupon: builder.mutation<string, { id: string, couponData: ICoupon }>({
                query: ({ id, couponData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: couponData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["coupon"]
            }),

            updateCouponStatus: builder.mutation<string, { id: string, status: boolean }>({
                query: ({ id, status }) => {
                    return {
                        url: `/status/${id}`,
                        method: "PUT",
                        body: { status }
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["coupon"]
            }),

            deleteCoupon: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["coupon"]
            }),

            applyCoupon: builder.mutation<{ message: string, discountAmount: number, finalAmount: number }, { code: string, selectedPlan: string, billingCycle: string }>({
                query: couponData => {
                    return {
                        url: "/apply-coupon",
                        method: "POST",
                        body: couponData
                    }
                },
                transformResponse: (data: { message: string, discountAmount: number, finalAmount: number }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
            }),

        }
    }
})

export const {
    useGetCouponsQuery,
    useGetCouponByIdQuery,
    useAddCouponMutation,
    useUpdateCouponMutation,
    useUpdateCouponStatusMutation,
    useDeleteCouponMutation,
    useApplyCouponMutation
} = couponApi
