import { StyleSheet, Button } from 'react-native'
import React, { useContext } from 'react'
import { SessionPropsType } from '@/types';
import { SessionContext } from '@/contexts/sessionContext';
import { HStack } from 'native-base';
import colors from '@/colors';

const HomeScreen: React.FC = () => {
    const { onLogout } = useContext<SessionPropsType>(SessionContext);


    return (
        <HStack bg={colors.darkGray} variant={"body"} justifyContent={"center"} alignItems={"center"} flex={1}>
            <Button onPress={onLogout} title="Logout" />
        </HStack>
    )
}

export default HomeScreen

const styles = StyleSheet.create({})