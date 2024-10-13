import { createSlice } from '@reduxjs/toolkit'
import { not } from 'drizzle-orm';
import * as Device from 'expo-device';

const globalSlice = createSlice({
    name: 'global',
    initialState: {
        appInBackgroundTime: 0,
        account: {},
        card: {},
        cards: [],
        kyc: {},
        user: {},
        applicationId: "",
        jwt: "",
        allowFaceId: false,
        whatsappNotifications: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
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
        setCard: (state, action) => {
            state.card = action.payload
        },
        setCards: (state, action) => {
            state.cards = action.payload
        },
        setAppInBackgroundTime: (state, action) => {
            state.appInBackgroundTime = action.payload
        },
        setPushNotification: (state, action) => {
            state.pushNotifications = action.payload
        },
        setSmsNotification: (state, action) => {
            state.smsNotifications = action.payload
        },
        setEmailNotification: (state, action) => {
            state.emailNotifications = action.payload
        },
        setWhatsappNotification: (state, action) => {
            state.whatsappNotifications = action.payload
        },
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
