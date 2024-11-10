import React, { useCallback, useEffect, useState } from 'react'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, ScrollView } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import colors from '@/colors'
import { scale } from 'react-native-size-matters'
import { depositIcon, noTransactions, withdrawIcon } from '@/assets'
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment'
import { FORMAT_CURRENCY } from '@/helpers'
import BottomSheet from '@/components/global/BottomSheet'
import { globalActions } from '@/redux/slices/globalSlice'
import Cards from '@/components/cards'
import CardModification from '@/components/cards/CardModification'
import { Dimensions, RefreshControl } from 'react-native'
import { transactionActions } from '@/redux/slices/transactionSlice'
import { router } from 'expo-router'
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery'
import { useLazyQuery } from '@apollo/client'
import SingleTransactionBanking from '@/components/transaction/SingleBankingTransaction'


const { height } = Dimensions.get('window')
const BankingScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { user, cards } = useSelector((state: any) => state.globalReducer)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<any[]>([])
    const [accountBankingTransactions] = useLazyQuery(TransactionApolloQueries.accountBankingTransactions())
    const [refreshing, setRefreshing] = useState(false);


    const fetchAccountBankingTransactions = async (page: number = 1, pageSize: number = 10) => {
        try {
            const { data } = await accountBankingTransactions({
                variables: { page, pageSize }
            })

            setTransactions(data.accountBankingTransactions)

        } catch (error) {
            console.error({ accountBankingTransactions: error });
        }
    }


    const handleMakeTransaction = async (title: string) => {
        await dispatch(globalActions.setCard(cards[0]))

        router.navigate("/deposit")
    }

    const formatTransaction = (transaction: any) => {
        const isDeposit = transaction.transactionType === "deposit"
        const data = {
            icon: isDeposit ? "arrowup" : "arrowdown",
            isDeposit: isDeposit,
            transactionType: isDeposit ? "Deposito" : "Retiro",
            amount: transaction.amount,
            fullName: user.fullName,
            username: user.username
        }

        return data
    }


    const onSelectTransaction = async (transaction: any) => {
        try {
            console.log(transaction);
            const data = {
                id: transaction.id,
                fullName: formatTransaction(transaction).fullName,
                icon: formatTransaction(transaction).icon,
                username: formatTransaction(transaction).username,
                transactionType: formatTransaction(transaction).transactionType,
                isDeposit: formatTransaction(transaction).isDeposit,
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAccountBankingTransactions().catch(error => console.log(error))

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    useEffect(() => {
        fetchAccountBankingTransactions()
    }, [])



    return (
        <VStack variant={"body"} h={"100%"}>
            <ScrollView showsHorizontalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  >
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
                    {transactions.length <= 0 ? (
                        <VStack key={"transations-screen-no-transactions" + Date.now()} w={"100%"} h={"50%"} mt={"100px"} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
                            <Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
                            <VStack justifyContent={"center"} alignItems={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                                <Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
                            </VStack>
                        </VStack>
                    ) : (
                        <FlatList
                            mt={"20px"}
                            data={transactions}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => (
                                <Pressable key={`transaction-banking-${index}`} _pressed={{ opacity: 0.5 }} onPress={() => onSelectTransaction(item)} mb={"25px"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} >
                                    <HStack >
                                        <HStack w={"50px"} h={"50px"} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                                            <AntDesign name={formatTransaction(item).icon as any} size={24} color={formatTransaction(item).isDeposit ? colors.mainGreen : colors.red} />
                                        </HStack>
                                        <VStack ml={"10px"} justifyContent={"center"}>
                                            <Heading textTransform={"capitalize"} fontSize={scale(13)} color={colors.white}>{formatTransaction(item).fullName}</Heading>
                                            <Text fontSize={scale(12)} color={colors.pureGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
                                        </VStack>
                                    </HStack>
                                    <Heading fontSize={scale(12)} color={formatTransaction(item).isDeposit ? colors.mainGreen : colors.red} >{formatTransaction(item).isDeposit ? "+" : "-"}{FORMAT_CURRENCY(item.amount)}</Heading>
                                </Pressable>
                            )}
                        />
                    )}
                </VStack>
            </ScrollView>
            <BottomSheet openTime={300} height={height * 0.45} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
                <SingleTransactionBanking onClose={onCloseFinishSingleTransaction} />
            </BottomSheet>
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
        </VStack>
    )
}

export default BankingScreen