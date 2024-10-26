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
import { Dimensions, RefreshControl } from 'react-native'
import AddOrEditCard from '@/components/cards/AddOrEditCard'
import SingleTransactionScreen from './SingleTransactionScreen'
import { transactionActions } from '@/redux/slices/transactionSlice'
import { transactionsMocks } from '@/mocks'


const { height } = Dimensions.get('window')
const BankingScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { account, user } = useSelector((state: any) => state.globalReducer)
    const [showMakeTransaction, setShowMakeTransaction] = useState<boolean>(false)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [transactionTitle, setTransactionTitle] = useState<string>("Deposito")
    const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);


    const cards = [
        {
            logo: "https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png",
            brand: 'MasterCard',
            bankName: "Banco Popular",
            last4Digits: "2180"
        }
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

    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction.to.user.id === user.id

        const data = {
            icon: isFromMe ? "arrowdown" : "arrowup",
            isFromMe: !isFromMe,
            profileImageUrl: isFromMe ? user.profileImageUrl : transaction.to.user.profileImageUrl,
            amount: transaction.amount,
            fullName: isFromMe ? user.fullName : transaction.to.user.fullName,
            username: isFromMe ? user.username : transaction.to.user.username
        }

        return data
    }


    const onSelectTransaction = async (transaction: any) => {
        try {
            console.log(transaction);
            const data = {
                id: transaction.id,
                fullName: formatTransaction(transaction).fullName,
                profileImageUrl: formatTransaction(transaction).profileImageUrl,
                username: formatTransaction(transaction).username,
                isFromMe: formatTransaction(transaction).isFromMe,
                amount: transaction.amount,
                createdAt: transaction.createdAt
            }
            console.log(data);
            
            await dispatch(transactionActions.setTransaction(data))
            setShowSingleTransaction(true)
            
        } catch (error) {
            console.log(error);
            
        }
    }

    const onCloseFinishSingleTransaction = () => {
        setShowSingleTransaction(false)
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
                        <Heading underline size={"xs"} color={colors.pureGray}>Ver todas</Heading>
                    </Pressable>
                </HStack>
                <FlatList
                    horizontal
                    mt={"15px"}
                    data={[cards[0], ...cards]}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    renderItem={({ item, index }) => (
                        index === 0 ? (
                            <VStack mt={"10px"} mr={"10px"} justifyContent={"center"} alignItems={"center"}>
                                <Pressable _pressed={{ opacity: 0.5 }} bg={colors.lightGray} borderRadius={100} width={"70px"} height={"70px"} alignItems={"center"} justifyContent={"center"} onPress={() => { }}>
                                    <AntDesign name="pluscircle" size={24} color="white" />
                                </Pressable>
                            </VStack>
                        ) : (
                            <Pressable onPress={() => onPressCard(item)} key={`card-${index}-${item.last4Digits}`} _pressed={{ opacity: 0.5 }} flexDirection={"row"} px={"15px"} py={"10px"} borderRadius={10} bg={colors.lightGray} mt={"10px"} mr={"10px"} alignItems={"center"}>
                                <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={{ uri: item.logo }} />
                                <VStack ml={"10px"}>
                                    <Heading fontSize={scale(15)} color={colors.white}>{item.brand} {item.last4Digits}</Heading>
                                    <Text fontSize={scale(15)} color={colors.pureGray}>{item.bankName}</Text>
                                </VStack>
                            </Pressable>
                        )
                    )}
                />
            </VStack>
            <VStack mt={"40px"}>
                <HStack justifyContent={"space-between"} alignItems={"center"}>
                    <Heading size={"lg"} color={colors.white}>Transacciones</Heading>
                    <Pressable _pressed={{ opacity: 0.5 }} onPress={() => { }}>
                        <Heading underline size={"xs"} color={colors.pureGray}>Ver todas</Heading>
                    </Pressable>
                </HStack>
                <FlatList
                    mt={"20px"}
                    data={transactionsMocks}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={() => { }} />}
                    renderItem={({ item, index }) => (
                        <Pressable _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(item)} mb={"25px"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} >
                            <HStack >
                                <HStack w={"50px"} h={"50px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                                    <AntDesign name={formatTransaction(item).icon as any} size={24} color={formatTransaction(item).isFromMe ? colors.mainGreen : colors.red} />
                                </HStack>
                                <VStack ml={"10px"}>
                                    <Heading textTransform={"capitalize"} fontSize={scale(15)} color={colors.white}>{formatTransaction(item).fullName}</Heading>
                                    <Text fontSize={scale(15)} color={colors.pureGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
                                </VStack>
                            </HStack>
                            <Heading fontSize={scale(15)} color={formatTransaction(item).isFromMe ? colors.mainGreen : colors.red} >{formatTransaction(item).isFromMe ? "+" : "-"}{FORMAT_CURRENCY(item.amount)}</Heading>

                        </Pressable>
                    )}
                />
            </VStack>
            <BottomSheet openTime={300} height={height} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
                <SingleTransactionScreen onClose={onCloseFinishSingleTransaction} />
            </BottomSheet>
            <DepositOrWithdrawTransaction title={transactionTitle} onCloseFinish={handleCloseMakeTransaction} open={showMakeTransaction} />
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
        </VStack>
    )
}

export default BankingScreen