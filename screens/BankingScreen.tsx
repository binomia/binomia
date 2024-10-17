import React, { useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { depositIcon, withdrawIcon } from '@/assets'
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment'
import { FORMAT_CURRENCY } from '@/helpers'
import KeyNumberPad from '@/components/global/KeyNumberPad'
import BottomSheet from '@/components/global/BottomSheet'
import DepositOrWithdrawTransaction from '@/components/transaction/DepositOrWithdrawTransaction'
import { globalActions } from '@/redux/slices/globalSlice'
import Cards from '@/components/cards'
import CardModification from '@/components/cards/CardModification'
import { RefreshControl } from 'react-native'
import AddOrEditCard from '@/components/cards/AddOrEditCard'


const BankingScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { account } = useSelector((state: any) => state.globalReducer)
    const [showMakeTransaction, setShowMakeTransaction] = useState<boolean>(false)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [transactionTitle, setTransactionTitle] = useState<string>("Deposito")

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

    const transactions = [
        {
            logo: "arrowup",
            name: 'Deposito',
            date: "2024-01-01",
            amount: 100
        },
        {
            logo: "arrowup",
            name: 'Deposito',
            date: "2024-01-01",
            amount: 100
        },
        {
            logo: "arrowdown",
            name: 'Retiro',
            date: "2024-01-01",
            amount: 100
        },
    ]


    const handleMakeTransaction = async (title: string) => {
        setTransactionTitle(title)

        await dispatch(globalActions.setCard(cards[0]))
        setShowMakeTransaction(true)
    }

    const handleCloseMakeTransaction = async () => {
        await dispatch(globalActions.setCard({}))
        setShowMakeTransaction(false)
    }

    const handleShowAllCards = async () => {
        setShowAllCards(true)
    }

    const onPressCard = async (card: any) => {
        await dispatch(globalActions.setCard(card))
        setShowCardModification(true)
    }

    return (
        <VStack variant={"body"} h={"100%"}>
            <HStack borderRadius={10} w={"100%"} mt={"50px"} space={2} justifyContent={"space-between"}>
                <Pressable onPress={() => handleMakeTransaction("Deposito")} _pressed={{ opacity: 0.5 }} w={"48%"} h={"150px"} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                    <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={depositIcon} />
                    <Heading size={"md"} color={colors.mainGreen}>Deposito</Heading>
                </Pressable>
                <Pressable onPress={() => handleMakeTransaction("Retiro")} _pressed={{ opacity: 0.5 }} w={"48%"} h={"150px"} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                    <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={withdrawIcon} />
                    <Heading size={"md"} color={colors.mainGreen}>Retiro</Heading>
                </Pressable>
            </HStack>
            <VStack mt={"50px"}>
                <HStack justifyContent={"space-between"} alignItems={"center"}>
                    <Heading size={"lg"} color={colors.white}>Tarjetas</Heading>
                    <Pressable _pressed={{ opacity: 0.5 }} onPress={handleShowAllCards}>
                        <Heading underline size={"xm"} color={colors.pureGray}>Ver todas</Heading>
                    </Pressable>
                </HStack>
                <FlatList
                    horizontal
                    mt={"15px"}
                    data={cards}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    renderItem={({ item, index }) => (
                        <Pressable onPress={() => onPressCard(item)} key={`card-${index}-${item.last4Digits}`} _pressed={{ opacity: 0.5 }} flexDirection={"row"} px={"15px"} py={"10px"} borderRadius={10} bg={colors.lightGray} mt={"10px"} mr={"10px"} alignItems={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={{ uri: item.logo }} />
                            <VStack>
                                <Heading fontSize={scale(15)} color={colors.white}>{item.brand} {item.last4Digits}</Heading>
                                <Text fontSize={scale(15)} color={colors.pureGray}>{item.bankName}</Text>
                            </VStack>
                        </Pressable>
                    )}
                />
            </VStack>
            <VStack mt={"40px"}>
                <HStack justifyContent={"space-between"} alignItems={"center"}>
                    <Heading size={"lg"} color={colors.white}>Transacciones</Heading>
                    <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
                        <Heading underline size={"xm"} color={colors.pureGray}>Ver todas</Heading>
                    </Pressable>
                </HStack>
                <FlatList
                    mt={"20px"}
                    data={transactions}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={() => { }} />}
                    renderItem={({ item, index }) => (
                        <Pressable mb={"25px"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} >
                            <HStack >
                                <HStack w={"50px"} h={"50px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                                    <AntDesign name={item.logo as any} size={24} color={item.name === "Deposito" ? colors.mainGreen : colors.red} />
                                </HStack>

                                <VStack ml={"10px"}>
                                    <Heading fontSize={scale(15)} color={colors.white}>{item.name}</Heading>
                                    <Text fontSize={scale(15)} color={colors.pureGray}>{moment(item.date).format("lll")}</Text>
                                </VStack>
                            </HStack>
                            <Heading fontSize={scale(15)} color={item.name === "Deposito" ? colors.mainGreen : colors.red} >{item.name === "Deposito" ? "+" : "-"}{FORMAT_CURRENCY(item.amount)}</Heading>

                        </Pressable>
                    )}
                />
            </VStack>
            <DepositOrWithdrawTransaction title={transactionTitle} onCloseFinish={handleCloseMakeTransaction} open={showMakeTransaction} />
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
        </VStack>
    )
}

export default BankingScreen