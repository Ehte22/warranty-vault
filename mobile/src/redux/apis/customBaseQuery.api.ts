import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const createCustomBaseQuery = (baseUrl: string): BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> => {
    const baseQuery = fetchBaseQuery({
        baseUrl,
        credentials: "include",
        async prepareHeaders(headers) {
            const user = await AsyncStorage.getItem("user")
            const token = JSON.parse(user as string)?.token

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    });

    return async (args, api, extraOptions) => {
        const response = await baseQuery(args, api, extraOptions);

        if (response.error?.status === 401) {
            const errorData = response.error.data as { message?: string };
            if (errorData?.message === "Session has expired. Please log in again.") {
                // api.dispatch(logoutUser());
                // api.dispatch(openSessionExpiredModal());
            }
        }

        return response;
    };
};
