import React, {  } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, Stack } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { Dimensions, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '../global/BottomSheet'
import * as Constants from "expo-constants"


type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}


const { height } = Dimensions.get('window')

const Cards: React.FC<Props> = ({ title = "Deposito", open = false, onSendFinish = () => { }, onCloseFinish = () => { } }) => {

    const cards = [
        {
            logo: "https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png",
            brand: 'MasterCard',
            bankName: "Banco Popular",
            last4Digits: "2180"
        },
        {
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Visa_2021.svg/1200px-Visa_2021.svg.png",
            brand: 'Visa',
            bankName: "Banco Popular",
            last4Digits: "2180"
        },
        {
            logo: "https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png",
            brand: 'MasterCard',
            bankName: "Banco Popular",
            last4Digits: "2180"
        },
    ]


    return (
        <BottomSheet openTime={300} height={height} onCloseFinish={() => onCloseFinish()} open={open}>
            <VStack mt={Constants.default.statusBarHeight - 10}  variant={"body"} h={"100%"}>
                <HStack  space={5} px={"10px"} justifyContent={"space-between"}>
                    <TouchableOpacity onPress={() => onCloseFinish()}>
                        <Stack w={"50px"}>
                            <Ionicons name="chevron-back-outline" size={30} color="white" />
                        </Stack>
                    </TouchableOpacity>
                    <Stack>
                        <Heading size={"sm"} color={colors.white} textAlign={"center"}>Tarjetas</Heading>
                    </Stack>
                    <Stack w={"50px"} />
                </HStack>
                <VStack mt={"50px"}>
                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                        <Heading size={"xl"} color={colors.white}>Tarjetas</Heading>                        
                    </HStack>
                    <FlatList                     
                        mt={"10px"}
                        data={cards}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={true}
                        renderItem={({ item, index }) => (
                            <Pressable w={"100%"} key={`card-${index}-${item.last4Digits}`} _pressed={{ opacity: 0.5 }} flexDirection={"row"} px={"15px"} py={"10px"} borderRadius={10} bg={colors.lightGray} mt={"15px"} mr={"10px"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={{ uri: item.logo }} />
                                <VStack ml={"10px"}>
                                    <Heading fontSize={scale(15)} color={colors.white}>{item.brand} {item.last4Digits}</Heading>
                                    <Text fontSize={scale(15)} color={colors.pureGray}>{item.bankName}</Text>
                                </VStack>
                            </Pressable>
                        )}
                    />
                </VStack>
            </VStack>
        </BottomSheet>
    )
}

export default Cards