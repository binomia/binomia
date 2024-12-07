import { Linking, StyleSheet, } from 'react-native'
import React, { useContext } from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Pressable } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import Feather from '@expo/vector-icons/Feather';
import { CAPITALIZE_WORDS } from '@/helpers'
import { SUPPORT_PHONE_NUMBER } from '@/constants'
import { useSelector } from 'react-redux'
import { supportScreenData } from '@/mocks'
import Button from '@/components/global/Button'
import { SessionContext } from '@/contexts/sessionContext'

const SupportScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.globalReducer)
    const { onLogout } = useContext(SessionContext)



    const openEmail = async () => {
        try {
            const recipient = 'example@email.com'; // Replace with the recipient's email address
            const subject = `Soporte - ${CAPITALIZE_WORDS(user?.fullName)} `; // Subject of the email
            const url = `mailto:${recipient}?subject=${encodeURIComponent(subject)}`;
            await Linking.openURL(url)

        } catch (error) {
            console.error(error);
        }
    };

    const openWhatsApp = async () => {
        try {
            const url = `whatsapp://send?phone=${SUPPORT_PHONE_NUMBER}`;
            await Linking.openURL(url)

        } catch (error) {
            console.error(error);
        }
    };

    const openPhone = async () => {
        try {
            const url = `tel:${SUPPORT_PHONE_NUMBER}`;
            await Linking.openURL(url)

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} bg={"lightGray"} p={"5px"} w={"100%"} h={"auto"} mt={"50px"}>
                {supportScreenData({ openEmail, openPhone, openWhatsApp }).map((item, index) => (
                    <Pressable key={`support-screen-data-${index}-${item.name}`} _pressed={{ opacity: 0.5 }} onPress={item.onPress}>
                        <HStack space={2} pl={"10px"} py={index === 2 ? "2px" : "7px"} alignItems={"center"}>
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                            </HStack>
                            <VStack width={"90%"} h={"30px"} borderRadius={10}>
                                <HStack pr={"10px"} justifyContent={"space-between"} alignItems={"center"}>
                                    <Text textTransform={index === 2 ? "capitalize" : "lowercase"} fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    <Feather name="chevron-right" size={24} color="white" />
                                </HStack>
                                {index !== 2 ? <Divider mt={"10px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                            </VStack>
                        </HStack>
                    </Pressable>
                ))}
            </VStack>
            <HStack mb={"30px"} justifyContent={"center"}>
                <Button fontWeight={"bold"} bg={"lightGray"} color='red' title='Cerrar Sesion' onPress={onLogout} w={'80%'} />
            </HStack>
        </VStack>
    )
}

export default SupportScreen


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
        borderRadius: 100
    },
    textStyle: {
        fontSize: 30,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
})