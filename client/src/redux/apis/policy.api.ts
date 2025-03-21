import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IPolicy } from "../../models/policy.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/policy`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const policyApi = createApi({
    reducerPath: "policyApi",
    baseQuery: customBaseQuery,
    tagTypes: ["policy"],
    endpoints: (builder) => {
        return {
            getPolicies: builder.query<{ result: IPolicy[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IPolicy[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["policy"]
            }),

            getPolicyById: builder.query<IPolicy, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IPolicy }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["policy"]
            }),

            addPolicy: builder.mutation<{ message: string, result: IPolicy }, FormData>({
                query: policyData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: policyData
                    }
                },
                transformResponse: (data: { message: string, result: IPolicy }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["policy"]
            }),

            updatePolicy: builder.mutation<string, { id: string, policyData: FormData }>({
                query: ({ id, policyData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: policyData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["policy"]
            }),

            updatePolicyStatus: builder.mutation<string, { id: string, status: string }>({
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
                invalidatesTags: ["policy"]
            }),

            deletePolicy: builder.mutation<string, string>({
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
                invalidatesTags: ["policy"]
            }),

        }
    }
})

export const {
    useGetPoliciesQuery,
    useGetPolicyByIdQuery,
    useAddPolicyMutation,
    useUpdatePolicyMutation,
    useUpdatePolicyStatusMutation,
    useDeletePolicyMutation
} = policyApi
