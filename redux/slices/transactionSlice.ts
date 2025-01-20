import { createSlice } from '@reduxjs/toolkit'
import { fetchAccountBankingTransactions, fetchAllTransactions, fetchRecentTransactions } from '../fetchHelper'

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        loading: false,
        sender: {},
        receiver: {},
        transaction: {},
        transactions: [],
        bankingTransactions: [],
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
        // fetchRecentTransactions
        builder.addCase(fetchRecentTransactions.fulfilled, (state, action) => {
            state.recentTransactions = action.payload
        })
        builder.addCase(fetchRecentTransactions.rejected, (state, action) => {
            state.recentTransactions = []
        })

        // fetchAllTransactions
        builder.addCase(fetchAllTransactions.fulfilled, (state, action) => {
            state.transactions = action.payload
        })
        builder.addCase(fetchAllTransactions.rejected, (state, action) => {
            state.transactions = []
        })

        // fetchAccountBankingTransactions
        builder.addCase(fetchAccountBankingTransactions.fulfilled, (state, action) => {
            state.bankingTransactions = action.payload
        })
        builder.addCase(fetchAccountBankingTransactions.rejected, (state, action) => {
            state.bankingTransactions = []
        })
        
    }
})

export const transactionActions = transactionSlice.actions
export const transactionReducer = transactionSlice.reducer
