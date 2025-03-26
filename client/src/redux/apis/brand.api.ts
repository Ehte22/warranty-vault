import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IBrand } from "../../models/brand.interface"
import { IPagination } from "../../models/pagination.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/brand`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const brandApi = createApi({
    reducerPath: "brandApi",
    baseQuery: customBaseQuery,
    tagTypes: ["brand"],
    endpoints: (builder) => {
        return {
            getBrands: builder.query<{ result: IBrand[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedUser: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IBrand[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["brand"]
            }),

            getBrandById: builder.query<IBrand, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IBrand }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["brand"]
            }),

            addBrand: builder.mutation<{ message: string, result: IBrand }, FormData>({
                query: brandData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: brandData
                    }
                },
                transformResponse: (data: { message: string, result: IBrand }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["brand"]
            }),

            updateBrand: builder.mutation<string, { id: string, brandData: FormData }>({
                query: ({ id, brandData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: brandData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["brand"]
            }),

            updateBrandStatus: builder.mutation<string, { id: string, status: boolean }>({
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
                invalidatesTags: ["brand"]
            }),

            deleteBrand: builder.mutation<string, string>({
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
                invalidatesTags: ["brand"]
            }),

        }
    }
})

export const {
    useGetBrandsQuery,
    useGetBrandByIdQuery,
    useAddBrandMutation,
    useUpdateBrandMutation,
    useUpdateBrandStatusMutation,
    useDeleteBrandMutation
} = brandApi
