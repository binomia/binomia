import React, { useCallback, useEffect, useState } from 'react'
import colors from '@/colors'
import TransactionSkeleton from '@/components/transaction/transactionSkeleton';
import Entypo from '@expo/vector-icons/Entypo';
import SingleTopTup from '@/components/topups/SingleTopTup';
import { RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Heading, Image, Text, VStack, FlatList, HStack, Spinner, Pressable, ScrollView } from 'native-base'
import { useLazyQuery } from '@apollo/client'
import { TopUpApolloQueries } from '@/apollo/query'
import { FORMAT_CREATED_DATE, FORMAT_CURRENCY, FORMAT_PHONE_NUMBER } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { router, useNavigation } from 'expo-router';


type Props = {
    showNewTransaction?: boolean;
}

const TopupPhoneTransactions: React.FC<Props> = ({ showNewTransaction = true }: Props) => {
    const dispatch = useDispatch()
    const { topup } = useSelector((state: any) => state.topupReducer)
    const { hasNewTransaction } = useSelector((state: any) => state.transactionReducer)
    const navigation = useNavigation();
    const isFocused = navigation.isFocused()
    const [topUps, { refetch: reFetchTopUps }] = useLazyQuery(TopUpApolloQueries.topUps())

    const [openBottomSheet, setOpenBottomSheet] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [topups, setTopups] = useState<any[]>([])
    const [transaction, setTransaction] = useState<any>({})
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [isBottom, setIsBottom] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);


    const fetchPhoneTopUps = async (page: number = 1, pageSize: number = showNewTransaction ? 20 : 10) => {
        try {
            const { data } = await topUps({
                variables: {
                    phoneId: Number(topup.id),
                    page,
                    pageSize
                }
            })


            // sort txs
            const sortedTxs = data.topUps.sort((a: any, b: any) => {
                const parseDate = (value: any) => {

                    if (!isNaN(Number(value))) {
                        return new Date(Number(value)).getTime();
                    }
                    // otherwise assume ISO string
                    return new Date(value).getTime();
                };

                const ad = parseDate(a.createdAt);
                const bd = parseDate(b.createdAt);

                return bd - ad; // descending (latest first). Use ad - bd for ascending
            });

            setTopups(sortedTxs)
            setIsLoading(false)

        } catch (error) {
            console.error(error)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPhoneTopUps()
        setRefreshing(false);
    }, []);

    const onScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20; // Adjust the threshold as needed

        setIsBottom(isAtBottom);
    }

    const onCloseFinish = async () => {
        setOpenBottomSheet(false)
        setTransaction({})
    }

    const onOpenBottomSheet = async (transaction: any) => {
        setTransaction(transaction)
        setOpenBottomSheet(true)
    }

    useEffect(() => {
        (async () => {

            if (hasNewTransaction) {
                await fetchPhoneTopUps()
                await dispatch(transactionActions.setHasNewTransaction(false))
            }
        })()

    }, [isFocused, hasNewTransaction])

    useEffect(() => {
        setIsLoading(true)
        fetchPhoneTopUps()
    }, [])

    useEffect(() => {
        (async () => {
            if (isBottom && topups.length >= 10 && showNewTransaction) {
                try {
                    setIsLoadingMore(true)

                    const { data } = await reFetchTopUps({ page: page + 1, pageSize: 20 })

                    if (data.accountTransactions.length > 0) {
                        setPage(page + 1)
                        setTopups([...topups, ...data.accountTransactions])
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
            <VStack flex={1} bg={colors.darkGray}>
                <VStack px={"20px"} w={"100%"} alignItems={"center"}>
                    <Image borderRadius={"100px"} w={"70px"} h={"70px"} alt={topup.fullName + "logo"} resizeMode='contain' source={{ uri: topup.company?.logo }} />
                    <Heading mt={"10px"} fontSize={scale(18)} textTransform={"capitalize"} color={colors.white}>{topup.fullName}</Heading>
                    <Text fontSize={scale(14)} color={colors.white}>{FORMAT_PHONE_NUMBER(topup.phone || "")}</Text>
                </VStack>
                <ScrollView mt={"50px"} onScroll={onScroll} flex={1} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 80 }}>
                    <VStack w={"100%"} >
                        <HStack w={"100%"} justifyContent={"space-between"}>
                            <Heading px={showNewTransaction ? "20px" : "0px"} fontSize={scale(20)} color={"white"}>{"Recargas"}</Heading>
                            {!showNewTransaction ? <Pressable _pressed={{ opacity: 0.5 }} onPress={() => router.navigate("/transactions")}>
                                <Heading px={showNewTransaction ? "20px" : "0px"} underline fontSize={scale(17)} color={colors.pureGray}>{"Ver más"}</Heading>
                            </Pressable> : null}
                        </HStack>
                        <FlatList
                            px={showNewTransaction ? "20px" : "0px"}
                            mt={"10px"}
                            scrollEnabled={false}
                            data={topups}
                            renderItem={({ item, index }: any) => (
                                <Pressable bg={colors.lightGray} my={"5px"} borderRadius={10} px={"15px"} py={"10px"} key={`transactions(tgrtgnrhbfhrbgr)-${item.transactionId}-${index}-${item.transactionId}`} onPress={() => onOpenBottomSheet(item)}>
                                    <HStack alignItems={"center"} justifyContent={"space-between"} my={"10px"} borderRadius={10}>
                                        <HStack alignItems={"center"}>
                                            <HStack w={scale(40)} h={scale(40)} bg={colors.darkGray} alignItems={"center"} justifyContent={"center"} borderRadius={100}>
                                                <Entypo name="phone" size={24} color={colors.mainGreen} />
                                            </HStack>
                                            <VStack ml={"10px"} justifyContent={"center"}>
                                                <Heading textTransform={"capitalize"} fontSize={scale(13)} color={"white"}>{FORMAT_CURRENCY(item.amount)}</Heading>
                                                <Text fontSize={scale(12)} color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(item?.createdAt)}</Text>
                                            </VStack>
                                        </HStack>
                                    </HStack>
                                </Pressable>
                            )}
                        />
                    </VStack>
                    {isLoadingMore ? <Spinner mt={"10px"} size={"lg"} /> : null}
                </ScrollView>
                {/* <BottomSheet height={height * 0.50} open={openBottomSheet} onCloseFinish={onCloseFinish}>
                    <VStack px={"20px"} pt={"30px"} w={"100%"} h={"80%"} justifyContent={"space-between"}>
                        <HStack alignItems={"center"}>
                            <Image borderRadius={"100px"} w={"55px"} h={"55px"} alt={transaction.fullName + "bottomSheet"} resizeMode='contain' source={{ uri: topup.company?.logo }} />
                            <VStack ml={"10px"} justifyContent={"center"}>
                                <Heading fontSize={scale(16)} color={colors.pureGray} textTransform={"capitalize"}>{topup.fullName}</Heading>
                                <Text fontWeight={"semibold"} fontSize={scale(12)} color={colors.pureGray}>{FORMAT_PHONE_NUMBER(topup.phone || "")}</Text>
                            </VStack>
                        </HStack>
                        <VStack alignItems={"center"} borderRadius={10}>
                            <VStack alignItems={"center"}>
                                <Heading textTransform={"capitalize"} fontSize={scale(TEXT_HEADING_FONT_SIZE)} color={colors.red}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
                                <Text mb={"10px"} color={colors.lightSkyGray}>{moment(Number(transaction?.createdAt)).format("lll")}</Text>
                                <HStack mb={"20px"} ml={"10px"} alignItems={"center"} justifyContent={"center"}>
                                    <StatuIcon status={transaction.status} />
                                    <Text ml={"3px"} fontSize={scale(16)} color={colors.lightSkyGray}>{transactionStatus(transaction.status)}</Text>
                                </HStack>
                                <Pressable onPress={handleShare} _pressed={{ opacity: 0.5 }} w={scale(55)} h={scale(55)} shadow={1} borderWidth={0.4} borderColor={colors.placeholder} alignItems={"center"} justifyContent={"center"} borderRadius={100} bg={colors.lightGray}>
                                    <Entypo name="share" size={24} color="white" />
                                </Pressable>
                            </VStack>
                        </VStack>
                    </VStack>
                </BottomSheet> */}
                <SingleTopTup open={openBottomSheet} onClose={onCloseFinish} topup={transaction} />
            </VStack>
        )
    )
}

export default TopupPhoneTransactions
