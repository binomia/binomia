import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import AntDesign from '@expo/vector-icons/AntDesign';
import BottomSheet from '@/components/global/BottomSheet'
import Cards from '@/components/cards'
import CardModification from '@/components/cards/CardModification'
import SingleTransactionBanking from '@/components/transaction/SingleBankingTransaction'
import DepositOrWithdrawTransaction from '@/components/banking/deposit'
import { VStack, Text, HStack, FlatList, Heading, Image, Pressable, ScrollView } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { cashIn, cashout, noTransactions } from '@/assets'
import { FORMAT_CREATED_DATE, FORMAT_CURRENCY } from '@/helpers'
import { Alert, Dimensions, RefreshControl } from 'react-native'
import { transactionActions } from '@/redux/slices/transactionSlice'
import { router, useNavigation } from 'expo-router'
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery'
import { useLazyQuery, useMutation } from '@apollo/client'
import { TransactionAuthSchema } from '@/auth/transactionAuth'
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication'
import { accountActions } from '@/redux/slices/accountSlice';
import { fetchAccountBankingTransactions } from '@/redux/fetchHelper';
import { AccountApolloQueries } from '@/apollo/query';


const { height, width } = Dimensions.get('window')
const BankingScreen: React.FC = () => {
    const dispatch = useDispatch()
    const { authenticate } = useLocalAuthentication()
    const { location } = useSelector((state: any) => state.globalReducer)
    const { user, cards, card, limits, account, } = useSelector((state: any) => state.accountReducer)
    const { bankingTransactions } = useSelector((state: any) => state.transactionReducer)
    const [showAllCards, setShowAllCards] = useState<boolean>(false)
    const [showCardModification, setShowCardModification] = useState<boolean>(false)
    const [transactions, setTransactions] = useState<any[]>(bankingTransactions)

    const isFocused = useNavigation().isFocused()

    const [createBankingTransaction] = useMutation(TransactionApolloQueries.createBankingTransaction())
    const [accountStatus] = useLazyQuery(AccountApolloQueries.accountStatus())
    const [fetchAccount] = useLazyQuery(AccountApolloQueries.account())

    const [refreshing, setRefreshing] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showSingleTransaction, setShowSingleTransaction] = useState(false);
    const [enableDeposit, setEnableDeposit] = useState(false);
    const [enableWithdraw, setEnableWithdraw] = useState(false);

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

            setTransactions([data.createBankingTransaction, ...bankingTransactions])

            const newBalance = transactionType === "deposit" ? account.balance + amount : account.balance - amount
            await Promise.all([
                dispatch(accountActions.setAccount(Object.assign({}, account, { balance: newBalance }))),

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

    const handleMakeTransaction = async (title: string) => {
        const { data } = await accountStatus()
        if (data.account.status === "flagged") {
            router.navigate(`/flagged`)
            return
        }

        if (title === "Deposito" && enableDeposit) {
            Alert.alert(
                'Limite Alcanzado',
                'Su limite de deposito diario ha sido alcanzado. Por favor, espere hasta el siguiente dia para realizar un nuevo deposito'
            )
            return
        }

        if (title === "Retiro" && enableWithdraw) {
            Alert.alert(
                'Limite Alcanzado',
                'Su limite de retiro diario ha sido alcanzado. Por favor, espere hasta el siguiente dia para realizar un nuevo retiro'
            )
            return
        }

        if (cards.length > 0) {
            const primaryCard = cards.find((card: any) => card.isPrimary)
            await dispatch(accountActions.setCard(primaryCard))

            if (title === "Deposito")
                setShowDeposit(true)

            else
                setShowWithdraw(true)

        } else
            setShowAllCards(true)
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

            await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, data)))
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
        await dispatch(fetchAccountBankingTransactions({ page: 1, pageSize: 30 }))

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);


    useEffect(() => {
        if (isFocused) {
            (async () => {
                const { data } = await fetchAccount()
                await dispatch(accountActions.setAccount(data.account))
            })()
        }

    }, [isFocused])

    useEffect(() => {
        setEnableDeposit(limits.depositAmount >= account.depositLimit)
        setEnableWithdraw(limits.withdrawAmount >= account.withdrawLimit)

    }, [limits, account])

    return (
        <VStack variant={"body"} h={"100%"}>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  >
                <HStack borderRadius={10} w={"100%"} mt={"50px"} space={2} justifyContent={"space-between"}>
                    <Pressable disabled={!account.allowDeposit || account.status !== "active"} opacity={account.allowDeposit && account.status === "active" ? 1 : 0.5} onPress={() => handleMakeTransaction("Deposito")} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(130)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={"50px"} h={"50px"} source={cashIn} />
                        <Heading size={"md"} mt={"10px"} color={colors.white}>Depositar</Heading>
                    </Pressable>
                    <Pressable disabled={!account.allowWithdraw || account.status !== "active"} opacity={account.allowWithdraw && account.status === "active" ? 1 : 0.5} onPress={() => handleMakeTransaction("Retiro")} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(130)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                        <Image alt='logo-image' resizeMode='contain' w={scale(45)} h={scale(45)} source={cashout} />
                        <Heading size={"md"} mt={"10px"} color={!enableWithdraw ? colors.white : colors.gray}>Retirar</Heading>
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
                                                <Text fontSize={scale(12)} color={colors.pureGray}>{FORMAT_CREATED_DATE(item.createdAt)}</Text>
                                            </VStack>
                                        </HStack>
                                        <Heading fontSize={scale(12)} color={formatTransaction(item).isDeposit ? colors.mainGreen : colors.red} >{FORMAT_CURRENCY(item.amount)}</Heading>
                                    </Pressable>
                                )}
                            />
                        </VStack>
                    ) : (
                        <VStack w={"100%"} h={height / 3} pb={"20px"} mt={"50px"} px={"20px"} alignItems={"center"} justifyContent={"flex-end"}>
                            <Image resizeMode='contain' alt='logo-image' w={width / 1.5} h={width / 1.5} source={noTransactions} />
                            <VStack alignItems={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                                <Text textAlign={"center"} fontSize={scale(12)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
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
                <DepositOrWithdrawTransaction showBalance={false} onSendFinish={(amount: number) => onDepositBankingTransaction(amount, "deposit")} />
            </BottomSheet>
            <BottomSheet height={height * 0.9} onCloseFinish={() => setShowWithdraw(false)} open={showWithdraw}>
                <DepositOrWithdrawTransaction title='Retirar' showBalance={true} onSendFinish={(amount: number) => onDepositBankingTransaction(amount, "withdraw")} />
            </BottomSheet>
        </VStack>
    )
}

export default BankingScreen