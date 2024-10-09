import { createSlice } from '@reduxjs/toolkit'
import * as Device from 'expo-device';

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        account: {},
        kyc: {},
        user: {},
        applicationId: "",
        jwt: "",
        allowFaceId: false,
        network: {
            isConnected: false,
            type: "unknown",
            isInternetReachable: false,
            ip: ""
        },
        location: {},
        device: {
            isDevice: Device.isDevice,
            deviceBrand: Device.brand,
            deviceName: Device.deviceName,
            deviceModelName: Device.modelName,
            deviceOsName: Device.osName,
            deviceOsVersion: Device.osVersion,
        }
    },
    reducers: {
        setAllowFaceId: (state, action) => {
            state.allowFaceId = action.payload
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
        setNetwork: (state, action) => {
            state.network = action.payload
        },
        setLocation: (state, action) => {
            state.location = action.payload
        },
        setJwt: (state, action) => {
            state.jwt = action.payload
        },
        setApplicationId: (state, action) => {
            state.applicationId = action.payload
        }
    }
})

export const globalActions = globalSlice.actions
export const globalReducer = globalSlice.reducer
