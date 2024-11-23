import React, { useCallback, useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack, Pressable, Spinner, ScrollView, FlatList } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { useLazyQuery, useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { deleteIcon, editIcon, noTransactions } from '@/assets';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DefaultIcon from 'react-native-default-icon';
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getNextDay, MAKE_FULL_NAME_SHORTEN } from '@/helpers';
import moment from 'moment';
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import { router } from 'expo-router';
import Button from '@/components/global/Button';

type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const DepositOrWithdrawTransaction: React.FC<Props> = ({ onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const ref = useRef<PagerView>(null);

    const [getAccountRecurrentTransactions] = useLazyQuery(TransactionApolloQueries.accountRecurrentTransactions())
    const [deleteRecurrentTransactions] = useMutation(TransactionApolloQueries.deleteRecurrentTransactions())

    const [visible, setVisible] = useState<boolean>(false);
    const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(height * 0.45);
    const [recurrence, setRecurrence] = useState<string>("weekly");
    const [startDeleting, setStartDeleting] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([])
    const [transaction, setTransaction] = useState<any>({})


    const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchAccountRecurrentTransactions = async (page: number = 1, pageSize: number = 10) => {
        try {
            const { data } = await getAccountRecurrentTransactions({
                variables: {
                    page,
                    pageSize
                }
            })

            setTransactions(data.accountRecurrentTransactions)

        } catch (error) {

        }
    }


    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
        setBottomSheetHeight(height * 0.45)
        ref.current?.setPage(0)
        router.back()
    }
    const onBottomSheetCloseFinish = async () => {
        setVisible(false)
        setTransaction({})

        await delay(500)
        setBottomSheetHeight(height * 0.45)
        ref.current?.setPage(0)
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        await fetchAccountRecurrentTransactions()

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const onEdit = () => {
        setBottomSheetHeight(height * 0.7)
        ref.current?.setPage(1)
    }

    const onRecurrenceChange = (value: string) => {
        setRecurrence(value)
    }

    const onSave = async () => {
        onBottomSheetCloseFinish()
    }

    const onSelectTransaction = async (transaction: any) => {
        setTransaction({
            repeatJobKey: transaction.repeatJobKey,
            fullName: transaction.receiver.user.fullName,
            amount: transaction.amount,
            jobName: transaction.jobName
        })
        setVisible(true)
    }

    const onDelete = async () => {
        try {
            setStartDeleting(true)
            const { repeatJobKey } = transaction
            if (!repeatJobKey) return

            await deleteRecurrentTransactions({
                variables: {
                    repeatJobKey
                }
            })

            await onRefresh()
            setVisible(false)
            setStartDeleting(false)

        } catch (error) {
            console.error({ onDelete: error });
        }
    }

    useEffect(() => {
        fetchAccountRecurrentTransactions()
    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <HStack px={"10px"} mt={"3px"} alignItems={"center"} justifyContent={"space-between"}>
                <Stack w={"30px"}>
                    <TouchableOpacity onPress={() => handleOnClose()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="white" />
                    </TouchableOpacity>
                </Stack>
                <Text fontSize={"17px"} fontWeight={"550"} color={"white"}>Recurrentes</Text>
                <Heading w={"30px"} />
            </HStack>
            <ScrollView px={"20px"} w={"100%"} h={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {transactions.length > 0 ? (
                    <VStack>
                        <Heading fontSize={scale(20)} mt={"50px"} fontWeight={"500"} color={"white"}>Transacciones</Heading>
                        <FlatList
                            data={transactions}
                            mt={"20px"}
                            renderItem={({ item, index }) => (
                                <Pressable key={`${item.repeatJobKey}-${index}`} onPress={() => onSelectTransaction(item)} my={"10px"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} justifyContent={"space-between"}>
                                    <HStack>
                                        <DefaultIcon
                                            value={item.receiver.user.fullName}
                                            contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item.receiver.user.fullName) }]}
                                            textStyle={styles.textStyle}
                                        />
                                        <VStack ml={"10px"} justifyContent={"center"}>
                                            <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(item.receiver.user.fullName)}</Heading>
                                            <Text fontSize={scale(12)} color={colors.lightSkyGray}>Proximo: {moment(getNextDay(item.jobName)).format("ll")}</Text>
                                        </VStack>
                                    </HStack>
                                    <VStack ml={"10px"} justifyContent={"center"}>
                                        <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{"+"}{FORMAT_CURRENCY(item.amount)}</Heading>
                                    </VStack>
                                </Pressable>
                            )}
                        />
                    </VStack>

                ) : (
                    <VStack w={"100%"} h={"100%"} mt={"50px"} px={"20px"}>
                        <Image resizeMode='contain' alt='logo-image' w={"100%"} h={"100%"} source={noTransactions} />
                        <VStack justifyContent={"center"} alignItems={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                            <Text textAlign={"center"} fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
                        </VStack>
                        <Pressable onPress={() => router.navigate("user")} mt={"20px"} _pressed={{ opacity: 0.5 }} justifyContent={"center"} alignItems={"center"} >
                            <Ionicons name="add-circle" style={{ fontSize: scale(70) }} color={colors.mainGreen} />
                        </Pressable>
                    </VStack>
                )}
            </ScrollView>
            <BottomSheet onCloseFinish={onBottomSheetCloseFinish} height={bottomSheetHeight} open={visible}>
                <HStack p={"20px"} justifyContent={"space-between"}>
                    <HStack>
                        <DefaultIcon
                            value={transaction.fullName}
                            contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction.fullName ?? "") }]}
                            textStyle={styles.textStyle}
                        />
                        <VStack ml={"10px"} justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction.fullName ?? "")}</Heading>
                            <Text fontSize={scale(12)} color={colors.lightSkyGray}>Proximo: {moment(getNextDay(transaction.jobName)).format("ll")}</Text>
                        </VStack>
                    </HStack>
                    <VStack ml={"10px"} justifyContent={"center"}>
                        <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{"+"}{FORMAT_CURRENCY(transaction.amount)}</Heading>
                    </VStack>
                </HStack>
                <PagerView style={{ flex: 1 }} ref={ref} initialPage={0} onPageSelected={() => { }}>
                    <HStack key={"Recurrente-1"} p={"20px"} borderRadius={10} w={"100%"} space={2} justifyContent={"space-between"}>
                        <Pressable onPress={onDelete} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(120)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            {startDeleting ?
                                <Spinner color={"red"} size={"lg"} /> :
                                <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={deleteIcon} />
                            }
                            <Heading mt={"5px"} fontWeight={"600"} fontSize={scale(14)} color={colors.red}>Eliminar</Heading>
                        </Pressable>
                        <Pressable onPress={onEdit} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(120)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={editIcon} />
                            <Heading fontSize={scale(14)} mt={"5px"} color={colors.mainGreen}>Editar</Heading>
                        </Pressable>
                    </HStack>
                    <VStack p={"20px"} w={"100%"} key={"Recurrente-2"} justifyContent={"space-between"}>
                        <VStack>
                            <Heading fontSize={scale(20)} mt={"20px"} fontWeight={"500"} color={"white"}>Envió Recurrente</Heading>
                            <HStack mt={"20px"} justifyContent={"space-between"}>
                                <Pressable onPress={() => onRecurrenceChange("weekly")} opacity={recurrence === "weekly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "weekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "weekly" ? colors.white : colors.mainGreen}>Semanal</Heading>
                                </Pressable>
                                <Pressable onPress={() => onRecurrenceChange("biweekly")} opacity={recurrence === "biweekly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "biweekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "biweekly" ? colors.white : colors.mainGreen}>Quincenal</Heading>
                                </Pressable>
                            </HStack>
                            <HStack mt={"20px"} justifyContent={"space-between"}>
                                <Pressable onPress={() => onRecurrenceChange("monthly")} opacity={recurrence === "monthly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "monthly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "monthly" ? colors.white : colors.mainGreen}>Mensual</Heading>
                                </Pressable>
                            </HStack>
                        </VStack>
                        <HStack mb={"35px"} justifyContent={"center"}>
                            <Button onPress={onSave} w={"60%"} background={colors.mainGreen} title={"Guardar"} />
                        </HStack>
                    </VStack>
                </PagerView>
            </BottomSheet>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: scale(50),
        height: scale(50),
        borderRadius: 100
    },
    textStyle: {
        fontSize: 30,
        color: 'white',
        marginBottom: 2,
        textTransform: 'capitalize',
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    ScrollView: {
        flexDirection: "row",
        alignItems: "center",
        // height: 100,
        marginTop: 15,
        marginBottom: 40
    }
})

export default DepositOrWithdrawTransaction