import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth.api";
import authSlice from "./slices/auth.slice"
import { brandApi } from "./apis/brand.api";
import { productApi } from "./apis/product.api";
import { policyApi } from "./apis/policy.api";
import { policyTypeApi } from "./apis/policyType.api";
import { planApi } from "./apis/plan.api";
import { notificationApi } from "./apis/notification.api";
import { paymentApi } from "./apis/payment.api";
import { userApi } from "./apis/user.api";
import { couponApi } from "./apis/coupon.api";

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [brandApi.reducerPath]: brandApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [policyApi.reducerPath]: policyApi.reducer,
        [policyTypeApi.reducerPath]: policyTypeApi.reducer,
        [planApi.reducerPath]: planApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [couponApi.reducerPath]: couponApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
        auth: authSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            userApi.middleware,
            brandApi.middleware,
            productApi.middleware,
            policyApi.middleware,
            policyTypeApi.middleware,
            planApi.middleware,
            notificationApi.middleware,
            couponApi.middleware,
            paymentApi.middleware,
        )
})

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

export default reduxStore

