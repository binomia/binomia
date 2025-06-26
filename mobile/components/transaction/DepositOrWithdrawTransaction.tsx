import React, { useState } from 'react'
import colors from '@/colors'
import { TouchableOpacity, SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack, Pressable } from 'native-base'
import { scale } from 'react-native-size-matters';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '../global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import Cards from '../cards';
import { depositIcon } from '@/assets';
import { useNavigation } from '@react-navigation/native';


type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const DepositOrWithdrawTransaction: React.FC<Props> = ({ onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>()

    const { card } = useSelector((state: any) => state.accountReducer)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);


    const onChange = (value: string) => {
        if (Number(value) >= 10)
            setShowPayButton(true)
        else
            setShowPayButton(false)

    }

    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        navigation.goBack()
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack variant={"body"} h={"100%"} justifyContent={"space-between"}>
                <VStack >
                    <HStack alignItems={"center"} justifyContent={"space-between"}>
                        <Stack>
                            <TouchableOpacity onPress={() => handleOnClose()}>
                                <Ionicons name="chevron-back-outline" size={30} color="white" />
                            </TouchableOpacity>
                        </Stack>
                        <HStack space={2}>
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(40)} h={scale(40)} source={{ uri: card?.logo }} />
                            <VStack justifyContent={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{card?.brand} {card?.last4Digits}</Heading>
                                <Text fontSize={scale(13)} color={colors.pureGray}>{card?.bankName}</Text>
                            </VStack>
                        </HStack>
                        <Pressable opacity={showPayButton ? 1 : 0.5} disabled={!showPayButton} shadow={2} w={scale(50)} h={scale(50)} justifyContent={"center"} alignItems={"center"} _pressed={{ opacity: 0.5 }} bg={showPayButton ? "mainGreen" : "lightGray"} p={"5px"} borderRadius={100}>
                            <Image alt='logo-image' tintColor={showPayButton ? colors.white : colors.mainGreen} resizeMode='contain' w={scale(25)} h={scale(25)} source={depositIcon} />
                        </Pressable>
                    </HStack>
                </VStack>
                <VStack mb={"20px"}>
                    <KeyNumberPad
                        onChange={(value: string) => onChange(value)}
                    />
                </VStack>
                <Cards justSelecting={true} onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            </VStack>
        </SafeAreaView>
    )
}

export default DepositOrWithdrawTransaction