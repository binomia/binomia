import React, { useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, ScrollView } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { depositIcon, withdrawIcon } from '@/assets'
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment'
import { FORMAT_CURRENCY } from '@/helpers'
import BottomSheet from '@/components/global/BottomSheet'
import SingleTransaction from '@/components/transaction/SingleTransaction'
import { globalActions } from '@/redux/slices/globalSlice'
import Cards from '@/components/cards'
import CardModification from '@/components/cards/CardModification'
import { Dimensions, RefreshControl } from 'react-native'
import { transactionActions } from '@/redux/slices/transactionSlice'
import { transactionsMocks } from '@/mocks'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import DepositOrWithdrawTransaction from '@/components/transaction/DepositOrWithdrawTransaction'


const { height } = Dimensions.get('window')
const BankingScreen: React.FC = () => {
    const navigation = useNavigation<any>()
    const dispatch = useDispatch()
    const { user } = useSelector((state: any) => state.globalReducer)
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


    const handleMakeTransaction = async (title: string) => {
        setTransactionTitle(title)

        await dispatch(globalActions.setCard(cards[0]))
        router.navigate("/deposit")
        // setShowMakeTransaction(true)
    }

    const handleCloseMakeTransaction = async () => {
        await dispatch(globalActions.setCard({}))
        setShowMakeTransaction(false)
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
            <ScrollView showsHorizontalScrollIndicator={false} refreshControl={<RefreshControl refreshing={false} onRefresh={() => { }} />}  >
                <HStack borderRadius={10} w={"100%"} mt={"50px"} space={2} justifyContent={"space-between"}>
                    <Pressable onPress={() => handleMakeTransaction("Deposito")} _pressed={{ opacity: 0.5 }} w={"48%"} h={"150px"} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={depositIcon} />
                        <Heading size={"md"} color={colors.mainGreen}>Depositar</Heading>
                    </Pressable>
                    <Pressable onPress={() => handleMakeTransaction("Retiro")} _pressed={{ opacity: 0.5 }} w={"48%"} h={"150px"} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' tintColor={colors.mainGreen} w={scale(45)} h={scale(45)} source={withdrawIcon} />
                        <Heading size={"md"} color={colors.mainGreen}>Retirar</Heading>
                    </Pressable>
                </HStack>
                <VStack mt={"40px"}>
                    <Heading fontSize={scale(19)} color={colors.white}>Transacciones</Heading>
                    <FlatList
                        mt={"20px"}
                        data={transactionsMocks}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <Pressable key={`transaction-banking-${index}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(item)} mb={"25px"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} >
                                <HStack >
                                    <HStack w={"50px"} h={"50px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                                        <AntDesign name={formatTransaction(item).icon as any} size={24} color={formatTransaction(item).isFromMe ? colors.mainGreen : colors.red} />
                                    </HStack>
                                    <VStack ml={"10px"} justifyContent={"center"}>
                                        <Heading textTransform={"capitalize"} fontSize={scale(13)} color={colors.white}>{formatTransaction(item).fullName}</Heading>
                                        <Text fontSize={scale(12)} color={colors.pureGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
                                    </VStack>
                                </HStack>
                                <Heading fontSize={scale(12)} color={formatTransaction(item).isFromMe ? colors.mainGreen : colors.red} >{formatTransaction(item).isFromMe ? "+" : "-"}{FORMAT_CURRENCY(item.amount)}</Heading>
                            </Pressable>
                        )}
                    />
                </VStack>
            </ScrollView>
            <BottomSheet openTime={300} height={height} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
                <SingleTransaction onClose={onCloseFinishSingleTransaction} />
            </BottomSheet>
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
        </VStack>
    )
}

export default BankingScreen