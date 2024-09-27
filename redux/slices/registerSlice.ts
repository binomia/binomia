import { createSlice, configureStore } from '@reduxjs/toolkit'
import { generate } from 'short-uuid'


const registerSlice = createSlice({
    name: 'counter',
    initialState: {
        faceVideoUrl: "",
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
        addressAgreement: false,
        userAgreement: false,
        idBackUrl: "",
        idFrontUrl: "",
    },
    reducers: {
        setUserAgreement: (state, action) => {
            state.userAgreement = action.payload
        },
        setFaceVideoUrl: (state, action) => {
            state.faceVideoUrl = action.payload
        },
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
        },
        setDni: (state, action) => {
            state.dni = action.payload
        },
        setDniExpiration: (state, action) => {
            state.dniExpiration = action.payload
        },
        setDniDOB: (state, action) => {
            state.dob = action.payload
        },
        setSex: (state, action) => {
            state.sex = action.payload
        },
        setUsername: (state, action) => {
            state.username = action.payload
        },
        setImageUrl: (state, action) => {
            state.imageUrl = action.payload
        },
        setIdFrontUrl: (state, action) => {
            state.idFrontUrl = action.payload
        },
        setIdBackUrl: (state, action) => {
            state.idBackUrl = action.payload
        }
    }
})

export const registerActions = registerSlice.actions
export const registerReducer = registerSlice.reducer
