import { createSlice, configureStore } from '@reduxjs/toolkit'
import { generate } from 'short-uuid'


const registerSlice = createSlice({
    name: 'counter',
    initialState: {
        fullName: "",
        phone: "",
        username: "",
        email: "",
        dni: "",
        sex: "",
        address: "",
        dob: "",
        dniExpiration: "",
        imageUrl: "",
        password: "",
        addressAgreement: false
    },
    reducers: {
        setFullName: (state, action) => {
            state.fullName = action.payload
        },
        setPhone: (state, action) => {
            state.phone = action.payload
        },
        setEmail: (state, action) => {
            state.email = action.payload
        },
        setPassword: (state, action) => {
            state.password = action.payload
        },
        setAddress: (state, action) => {
            state.address = action.payload
        },
        setAddressAgreement: (state, action) => {
            state.addressAgreement = action.payload
        }
    }
})

export const registerActions = registerSlice.actions
export const registerReducer = registerSlice.reducer
