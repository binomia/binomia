import { createSlice } from '@reduxjs/toolkit'

const accountSlice = createSlice({
    name: 'global',
    initialState: {
        haveAccountChanged: false,
        account: {},
        card: {},
        cards: [],
        kyc: {},
        user: {},
    },
    reducers: {
        setCard: (state, action) => {
            state.card = action.payload
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
    }
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer
