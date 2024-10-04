import * as React from 'react';
import SignUpStack from '@/navigation/SignUpStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Image } from 'native-base';
import { homeOff, homeOn, profileOff, profileOn, transationsOff, transationsOn } from '@/assets';
import colors from '@/colors';
import HomeStack from './HomeStack';
import useAsyncStorage from '@/hooks/useAsyncStorage';
import { useDispatch, useSelector } from 'react-redux';
import { globalActions } from '@/redux/slices/globalSlice';
import * as Crypto from 'expo-crypto';
import { useLocation } from "@/hooks/useLocation";
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import { useLazyQuery } from '@apollo/client';
import { UserApolloQueries } from '@/apollo/query/userQuery';
import { UserAuthSchema } from '@/auth/userAuth';

const RootTab: React.FC = () => {
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

    const state = useSelector((state: any) => state.globalReducer)
    const [getSessionUser] = useLazyQuery(UserApolloQueries.sessionUser());
    const { setItem, getItem } = useAsyncStorage()
    const dispatch = useDispatch()
    const [jwt, setJwt] = useState<string | null>(null);
    const { getLocation } = useLocation()

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    useEffect(() => {
        (async () => {
            try {
                const jwt = await getItem("jwt");

                if (!jwt) {
                    await delay(3000); // Wait for 5 seconds
                    await SplashScreen.hideAsync();
                    return;
                };

                const [ip, network] = await Promise.all([Network.getIpAddressAsync(), Network.getNetworkStateAsync()])
                const location = await getLocation()
                const _applicationId = await getItem("applicationId")

                setJwt(jwt);

                await Promise.all([
                    dispatch(globalActions.setNetwork({ ...network, ip })),
                    dispatch(globalActions.setLocation(location))
                ])

                let applicationId = _applicationId;
                if (!applicationId)
                    applicationId = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Crypto.randomUUID().toString(), {
                        encoding: Crypto.CryptoEncoding.HEX
                    })

                setItem("applicationId", applicationId)
                await dispatch(globalActions.setApplicationId(applicationId))
                // const user = await getSessionUser({
                //     context: {
                //         headers: {
                //             "session-auth-identifier": applicationId,
                //             "authorization": `Bearer ${jwt}`
                //         }
                //     }
                // })

                // const userProfileData = await UserAuthSchema.userProfileData.parseAsync(user.data.sessionUser)
                // const kycData = await UserAuthSchema.kycData.parseAsync(user.data.sessionUser.kyc)
                // const accountsData = await UserAuthSchema.accountsData.parseAsync(user.data.sessionUser.accounts)

                // // console.log(JSON.stringify({
                // //     user: userProfileData,
                // //     kyc: kycData,
                // //     accounts: accountsData
                // // }, null, 2));
                
                // await dispatch(globalActions.setSession({
                //     accounts: accountsData,
                //     user: userProfileData,
                //     kyc: kycData
                // }))


            } catch (error) {
                console.log({ error });
            }

            await delay(3000); // Wait for 5 seconds
            await SplashScreen.hideAsync();

        })()
    }, [])

    return (
        jwt ? <RootTab /> : <SignUpStack />
    )
}

