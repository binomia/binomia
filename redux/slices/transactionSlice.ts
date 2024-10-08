import { createSlice } from '@reduxjs/toolkit'

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        sender: {},
        receiver: {},
        transaction: {}
    },
    reducers: {
        setSender: (state, action) => {
            state.sender = action.payload
        },
        setReceiver: (state, action) => {
            state.receiver = action.payload
        },
        setTransaction: (state, action) => {
            state.transaction = action.payload
        }
    }
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
