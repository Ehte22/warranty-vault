import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { INotification } from "../../models/notification.interface"

const baseUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/notification`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const notificationApi = createApi({
    reducerPath: "notificationApi",
    baseQuery: customBaseQuery,
    tagTypes: ["notification"],
    endpoints: (builder) => {
        return {
            getNotification: builder.query<{ result: INotification[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedUser: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: INotification[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["notification"]
            }),

            getNotificationById: builder.query<INotification, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: INotification }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["notification"]
            }),

            addNotification: builder.mutation<{ message: string, result: INotification }, INotification>({
                query: notificationData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: notificationData
                    }
                },
                transformResponse: (data: { message: string, result: INotification }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["notification"]
            }),

            updateNotification: builder.mutation<string, { id: string, notificationData: INotification }>({
                query: ({ id, notificationData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: notificationData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["notification"]
            }),

            updateNotificationStatus: builder.mutation<string, { id: string, status: string }>({
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
                invalidatesTags: ["notification"]
            }),

            deleteNotification: builder.mutation<string, string>({
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
                invalidatesTags: ["notification"]
            }),

        }
    }
})

export const {
    useGetNotificationQuery,
    useGetNotificationByIdQuery,
    useAddNotificationMutation,
    useUpdateNotificationMutation,
    useUpdateNotificationStatusMutation,
    useDeleteNotificationMutation
} = notificationApi
