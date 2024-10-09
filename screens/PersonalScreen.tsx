import { StyleSheet, } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { Heading, Image, VStack, Text, HStack, Divider, FlatList, Pressable } from 'native-base'
import { addressIcon, limitIcon, notificacionIcon, privacyIcon, soportIcon, userIcon } from '@/assets'
import DefaultIcon from 'react-native-default-icon'
import { useSelector } from 'react-redux'
import { FORMAT_CEDULA, FORMAT_PHONE_NUMBER, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import Feather from '@expo/vector-icons/Feather';
import Button from '@/components/global/Button'
import { SessionContext } from '@/contexts/sessionContext'


const PersonalScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.globalReducer)
    const { onLogout } = useContext(SessionContext)

    const data = [
        {
            name: user.fullName,
            icon: userIcon,
        },
        {
            name: user.email,
            icon: privacyIcon,
        },
        {
            name: FORMAT_PHONE_NUMBER(user.phone),
            icon: limitIcon,
        },
        {
            name: user.dniNumber,
            icon: notificacionIcon,
        },
        {
            name: "Soporte",
            icon: soportIcon,
        },
    ]

    useEffect(() => {
        console.log(JSON.stringify(user, null, 2));
    }, [])

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    data={data}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
                            <HStack key={`personal${item.name}`} space={2} pl={"10px"} py={"8px"} alignItems={"center"}>
                                <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                    <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={item.icon} />
                                </HStack>
                                <VStack width={"90%"} h={"30px"} borderRadius={10}>
                                    <HStack pr={"10px"} justifyContent={"space-between"} alignItems={"center"}>
                                        <Text fontSize={scale(15)} color={colors.white}>{item.name}</Text>
                                    </HStack>
                                    {index !== 4 ? <Divider mt={"10px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                                </VStack>
                            </HStack>
                        </Pressable>
                    )} />
                <HStack borderRadius={10} bg={"lightGray"} space={2} pl={"10px"} py={"8px"} mt={"30px"}>
                    <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={addressIcon} />
                    </HStack>
                    <VStack width={"90%"} borderRadius={10}>
                        <HStack pr={"10px"} w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                            <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{"Calle 2 #13 Las Palmeras, Guaricano, Santo Domingo Norte"}</Text>
                        </HStack>
                    </VStack>
                </HStack>
            </VStack>
        </VStack>
    )
}

export default PersonalScreen


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