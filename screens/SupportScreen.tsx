import { Linking, StyleSheet, } from 'react-native'
import React from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Pressable } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import Feather from '@expo/vector-icons/Feather';
import { CAPITALIZE_WORDS } from '@/helpers'
import { SUPPORT_PHONE_NUMBER } from '@/constants'
import { useSelector } from 'react-redux'
import { supportScreenData } from '@/mocks'

const SupportScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.accountReducer)

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
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    data={supportScreenData({ openEmail, openPhone, openWhatsApp })}
                    borderRadius={10}
                    pb={"4px"}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <Pressable _pressed={{ opacity: 0.5 }} onPress={item.onPress}>
                            <HStack key={`personal${item.name}`} space={2} pl={"10px"} py={"7px"} alignItems={"center"}>
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
                    )} />
            </VStack>
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