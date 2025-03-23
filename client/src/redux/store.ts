import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth.api";
import authSlice from "./slices/auth.slice"
import { brandApi } from "./apis/brand.api";
import { productApi } from "./apis/product.api";
import { policyApi } from "./apis/policy.api";
import { policyTypeApi } from "./apis/policyType.api";
import { planApi } from "./apis/plan.api";
import { notificationApi } from "./apis/notification.api";

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [brandApi.reducerPath]: brandApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [policyApi.reducerPath]: policyApi.reducer,
        [policyTypeApi.reducerPath]: policyTypeApi.reducer,
        [planApi.reducerPath]: planApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        auth: authSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            brandApi.middleware,
            productApi.middleware,
            policyApi.middleware,
            policyTypeApi.middleware,
            planApi.middleware,
            notificationApi.middleware,
        )
})

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

export default reduxStore

