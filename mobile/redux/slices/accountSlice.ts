import { createSlice } from '@reduxjs/toolkit'
import { fetchAccountLimit } from '../fetchHelper'

const initialState = {
    limits: {},
    haveAccountChanged: false,
    account: {},
    card: {},
    cards: [],
    kyc: {},
    user: {}
}

const accountSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        reSetAllState: (state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            state = initialState
        },
        setCard: (state, action) => {
            state.card = action.payload
        },
        setLimits: (state, action) => {
            state.limits = action.payload
        },
        setCards: (state, action) => {
            state.cards = action.payload
        },
        setAccount: (state, action) => {
            state.account = action.payload
        },
        setKyc: (state, action) => {
            state.kyc = action.payload
        },
        setUser: (state, action) => {
            state.user = action.payload
        },
        setHaveAccountChanged: (state, action) => {
            state.haveAccountChanged = action.payload
        }
    },
    extraReducers(builder) {
        // fetchAccountLimit
        builder.addCase(fetchAccountLimit.fulfilled, (state, action) => {
            state.limits = action.payload
        })
        builder.addCase(fetchAccountLimit.rejected, (state) => {
            state.limits = {}
        })
    }
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer
