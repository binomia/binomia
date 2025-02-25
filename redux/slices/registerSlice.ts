import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    fullName: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    profileImageUrl: null,
    userAgreementSigned: false,
    idBackUrl: "",
    idFrontUrl: "",
    faceVideoUrl: "",
    address: "",

    dniNumber: "",
    dob: "",
    dniExpiration: "",
    gender: null,
    occupation: null,
    maritalStatus: null,
    bloodType: null
}

const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {
        reSetAllState: (state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            state = initialState
        },
        setUserAgreement: (state, action) => {
            state.userAgreementSigned = action.payload
        },
        setFaceVideoUrl: (state, action) => {
            state.faceVideoUrl = action.payload
        },
        setFullName: (state, action) => {
            state.fullName = action.payload.toLowerCase()
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
        setDni: (state, action) => {
            state.dniNumber = action.payload
            state.username = action.payload
        },
        setDniExpiration: (state, action) => {
            state.dniExpiration = action.payload
        },
        setDniDOB: (state, action) => {
            state.dob = action.payload
        },
        setSex: (state, action) => {
            state.gender = action.payload
        },
        setUsername: (state, action) => {
            state.username = action.payload
        },
        setImageUrl: (state, action) => {
            state.profileImageUrl = action.payload
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
