import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Ionicons from '@expo/vector-icons/Ionicons';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import Cards from '@/components/cards';
import Button from '@/components/global/Button';
import { SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { mastercardLogo, americanExpressLogo, jcbLogo, visaLogo } from '@/assets';
import { FORMAT_CURRENCY } from '@/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import { accountActions } from '@/redux/slices/accountSlice';


type Props = {
    title?: string
    showBalance?: boolean
    onSendFinish?: (amount: number) => any
    onCloseFinish?: () => void
}

const DepositOrWithdrawTransaction: React.FC<Props> = ({ title = "Depositar", showBalance = true, onSendFinish = (p: number) => p }) => {
    const { card, account, limits } = useSelector((state: any) => state.accountReducer)
    const [input, setInput] = useState<string>("0");
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [payFromCard, setPayFromCard] = useState<any>(card);
    const [warningMessage, setWarningMessage] = useState<string>("");

    const dispatch = useDispatch();

    const onChange = (value: number) => {
        if (title === "Retirar") {
            const limit = account.withdrawLimit - limits.withdrawAmount
            setShowPayButton(value >= 10 && value <= account.balance && value <= limit)

            const enableWarning = value > account.balance || value > limit
            if (enableWarning) {
                setShowWarning(enableWarning)

                const message = `En este momento solo puedes retirar un monto máximo de ${FORMAT_CURRENCY(limit)} pesos.`
                setWarningMessage(message)

            } else {
                setShowWarning(false)
                setWarningMessage("")
            }

        } else {
            setShowPayButton(false)

            const limit = account.depositLimit - limits.depositAmount
            setShowPayButton(value >= 10 && value <= limit)

            const enableWarning = value > limit
            if (enableWarning) {
                setShowWarning(enableWarning)

                const message = `En este momento solo puedes depositar un monto máximo de ${FORMAT_CURRENCY(limit)} pesos.`
                setWarningMessage(message)

            } else {
                setShowWarning(false)
                setWarningMessage("")
            }
        }

        setInput(value.toString())
    }

    const RenderCardLogo: React.FC<{ brand: string }> = ({ brand }: { brand: string }) => {
        switch (brand) {
            case "visa":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={visaLogo} />

            case "mastercard":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={mastercardLogo} />

            case "american-express":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={americanExpressLogo} />

            case "jcb":
                return <Image alt='logo-image' mr={"10px"} resizeMode='contain' w={"50px"} h={"50px"} source={jcbLogo} />

            default:
                return null
        }
    }

    const onCardPress = async (card: any) => {
        await dispatch(accountActions.setCard(card))
        setShowAllCards(true)
    }

    useEffect(() => {
        if (Object.keys(card).length > 0 && card.hash !== payFromCard.hash)
            setPayFromCard(card)

    }, [card])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack px={"20px"} w={"100%"} h={"100%"} justifyContent={"space-between"}>
                <VStack space={5}>
                    <HStack w={"100%"} mt={"10px"} alignItems={"center"} justifyContent={"center"}>
                        {showBalance ?
                            <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
                            : null}
                    </HStack>
                    <HStack alignItems={"center"} justifyContent={"space-between"}>
                        <Pressable onPress={() => onCardPress(payFromCard)} _pressed={{ opacity: 0.5 }} flexDirection={"row"} alignItems={"center"}>
                            <RenderCardLogo brand={payFromCard.brand} />
                            <VStack justifyContent={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{payFromCard?.alias} {payFromCard?.last4Number}</Heading>
                                <Text textTransform={"capitalize"} fontSize={scale(13)} color={colors.pureGray}>{payFromCard?.brand?.replaceAll("-", " ")}</Text>
                            </VStack>
                            <Ionicons style={{}} name="chevron-forward" size={25} color={colors.gray} />
                        </Pressable>
                        <Pressable opacity={showPayButton ? 1 : 0.5} disabled={!showPayButton} shadow={2} w={scale(100)} h={scale(35)} justifyContent={"center"} alignItems={"center"} _pressed={{ opacity: 0.5 }} bg={showPayButton ? "mainGreen" : "lightGray"} p={"5px"} borderRadius={100}>
                            <Button w={"100%"} color={showPayButton ? colors.white : colors.mainGreen} onPress={() => onSendFinish(Number(input))} title={title} />
                        </Pressable>
                    </HStack>
                    {showWarning ? <VStack w={"100%"} bottom={"10px"} alignItems={"center"}>
                        <HStack bg={colors.lightGray} w={"30px"} h={"30px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                            <MaterialIcons name="security" size={18} color={colors.warning} />
                        </HStack>
                        <Text mt={"10px"} w={"75%"} fontSize={scale(11)} textAlign={"center"} color={"white"}> {warningMessage}</Text>
                    </VStack> : null}
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