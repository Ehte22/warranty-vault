import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IProduct } from "../../models/product.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/product`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const productApi = createApi({
    reducerPath: "productApi",
    baseQuery: customBaseQuery,
    tagTypes: ["product"],
    endpoints: (builder) => {
        return {
            getProducts: builder.query<{ result: IProduct[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedUser: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IProduct[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["product"]
            }),

            getProductById: builder.query<IProduct, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IProduct }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["product"]
            }),

            addProduct: builder.mutation<{ message: string, result: IProduct }, FormData>({
                query: productData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: productData
                    }
                },
                transformResponse: (data: { message: string, result: IProduct }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["product"]
            }),

            updateProduct: builder.mutation<string, { id: string, productData: FormData }>({
                query: ({ id, productData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: productData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["product"]
            }),

            updateProductStatus: builder.mutation<string, { id: string, status: boolean }>({
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
                invalidatesTags: ["product"]
            }),

            deleteProduct: builder.mutation<string, string>({
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
                invalidatesTags: ["product"]
            }),

        }
    }
})

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useAddProductMutation,
    useUpdateProductMutation,
    useUpdateProductStatusMutation,
    useDeleteProductMutation
} = productApi
