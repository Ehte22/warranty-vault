import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IPlan } from "../../models/plan.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/plan`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const planApi = createApi({
    reducerPath: "planApi",
    baseQuery: customBaseQuery,
    tagTypes: ["plan"],
    endpoints: (builder) => {
        return {
            getPlans: builder.query<{ result: IPlan[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IPlan[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["plan"]
            }),

            getPlanById: builder.query<IPlan, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IPlan }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["plan"]
            }),

            addPlan: builder.mutation<{ message: string, result: IPlan }, IPlan>({
                query: planData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: planData
                    }
                },
                transformResponse: (data: { message: string, result: IPlan }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["plan"]
            }),

            updatePlan: builder.mutation<string, { id: string, planData: IPlan }>({
                query: ({ id, planData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: planData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["plan"]
            }),

            updatePlanStatus: builder.mutation<string, { id: string, status: boolean }>({
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
                invalidatesTags: ["plan"]
            }),

            deletePlan: builder.mutation<string, string>({
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
                invalidatesTags: ["plan"]
            }),

            selectPlan: builder.mutation<string, { selectedPlan: string, billingCycle?: string }>({
                query: (planData) => {
                    return {
                        url: `/select-plan`,
                        method: "PUT",
                        body: planData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["plan"]
            }),

        }
    }
})

export const {
    useGetPlansQuery,
    useGetPlanByIdQuery,
    useAddPlanMutation,
    useUpdatePlanMutation,
    useUpdatePlanStatusMutation,
    useDeletePlanMutation,
    useSelectPlanMutation
} = planApi
