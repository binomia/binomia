import ExpoVpnChecker from "expo-vpn-checker";
import NetInfo from '@react-native-community/netinfo';
import VPNScreen from "@/screens/VPNScreen";
import { Stack, useNavigation } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "@/redux/slices/globalSlice";


export const RouterContext = createContext({});

export const RouterContextProvider = () => {
    const navigation = useNavigation<any>()
    const dispatch = useDispatch()
    const { isVPNConnected } = useSelector((state: any) => state.globalReducer)



    useEffect(() => {
        navigation.addListener('state', async () => {
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        })
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        });

        return () => {
            unsubscribe();
        }

    }, []);

    return (isVPNConnected ? <VPNScreen /> :
        <RouterContext.Provider value={{}}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(signup)" options={{ headerShown: false }} />
                <Stack.Screen name="(modals)" options={{ headerShown: false, headerBackVisible: false, gestureEnabled: true, presentation: "card" }} />
                <Stack.Screen name="404" />
            </Stack>
        </RouterContext.Provider>
    )
}