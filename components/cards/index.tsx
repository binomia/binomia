import React, { useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, Stack } from 'native-base'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { Dimensions, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '../global/BottomSheet'
import * as Constants from "expo-constants"
import CardModification from './CardModification'
import { globalActions } from '@/redux/slices/globalSlice'
import { useDispatch } from 'react-redux'
import { FlagsList } from 'aws-sdk/clients/guardduty'
import AntDesign from '@expo/vector-icons/AntDesign';


type Props = {
    open?: boolean
    onCloseFinish?: () => void
}


const { height } = Dimensions.get('window')

const Cards: React.FC<Props> = ({ open = false, onCloseFinish = () => { } }) => {
    const ref = React.useRef<FlagsList>(null);
    const dispatch = useDispatch()
    const [showCardModification, setShowCardModification] = useState<boolean>(false)

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
        }
    ]

    const onPressCard = async (card: any) => {
        await dispatch(globalActions.setCard(card))
        setShowCardModification(true)
    }


    return (
        <BottomSheet openTime={300} height={height} onCloseFinish={() => onCloseFinish()} open={open}>
            <VStack mt={Constants.default.statusBarHeight - 10} variant={"body"} flex={1}>
                <HStack space={5} px={"10px"} justifyContent={"space-between"}>
                    <TouchableOpacity onPress={() => onCloseFinish()}>
                        <Stack >
                            <Ionicons name="chevron-back-outline" size={30} color="white" />
                        </Stack>
                    </TouchableOpacity>
                    <Stack>
                        <Heading size={"sm"} color={colors.white} textAlign={"center"}>Tarjetas</Heading>
                    </Stack>
                    <Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} onPress={() => { }}>
                        <AntDesign name="pluscircle" size={25} color="white" />
                    </Pressable>
                </HStack>
                <VStack mt={"50px"} flex={0.95}>
                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                        <Heading size={"xl"} color={colors.white}>Tarjetas</Heading>
                    </HStack>
                    <FlatList
                        ref={ref}
                        mt={"10px"}
                        data={cards}
                        contentContainerStyle={{paddingBottom: 100}}                                           
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                        renderItem={({ item, index }) => (
                            <Pressable onPress={() => onPressCard(item)} w={"100%"} key={`card-${index}-${item.last4Digits}`} _pressed={{ opacity: 0.5 }} flexDirection={"row"} p={"15px"} borderRadius={10} bg={colors.lightGray} mt={"15px"} mr={"10px"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={{ uri: item.logo }} />
                                <VStack ml={"10px"}>
                                    <Heading fontSize={scale(15)} color={colors.white}>{item.brand} {item.last4Digits}</Heading>
                                    <Text fontSize={scale(15)} color={colors.pureGray}>{item.bankName}</Text>
                                </VStack>
                            </Pressable>
                        )}
                    />
                </VStack>
                <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
            </VStack>
        </BottomSheet>
    )
}

export default Cards