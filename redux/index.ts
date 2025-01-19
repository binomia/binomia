import { configureStore } from '@reduxjs/toolkit'
import { registerReducer } from './slices/registerSlice'
import { globalReducer } from './slices/globalSlice'
import { transactionReducer } from './slices/transactionSlice'
import { topupReducer } from './slices/topupSlice'
import { accountReducer } from './slices/accountSlice'


export const store = configureStore({
    reducer: {
        globalReducer,
        accountReducer,
        registerReducer,
        transactionReducer,
        topupReducer
    }
})