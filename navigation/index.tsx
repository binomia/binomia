import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SignUpStack from './SignUpStack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { SessionPropsType } from '../types';
import { SessionContext } from '../contexts';
import { Button } from 'react-native';
import { HStack } from 'native-base';

const HomeScreen: React.FC = () => {
    const { onLogout } = useContext<SessionPropsType>(SessionContext);


    return (
        <HStack bg={"black"} variant={"body"} alignItems={"center"} flex={1}>
            <Button onPress={onLogout} title="Logout" />
        </HStack>
    )
}



const HomeNavigationTab: React.FC = () => {
    const Tab = createBottomTabNavigator();

    const tabBarStyles = {
        headerShown: false,
        tabBarStyle: {
            backgroundColor: "#1E1E1E",
            borderTopWidth: 0,
            elevation: 0,
        }
    }

    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={tabBarStyles} >
                <Tab.Group screenOptions={{ headerShown: false }} >
                    <Tab.Screen options={{ headerShown: false, tabBarShowLabel: true }} name='Inicio' component={HomeScreen} />
                </Tab.Group>
            </Tab.Navigator>
        </NavigationContainer>
    )
}



export const Navigation: React.FC = () => {
    const { jwt } = useContext<SessionPropsType>(SessionContext);

    return (
        jwt ?
            <HomeNavigationTab />
            :
            <SignUpStack />
    )
}

