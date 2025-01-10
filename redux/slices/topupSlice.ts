import { createSlice } from '@reduxjs/toolkit'
import phone from 'phone'

const topupSlice = createSlice({
    name: 'topups',
    initialState: {
        topup: {},
        newTopUp: {},
        phoneNumber: "",
        fullName: "",
        company: {},
        hasNewTransaction: false
    },
    reducers: {
        setPhoneNumber: (state, action) => {
            state.phoneNumber = action.payload
        },
        setFullName: (state, action) => {
            state.fullName = action.payload
        },
        setCompany: (state, action) => {
            state.company = action.payload
        },
        setNewTopUp: (state, action) => {
            state.newTopUp = action.payload
        },
        setTopUp: (state, action) => {
            state.topup = action.payload
        },
        setHasNewTransaction: (state, action) => {
            state.hasNewTransaction = action.payload
        }
    }
})

export const topupActions = topupSlice.actions
export const topupReducer = topupSlice.reducer
