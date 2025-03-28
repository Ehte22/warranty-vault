import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../apis/auth.api";
import { IUser } from "../../models/user.interface";
import { planApi } from "../apis/plan.api";

interface InitialState {
    user: IUser | null
    sessionExpiredOpen: boolean
}

const initialState: InitialState = {
    user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") as string)
        : null,
    sessionExpiredOpen: false
}

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.user = null
            localStorage.removeItem("user")
        },
        openSessionExpiredModal: (state) => {
            state.sessionExpiredOpen = true
        },
        closeSessionExpiredModal: (state) => {
            state.sessionExpiredOpen = false
        }
    },
    extraReducers: builder => builder

        .addMatcher(authApi.endpoints.signUp.matchFulfilled, (state, { payload }) => {
            state.user = payload.result
        })
        .addMatcher(authApi.endpoints.signIn.matchFulfilled, (state, { payload }) => {
            state.user = payload.result
        })
        .addMatcher(planApi.endpoints.selectPlan.matchFulfilled, (state, { payload }) => {
            state.user = payload.result
        })
        .addMatcher(authApi.endpoints.signOut.matchFulfilled, (state) => {
            state.user = null
        })
})

export const {
    logoutUser,
    openSessionExpiredModal,
    closeSessionExpiredModal
} = authSlice.actions

export default authSlice.reducer

export type { InitialState }