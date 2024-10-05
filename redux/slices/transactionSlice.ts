import { createSlice } from '@reduxjs/toolkit'

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        sender: {},
        receiver: {},
    },
    reducers: {
        setSender: (state, action) => {
            state.sender = action.payload
        },
        setReceiver: (state, action) => {
            state.receiver = action.payload
        }
    }
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
