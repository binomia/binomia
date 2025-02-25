import { Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Heading, HStack, Text, Image, VStack } from 'native-base'
import { vpnIcon } from '@/assets'
import Button from '@/components/global/Button'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from '@/colors'
import ExpoVpnChecker from "expo-vpn-checker";
import { useDispatch } from 'react-redux'
import { globalActions } from '@/redux/slices/globalSlice'

const { width } = Dimensions.get('window')
const VPNScreen: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false);

    const dispatch = useDispatch()

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const onPress = async () => {
        try {
            setRefreshing(true);

            await delay(1000);
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()));

            setRefreshing(false);

        } catch (error) {
            console.log({ error });
            setRefreshing(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack variant={"body"} justifyContent={'space-between'} alignItems={'center'} flex={1}>
                <VStack>
                    <HStack mt={'30px'} w={width} h={width}>
                        <Image resizeMode='contain' w={'100%'} h={'100%'} alt='logo-image' source={vpnIcon} />
                    </HStack>
                    <Heading px={'20px'} textAlign={'center'} color={'white'}>Conectado a una red VPN</Heading>
                    <Text mt={'5px'} px={'20px'} fontSize={'16px'} textAlign={'center'} color={'white'}>
                        El uso de Binomia a través de una red VPN no está permitido. Por favor, desactiva la VPN e intenta nuevamente.
                    </Text>
                </VStack>
                <Button
                    spin={refreshing}
                    w={'80%'}
                    mb={'30px'}
                    title='Reintentar'
                    bg={'mainGreen'}
                    onPress={onPress}
                />
            </VStack>
        </SafeAreaView>
    )
}

export default VPNScreen
