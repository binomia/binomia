import ExpoVpnChecker from "expo-vpn-checker";
import NetInfo from '@react-native-community/netinfo';
import VPNScreen from "@/components/global/VPNScreen";
import { Stack, useNavigation } from "expo-router";
import { createContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "@/redux/slices/globalSlice";
import colors from "@/colors";


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
        const unsubscribe = NetInfo.addEventListener(async () => {
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        });

        return () => {
            unsubscribe();
        }

    }, []);

    const defaultHeaderStyles = {
        backgroundColor: colors.darkGray,
        shadowOpacity: 0,
        paddingLeft: 0
    }
    const defaultTabStyles = {
        backgroundColor: colors.darkGray,
        borderTopWidth: 0,
        elevation: 0,
    }

    const defaultscreenOptions = {
        headerBackTitleVisible: false,
        headerTintColor: colors.white,
        headerStyle: { ...defaultHeaderStyles },
        tabBarStyle: { ...defaultTabStyles }

    }

    return (isVPNConnected ? <VPNScreen /> :
        <RouterContext.Provider value={{}}>
            <Stack>
                <Stack.Screen name="(main)" options={{ ...defaultscreenOptions, headerShadowVisible: false, title: "Auditoría" }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(signup)" options={{ headerShown: false }} />
            </Stack>
        </RouterContext.Provider>
    )
}