import * as React from 'react';
import SignUpStack from '@/navigation/SignUpStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { Button } from 'react-native';
import { HStack, Image } from 'native-base';
import { homeOff, homeOn, profileOff, profileOn, transationsOff, transationsOn } from '@/assets';
import colors from '@/colors';
import HomeScreen from '@/screens/HomeScreen';



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
                <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true, title: "" }} name='Home' component={HomeScreen} />
                <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true, title: "" }} name='Transactions' component={HomeScreen} />
                <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true, title: "" }} name='Profile' component={HomeScreen} />
            </Tab.Group>
        </Tab.Navigator>
    )
}



export const Navigation: React.FC = () => {
    const { jwt } = useContext<SessionPropsType>(SessionContext);

    return (
        jwt ? <HomeNavigationTab /> : <SignUpStack />
    )
}

