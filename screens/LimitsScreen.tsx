import { StyleSheet, } from 'react-native'
import React, { useEffect } from 'react'
import { Image, VStack, Text, HStack, Divider, FlatList, Pressable, Progress, Center, Box, ZStack } from 'native-base'
import { addressIcon, limitIcon, notificacionIcon, privacyIcon, soportIcon, userIcon } from '@/assets'
import { useSelector } from 'react-redux'
import { FORMAT_PHONE_NUMBER } from '@/helpers'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import CircularProgress from 'react-native-circular-progress-indicator';


const LimitsScreen: React.FC = () => {
    const { user } = useSelector((state: any) => state.globalReducer)

    const data = [
        {
            title: "Enviado",
            value: 85
        },
        {
            title: "Recibido",
            value: 50
        },
        {
            title: "Retirado",
            value: 100
        }
    ]

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} h={"auto"} mt={"50px"}>
                <FlatList
                    bg={"lightGray"}
                    borderRadius={10}
                    data={data}
                    scrollEnabled={false}
                    keyExtractor={(index) => index.toString()}
                    renderItem={({ item }) => (
                        <HStack bg={"lightGray"} w={"100%"} space={2} pl={"10px"} py={"18px"} >
                            <HStack bg={"gray"} w={"35px"} h={"35px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                                <CircularProgress
                                    radius={23}
                                    value={item.value}
                                    valuePrefix={'$'}
                                    circleBackgroundColor={colors.lightGray}
                                    inActiveStrokeColor={colors.mainGreen}
                                    inActiveStrokeOpacity={0.2}
                                    activeStrokeWidth={3}
                                />
                            </HStack>
                            <VStack flex={1} px={"10px"}>
                                <HStack justifyContent={"space-between"} alignItems={"center"}>
                                    <HStack h={"30px"} borderRadius={10} alignItems={"center"} justifyContent={"space-between"}>
                                        <Text numberOfLines={3} fontSize={scale(15)} color={colors.white}>{item.title}</Text>
                                    </HStack>
                                </HStack>
                                <ZStack w={"100%"} h={"7px"} bg={colors.darkGray} borderRadius={10}>
                                    <HStack w={`${item.value}%`} h={"100%"} borderRadius={10} bg={colors.mainGreen}/>
                                </ZStack>
                            </VStack>
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default LimitsScreen