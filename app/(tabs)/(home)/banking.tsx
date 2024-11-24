import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import AntDesign from '@expo/vector-icons/AntDesign';
import moment from 'moment'
import BottomSheet from '@/components/global/BottomSheet'
import Cards from '@/components/cards'
import CardModification from '@/components/cards/CardModification'
import SingleTransactionBanking from '@/components/transaction/SingleBankingTransaction'
import DepositOrWithdrawTransaction from '@/components/banking/deposit'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, ScrollView } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { depositIcon, noTransactions, withdrawIcon } from '@/assets'
import { FORMAT_CURRENCY } from '@/helpers'
import { globalActions } from '@/redux/slices/globalSlice'
import { Dimensions, RefreshControl } from 'react-native'
import { transactionActions } from '@/redux/slices/transactionSlice'
import { router } from 'expo-router'
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery'
import { useLazyQuery, useMutation } from '@apollo/client'
import { TransactionAuthSchema } from '@/auth/transactionAuth'
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication'


const { height, width } = Dimensions.get('window')
const BankingScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { authenticate } = useLocalAuthentication()
    const { user, cards, card, account, location } = useSelector((state: any) => state.globalReducer)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [transactions, setTransactions] = useState<any[]>([])
    const [accountBankingTransactions] = useLazyQuery(TransactionApolloQueries.accountBankingTransactions())
    const [createBankingTransaction] = useMutation(TransactionApolloQueries.createBankingTransaction())
    const [refreshing, setRefreshing] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showSingleTransaction, setShowSingleTransaction] = useState(false);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const onDepositBankingTransaction = async (amount: number, transactionType: "deposit" | "withdraw") => {
        try {
            const variables = await TransactionAuthSchema.createBankingTransaction.parseAsync({
                cardId: card.id,
                data: {
                    amount,
                    location,
                    currency: account.currency,
                    transactionType
                }
            })

            await authenticate()
            const { data } = await createBankingTransaction({
                variables
            })

            setTransactions([data.createBankingTransaction, ...transactions])

            await Promise.all([
                dispatch(globalActions.setAccount(Object.assign({}, account, { balance: account.balance + amount }))),

            ]).then(async () => {
                setShowDeposit(false)
                setShowWithdraw(false)
                await delay(1000)

            }).then(async () => {
                await onSelectTransaction(data.createBankingTransaction)
            })

        } catch (errors: any) {
            console.log(errors);
        }
    }

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
        if (cards.length > 0) {
            const primaryCard = cards.find((card: any) => card.isPrimary)
            await dispatch(globalActions.setCard(primaryCard))

            if (title === "Deposito")
                setShowDeposit(true)

            else
                setShowWithdraw(true)

        } else
            router.push("/cards")
    }

    const formatTransaction = (transaction: any) => {
        const isDeposit = transaction.transactionType === "deposit"
        const data = {
            icon: isDeposit ? "arrowup" : "arrowdown",
            isDeposit: isDeposit,
            transactionType: isDeposit ? "Depositado" : "Retirado",
            amount: transaction.amount,
            fullName: user.fullName,
            username: user.username,
        }        

        return data
    }

    const onSelectTransaction = async (transaction: any) => {
        try {
            const data = {
                id: transaction.id,
                fullName: formatTransaction(transaction).fullName,
                icon: formatTransaction(transaction).icon,
                username: formatTransaction(transaction).username,
                transactionType: formatTransaction(transaction).transactionType,
                isDeposit: formatTransaction(transaction).isDeposit,
                amount: transaction.amount,
                createdAt: transaction.createdAt,
                card: {
                    brand: transaction.card.brand,
                    last4Number: transaction.card.last4Number,
                    alias: transaction.card.alias
                }
            }

            await dispatch(transactionActions.setTransaction(data))
            setShowSingleTransaction(true)

        } catch (error) {
            console.log(error);

        }
    }

    const onCloseFinishSingleTransaction = async () => {
        setShowSingleTransaction(false)

        await dispatch(transactionActions.setTransaction({}))
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
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  >
                <HStack borderRadius={10} w={"100%"} mt={"50px"} space={2} justifyContent={"space-between"}>
                    <Pressable onPress={() => handleMakeTransaction("Deposito")} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(130)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={depositIcon} />
                        <Heading size={"md"} color={colors.mainGreen}>Depositar</Heading>
                    </Pressable>
                    <Pressable onPress={() => handleMakeTransaction("Retiro")} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(130)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' tintColor={colors.mainGreen} w={scale(45)} h={scale(45)} source={withdrawIcon} />
                        <Heading size={"md"} color={colors.mainGreen}>Retirar</Heading>
                    </Pressable>
                </HStack>
                <VStack mt={"30px"}>
                    {transactions.length > 0 ? (
                        <VStack>
                            <Heading fontSize={scale(19)} color={colors.white}>Transacciones</Heading>
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
                                                <Heading textTransform={"capitalize"} fontSize={scale(13)} color={colors.white}>{formatTransaction(item).transactionType}</Heading>
                                                <Text fontSize={scale(12)} color={colors.pureGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
                                            </VStack>
                                        </HStack>
                                        <Heading fontSize={scale(12)} color={formatTransaction(item).isDeposit ? colors.mainGreen : colors.red} >{formatTransaction(item).isDeposit ? "+" : "-"}{FORMAT_CURRENCY(item.amount)}</Heading>
                                    </Pressable>
                                )}
                            />
                        </VStack>
                    ) : (
                        <VStack w={"100%"} h={height / 3} mt={"50px"} px={"20px"} alignItems={"center"} justifyContent={"flex-end"}>
                            <Image resizeMode='contain' alt='logo-image' w={width / 1.5} h={width / 1.5} source={noTransactions} />
                            <VStack alignItems={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                                <Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
                            </VStack>
                        </VStack>
                    )}
                </VStack>
            </ScrollView>
            <BottomSheet openTime={300} height={height * 0.5} onCloseFinish={onCloseFinishSingleTransaction} open={showSingleTransaction}>
                <SingleTransactionBanking onClose={onCloseFinishSingleTransaction} />
            </BottomSheet>
            <Cards onCloseFinish={() => setShowAllCards(false)} open={showAllCards} />
            <CardModification onCloseFinish={() => setShowCardModification(false)} open={showCardModification} />
            <BottomSheet height={height * 0.9} onCloseFinish={() => setShowDeposit(false)} open={showDeposit}>
                <DepositOrWithdrawTransaction onSendFinish={(amount: number) => onDepositBankingTransaction(amount, "deposit")} />
            </BottomSheet>
            <BottomSheet height={height * 0.9} onCloseFinish={() => setShowWithdraw(false)} open={showWithdraw}>
                <DepositOrWithdrawTransaction title='Retirar' onSendFinish={(amount: number) => onDepositBankingTransaction(amount, "withdraw")} />
            </BottomSheet>
        </VStack>
    )
}

export default BankingScreen