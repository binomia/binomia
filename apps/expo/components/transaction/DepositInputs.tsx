import React, { useState } from 'react'
import colors from '@/colors'
import { SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable } from 'native-base'
import { scale } from 'react-native-size-matters';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import Cards from '@/components/cards';
import { mastercardLogo, visaLogo } from '@/assets';
import Button from '@/components/global/Button';


type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const DepositInputs: React.FC<Props> = ({ onSendFinish = () => { } }) => {
    const { card } = useSelector((state: any) => state.accountReducer)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);


    const onChange = (value: string) => {
        if (Number(value) >= 10)
            setShowPayButton(true)
        else
            setShowPayButton(false)
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
            <VStack px={"10px"} w={"100%"} h={"100%"} justifyContent={"space-between"}>
                <HStack mt={"3px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable onPress={() => setShowAllCards(true)} _pressed={{ opacity: 0.5 }} flexDirection={"row"} alignItems={"center"}>
                        {renderCardLogo(card.brand)}
                        <VStack justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{card?.brand} {card?.last4Number}</Heading>
                            <Text fontSize={scale(13)} color={colors.pureGray}>{card?.alias}</Text>
                        </VStack>
                        <Ionicons style={{ marginBottom: 20 }} name="chevron-forward" size={25} color={colors.gray} />
                    </Pressable>
                    <Pressable opacity={showPayButton ? 1 : 0.5} disabled={!showPayButton} shadow={2} w={scale(100)} h={scale(35)} justifyContent={"center"} alignItems={"center"} _pressed={{ opacity: 0.5 }} bg={showPayButton ? "mainGreen" : "lightGray"} p={"5px"} borderRadius={100}>
                        <Button w={"100%"} color={showPayButton ? colors.white : colors.mainGreen} onPress={() => onSendFinish()} title='Depositar' />
                    </Pressable>
                </HStack>
                <VStack mt={"20px"}>
                    <KeyNumberPad onChange={(value: string) => onChange(value)} />
                </VStack>
                <Cards justSelecting={true} onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            </VStack>
        </SafeAreaView>
    )
}

export default DepositInputs