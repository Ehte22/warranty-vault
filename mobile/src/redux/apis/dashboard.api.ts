import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IAdminDashboardData, IUserDashboardData } from "../../models/dashboard.interface"

const baseUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/dashboard`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: customBaseQuery,
    tagTypes: ["dashboard"],
    endpoints: (builder) => {
        return {
            getUserDashboard: builder.query<IUserDashboardData, Partial<{ selectedUser: string }>>({
                query: (selectedUser = {}) => {
                    return {
                        url: "/user",
                        method: "GET",
                        params: selectedUser
                    }
                },
                transformResponse: (data: { result: IUserDashboardData }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
            }),

            getAdminDashboard: builder.query<IAdminDashboardData, void>({
                query: () => {
                    return {
                        url: "/admin",
                        method: "GET",
                    }
                },
                transformResponse: (data: { result: IAdminDashboardData }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
            }),

        }
    }
})

export const {
    useGetUserDashboardQuery,
    useGetAdminDashboardQuery
} = dashboardApi
