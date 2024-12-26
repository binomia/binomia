import { createSlice } from '@reduxjs/toolkit'

const topupSlice = createSlice({
    name: 'topups',
    initialState: {
        topup: {}        
    },
    reducers: {
        setTopUp: (state, action) => {
            state.topup = action.payload
        }
    }
})

export const topupActions = topupSlice.actions
export const topupReducer = topupSlice.reducer
