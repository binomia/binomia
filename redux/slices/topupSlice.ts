import { createSlice } from '@reduxjs/toolkit'

const topupSlice = createSlice({
    name: 'topups',
    initialState: {
        topup: {},
        newTopUp: {},
        hasNewTransaction: false
    },
    reducers: {
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
