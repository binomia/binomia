import { createSlice } from '@reduxjs/toolkit'
import { fetchAllTransactions, fetchRecentTransactions } from '../fetchHelper'

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        loading: false,
        sender: {},
        receiver: {},
        transaction: {},
        transactions: [],
        recentTransactions: [],
        transactionDeytails: {},
        createTransactionBody: {},
        hasNewTransaction: false
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
        },
        setTransactions: (state, action) => {
            state.transactions = action.payload
        },
        setRecentTransactions: (state, action) => {
            state.recentTransactions = action.payload
        },
        setCreateTransactionBody: (state, action) => {
            state.createTransactionBody = action.payload
        },
        setTransactionDetails: (state, action) => {
            state.transactionDeytails = action.payload
        },
        setHasNewTransaction: (state, action) => {
            state.hasNewTransaction = action.payload
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchRecentTransactions.fulfilled, (state, action) => {
            state.recentTransactions = action.payload
        })
        builder.addCase(fetchRecentTransactions.rejected, (state, action) => {
            state.recentTransactions = []
        })

        builder.addCase(fetchAllTransactions.fulfilled, (state, action) => {
            state.transactions = action.payload
            // state.loading = false
        })
        builder.addCase(fetchAllTransactions.rejected, (state, action) => {
            state.transactions = []
            // state.loading = false
        })
        builder.addCase(fetchAllTransactions.pending, (state, action) => {
            // state.loading = true
        })
    }
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
