import { StyleSheet, } from 'react-native'
import React, { useEffect } from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Pressable, Switch } from 'native-base'
import { addressIcon, limitIcon, notificacionIcon, privacyIcon, soportIcon, userIcon } from '@/assets'
import { useSelector } from 'react-redux'
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'

const PrivacyScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.globalReducer)

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

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <HStack bg={"lightGray"} w={"100%"} borderRadius={10} space={2} pl={"10px"} py={"8px"} mb={"30px"}>
                    <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={addressIcon} />
                    </HStack>
                    <HStack flex={1} justifyContent={"space-between"} alignItems={"center"}>
                        <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                            <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{"Face ID"}</Text>
                        </HStack>
                        <Switch defaultIsChecked mr={"10px"} />
                    </HStack>
                </HStack>
                <FlatList
                    bg={"lightGray"}
                    data={data}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
                            <HStack bg={"lightGray"} w={"100%"} borderRadius={10} space={2} pl={"10px"} py={"8px"} >
                                <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                    <Image alt='logo-image' resizeMode='contain' w={"18px"} h={"18px"} source={addressIcon} />
                                </HStack>
                                <VStack flex={1}>
                                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                                        <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                            <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{"Face ID"}</Text>
                                        </HStack>
                                        <Switch isChecked={true} defaultIsChecked onChange={(e) => alert(e)} mr={"10px"} />
                                    </HStack>
                                    {index !== 4 ? <Divider mt={"10px"} width={"100%"} h={"0.5px"} bg={colors.gray} /> : null}
                                </VStack>
                            </HStack>
                        </Pressable>
                    )} />
            </VStack>
        </VStack>
    )
}

export default PrivacyScreen


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