import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IPolicyType } from "../../models/policyType.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/policy-type`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const policyTypeApi = createApi({
    reducerPath: "policyTypeApi",
    baseQuery: customBaseQuery,
    tagTypes: ["policyType"],
    endpoints: (builder) => {
        return {
            getPolicyTypes: builder.query<{ result: IPolicyType[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IPolicyType[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["policyType"]
            }),

            getPolicyTypeById: builder.query<IPolicyType, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IPolicyType }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["policyType"]
            }),

            addPolicyType: builder.mutation<{ message: string, result: IPolicyType }, { name: string, description?: string }>({
                query: policyTypeData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: policyTypeData
                    }
                },
                transformResponse: (data: { message: string, result: IPolicyType }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["policyType"]
            }),

            updatePolicyType: builder.mutation<string, { id: string, policyTypeData: { name: string, description?: string } }>({
                query: ({ id, policyTypeData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: policyTypeData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["policyType"]
            }),

            updatePolicyTypeStatus: builder.mutation<string, { id: string, status: boolean }>({
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
                invalidatesTags: ["policyType"]
            }),

            deletePolicyType: builder.mutation<string, string>({
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
                invalidatesTags: ["policyType"]
            }),

        }
    }
})

export const {
    useGetPolicyTypesQuery,
    useGetPolicyTypeByIdQuery,
    useAddPolicyTypeMutation,
    useUpdatePolicyTypeMutation,
    useUpdatePolicyTypeStatusMutation,
    useDeletePolicyTypeMutation
} = policyTypeApi
