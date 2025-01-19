import React, { useState } from 'react'
import colors from '@/colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import Cards from '@/components/cards';
import Button from '@/components/global/Button';
import { SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';
import { mastercardLogo, visaLogo } from '@/assets';
import { FORMAT_CURRENCY } from '@/helpers';
import { MaterialIcons } from '@expo/vector-icons';


type Props = {
    title?: string
    showAvailable?: boolean
    onSendFinish?: (amount: number) => any
    onCloseFinish?: () => void
}

const DepositOrWithdrawTransaction: React.FC<Props> = ({ title = "Depositar", showAvailable = false, onSendFinish = (_: number) => { } }) => {
    const { card, account } = useSelector((state: any) => state.accountReducer)
    const [input, setInput] = useState<string>("0");
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);


    const onChange = (value: number) => {
        if (value >= 10)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value.toString())
    }


    const renderCardLogo = (brand: string) => {
        switch (brand) {
            case "visa":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={visaLogo} />

            case "mastercard":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={mastercardLogo} />

            default:
                return null
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack px={"20px"} w={"100%"} h={"100%"} justifyContent={"space-between"}>
                <VStack space={5}>
                    <HStack mt={"20px"} alignItems={"center"} justifyContent={"space-between"}>
                        <Pressable onPress={() => setShowAllCards(true)} _pressed={{ opacity: 0.5 }} flexDirection={"row"} alignItems={"center"}>
                            {renderCardLogo(card.brand)}
                            <VStack justifyContent={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{card?.brand} {card?.last4Number}</Heading>
                                <Text fontSize={scale(13)} color={colors.pureGray}>{card?.alias}</Text>
                            </VStack>
                            <Ionicons style={{ marginBottom: 20 }} name="chevron-forward" size={25} color={colors.gray} />
                        </Pressable>
                        <Pressable opacity={showPayButton ? 1 : 0.5} disabled={!showPayButton} shadow={2} w={scale(100)} h={scale(35)} justifyContent={"center"} alignItems={"center"} _pressed={{ opacity: 0.5 }} bg={showPayButton ? "mainGreen" : "lightGray"} p={"5px"} borderRadius={100}>
                            <Button w={"100%"} color={showPayButton ? colors.white : colors.mainGreen} onPress={() => onSendFinish(Number(input))} title={title} />
                        </Pressable>
                    </HStack>
                    <VStack w={"100%"} alignItems={"center"}>
                        <HStack bg={colors.lightGray} w={"40px"} h={"40px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                            <MaterialIcons name="security" size={24} color={colors.warning} />
                        </HStack>
                        <Text mt={"10px"} w={"80%"} fontSize={scale(12)} textAlign={"center"} color={"white"}>
                            El limite que puedes depositar es de {FORMAT_CURRENCY(account.balance)}. Para depositar más, debes de esperar haz el siguien Lunes
                        </Text>
                    </VStack>
                </VStack>
                <VStack mb={"15px"}>
                    <KeyNumberPad onChange={(value: string) => onChange(Number(value))} />
                </VStack>
                <Cards justSelecting={true} onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            </VStack>
        </SafeAreaView>
    )
}

export default DepositOrWithdrawTransaction