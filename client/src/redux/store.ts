import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth.api";
import authSlice from "./slices/auth.slice"

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        auth: authSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
        )
})

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

export default reduxStore

