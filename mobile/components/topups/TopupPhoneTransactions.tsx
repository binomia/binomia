import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import moment from 'moment';
import TransactionSkeleton from '@/components/transaction/transactionSkeleton';
import { Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Spinner, Pressable, ScrollView, Avatar } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { noTransactions } from '@/assets';
import { router, useNavigation } from 'expo-router';

type Props = {
    showNewTransaction?: boolean;
}

const { height } = Dimensions.get('window')
const TopupPhoneTransactions: React.FC<Props> = ({ showNewTransaction = true }: Props) => {
    const dispatch = useDispatch()
    const { user } = useSelector((state: any) => state.accountReducer)
    const { hasNewTransaction } = useSelector((state: any) => state.topupReducer)
    const isFocused = useNavigation().isFocused()

    const [accountTransactions, { refetch: refetchAccountTransactions }] = useLazyQuery(TransactionApolloQueries.accountTransactions())
    const [searchAccountTransactions] = useLazyQuery(TransactionApolloQueries.searchAccountTransactions())

    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [isBottom, setIsBottom] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const handleSearch = async (value: string) => {
        try {
            if (value === "") {
                setFilteredTransactions(transactions)

            } else {
                const { data } = await searchAccountTransactions({
                    variables: {
                        "page": 1,
                        "pageSize": 10,
                        "fullName": value.toLowerCase()
                    }
                })

                setFilteredTransactions(data.searchAccountTransactions.length > 0 ? data.searchAccountTransactions : [])
            }

        } catch (error) {
            console.log(error)
        }
    }

    const formatTransaction = (transaction: any) => {
        const { transactionType, status } = transaction
        const isFromMe = transaction.from.user?.id === user.id

        const profileImageUrl = isFromMe ? transaction.to.user?.profileImageUrl : transaction.from.user?.profileImageUrl
        const fullName = isFromMe ? transaction.to.user?.fullName : transaction.from.user?.fullName
        const username = isFromMe ? transaction.from.user?.username : transaction.to.user?.username
        const showPayButton = transaction.transactionType === "request" && !isFromMe && transaction.status === "requested"
        const showMap = (transaction.transactionType === "request" && isFromMe) || (transaction.transactionType === "transfer" && !isFromMe) ? false : true

        let amountColor;

        if ((transactionType === "request" && isFromMe && status === "requested")) {
            amountColor = colors.pureGray

        } else if ((transaction.transactionType === "request" && isFromMe || transaction.transactionType === "transfer" && !isFromMe) && transaction.status !== "cancelled") {
            amountColor = colors.mainGreen

        } else {
            amountColor = colors.red
        }

        return {
            isFromMe,
            showMap,
            amountColor,
            profileImageUrl: profileImageUrl || "",
            amount: transaction.amount,
            showPayButton,
            fullName: fullName || "",
            username: username || ""
        }
    }

    const fetchAccountTransactions = async (page: number = 1, pageSize: number = showNewTransaction ? 20 : 10) => {
        try {
            const { data } = await accountTransactions({
                variables: {
                    "page": page,
                    "pageSize": pageSize
                }
            })

            setTransactions(data.accountTransactions)
            setFilteredTransactions(data.accountTransactions)
            setIsLoading(false)

        } catch (error) {
            console.error(error)
        }
    }


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAccountTransactions()
        setRefreshing(false);
    }, []);

    const onScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // Adjust the threshold as needed

        setIsBottom(isAtBottom);
    }


    useEffect(() => {
        (async () => {
            if (hasNewTransaction) {
                await fetchAccountTransactions()
                await dispatch(transactionActions.setHasNewTransaction(false))
            }
        })()

    }, [isFocused, hasNewTransaction])

    useEffect(() => {
        setIsLoading(true)
        fetchAccountTransactions()
    }, [])

    useEffect(() => {
        (async () => {
            if (isBottom && transactions.length >= 10 && showNewTransaction) {
                try {
                    setIsLoadingMore(true)

                    const { data } = await refetchAccountTransactions({ page: page + 1, pageSize: 20 })

                    if (data.accountTransactions.length > 0) {
                        setPage(page + 1)
                        setTransactions([...transactions, ...data.accountTransactions])
                    }

                    setIsLoadingMore(false)

                } catch (error) {
                    console.log(error);
                }
            }
        })()

    }, [isBottom])

    return (
        isLoading ? <TransactionSkeleton /> : (
            <VStack flex={1} pt={"20px"} bg={colors.darkGray}>
                {showNewTransaction ? <VStack px={"20px"} w={"100%"} alignItems={"center"}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <Input h={"50px"} w={"100%"} placeholder='Buscar...' onChangeText={(value) => handleSearch(value.toLowerCase())} />
                    </TouchableWithoutFeedback >
                </VStack> : null}
                <ScrollView onScroll={onScroll} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 80 }}>
                    {filteredTransactions.length > 0 ?
                        <VStack w={"100%"} >
                            <HStack w={"100%"} justifyContent={"space-between"}>
                                <Heading px={showNewTransaction ? "20px" : "0px"} fontSize={scale(20)} color={"white"}>{"Transacciones"}</Heading>
                                {!showNewTransaction ? <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("/transactions")}>
                                    <Heading px={showNewTransaction ? "20px" : "0px"} underline fontSize={scale(17)} color={colors.pureGray}>{"Ver más"}</Heading>
                                </Pressable> : null}
                            </HStack>
                            <FlatList
                                px={showNewTransaction ? "20px" : "0px"}
                                mt={"10px"}
                                scrollEnabled={false}
                                data={transactions}
                                renderItem={({ item, index }: any) => (
                                    <TouchableOpacity key={`transactions(tgrtgnrhbfhrbgr)-${item.transactionId}-${index}-${item.transactionId}`} onPress={() => { }}>
                                        <HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
                                            <HStack>
                                                {formatTransaction(item).profileImageUrl ?
                                                    <Image borderRadius={100} resizeMode='contain' alt='logo-image-transactions' w={scale(40)} h={scale(40)} source={{ uri: formatTransaction(item).profileImageUrl }} />
                                                    :
                                                    <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(formatTransaction(item).fullName || "")}>
                                                        <Heading size={"sm"} color={colors.white}>
                                                            {EXTRACT_FIRST_LAST_INITIALS(formatTransaction(item).fullName || "0")}
                                                        </Heading>
                                                    </Avatar>
                                                }
                                                <VStack ml={"10px"} justifyContent={"center"}>
                                                    <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(formatTransaction(item).fullName || "")}</Heading>
                                                    <Text fontSize={scale(10)} color={colors.lightSkyGray}>{moment(Number(item.createdAt)).format("lll")}</Text>
                                                </VStack>
                                            </HStack>
                                            <VStack ml={"10px"} justifyContent={"center"}>
                                                {formatTransaction(item).showPayButton ?
                                                    <HStack space={1} w={"120px"} h={"40px"} bg={colors.mainGreen} borderRadius={25} color='white' justifyContent={"center"} alignItems={"center"}>
                                                        <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>Pagar</Heading>
                                                        <Text fontWeight={"semibold"} fontSize={scale(10)} color={colors.white}>{FORMAT_CURRENCY(formatTransaction(item).amount)}</Text>
                                                    </HStack>
                                                    :
                                                    <Heading opacity={item.status === "cancelled" ? 0.5 : 1} textDecorationLine={item.status === "cancelled" ? "line-through" : "none"} fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(13)} color={formatTransaction(item).amountColor}>{FORMAT_CURRENCY(formatTransaction(item).amount)}</Heading>
                                                }
                                            </VStack>
                                        </HStack>
                                    </TouchableOpacity>
                                )}
                            />
                        </VStack>
                        : (
                            <VStack mt={"20px"} w={"100%"} h={height / 3} px={"20px"} justifyContent={"flex-end"} alignItems={"center"}>
                                <Image resizeMode='contain' alt='logo-image-resizeMode' w={"100%"} h={"100%"} source={noTransactions} />
                                <VStack justifyContent={"center"} alignItems={"center"}>
                                    <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                                    <Text fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
                                </VStack>
                            </VStack>
                        )
                    }
                    {isLoadingMore ? <Spinner mt={"10px"} size={"lg"} /> : null}
                </ScrollView>

            </VStack>
        )
    )
}

export default TopupPhoneTransactions
