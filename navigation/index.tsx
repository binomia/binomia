import * as React from 'react';
import SignUpStack from '@/navigation/SignUpStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext, useEffect } from 'react';
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { Image } from 'native-base';
import { homeOff, homeOn, profileOff, profileOn, transationsOff, transationsOn } from '@/assets';
import colors from '@/colors';
import HomeStack from './HomeStack';
import useAsyncStorage from '@/hooks/useAsyncStorage';
import { useDispatch } from 'react-redux';
import { globalActions } from '@/redux/slices/globalSlice';
import * as Crypto from 'expo-crypto';
import { useLocation } from "@/hooks/useLocation";
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';



const HomeNavigationTab: React.FC = () => {
    const Tab = createBottomTabNavigator();

    const tabBarIcon = ({ route }: { route: any }) => ({
        headerShown: false,
        tabBarStyle: {
            backgroundColor: colors.darkGray,
            borderTopWidth: 0,
            elevation: 0,
        },
        tabBarIcon: ({ focused }: any) => {
            switch (route.name) {
                case "Home":
                    return <Image resizeMode='contain' w={'25px'} h={'25px'} source={focused ? homeOn : homeOff} alt='home-on' />

                case "Transactions":
                    return <Image resizeMode='contain' w={'25px'} h={'25px'} source={focused ? transationsOn : transationsOff} alt='home-on' />

                case "Profile":
                    return <Image resizeMode='contain' w={'25px'} h={'25px'} source={focused ? profileOn : profileOff} alt='home-on' />

                default:
                    break
            }
        }
    })

    return (
        <Tab.Navigator screenOptions={tabBarIcon} >
            <Tab.Group screenOptions={{ headerShown: false }} >
                <Tab.Screen options={{ tabBarShowLabel: true, title: "" }} name='Home' component={HomeStack} />
                <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true, title: "" }} name='Transactions' component={HomeStack} />
                <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true, title: "" }} name='Profile' component={HomeStack} />
            </Tab.Group>
        </Tab.Navigator>
    )
}


export const Navigation: React.FC = () => {
    const { setItem, getItem } = useAsyncStorage()
    const dispatch = useDispatch()
    const { jwt } = useContext<SessionPropsType>(SessionContext);
    const { getLocation } = useLocation()

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


    useEffect(() => {
        (async () => {
            try {
                const [ip, network] = await Promise.all([Network.getIpAddressAsync(), Network.getNetworkStateAsync()])
                const id = await getItem("applicationId")
                const location = await getLocation()

                await Promise.all([
                    dispatch(globalActions.setNetwork({ ...network, ip })),
                    dispatch(globalActions.setLocation(location))
                ])


                if (id)
                    await dispatch(globalActions.setApplicationId(id))

                else {
                    const applicationId = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Crypto.randomUUID().toString(), {
                        encoding: Crypto.CryptoEncoding.HEX
                    })

                    await dispatch(globalActions.setApplicationId(id))
                    setItem("applicationId", applicationId)
                }

            } catch (error) {
                console.log({ error });
            }


            await delay(3000); // Wait for 5 seconds
            await SplashScreen.hideAsync();

        })()
    }, [])

    return (
        jwt ? <HomeNavigationTab /> : <SignUpStack />
    )
}

