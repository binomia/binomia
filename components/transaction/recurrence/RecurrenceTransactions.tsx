import React, { useCallback, useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import moment from 'moment';
import BottomSheet from '@/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import Button from '@/components/global/Button';
import { Dimensions, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, Spinner, ScrollView, FlatList, Avatar } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useLazyQuery, useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { deleteIcon, editIcon, noTransactions } from '@/assets';
import { Entypo } from '@expo/vector-icons';
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getNextBiWeeklyDate, getNextDay, getSpecificDayOfMonth, MAKE_FULL_NAME_SHORTEN } from '@/helpers';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recurenceMonthlyData, recurenceWeeklyData, getTitleById } from '@/mocks';
import { WeeklyQueueTitleType } from '@/types';

type Props = {
    title?: string
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height, width } = Dimensions.get('window')
const RecurrenceTransactions: React.FC<Props> = ({ open = false, onCloseFinish = () => { } }) => {
    const ref = useRef<PagerView>(null);

    const [getAccountRecurrentTransactions] = useLazyQuery(TransactionApolloQueries.accountRecurrentTransactions())
    const [deleteRecurrentTransactions] = useMutation(TransactionApolloQueries.deleteRecurrentTransactions())
    const [updateRecurrentTransactions] = useMutation(TransactionApolloQueries.updateRecurrentTransactions())

    const [visible, setVisible] = useState<boolean>(false);
    const [recurrence, setRecurrence] = useState<string>("");
    const [startDeleting, setStartDeleting] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([])
    const [transaction, setTransaction] = useState<any>({})

    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [recurrenceOptionSelected, setRecurrenceOptionSelected] = useState<string>("");
    const [recurrenceDayOptionSelected, setRecurrenceDayOptionSelected] = useState<string>("");
    const [spin, setSpin] = useState<boolean>(false)
    const [cancelSpin, setCancelSpin] = useState<boolean>(false)
    const [enableSaveButton, setEnableSaveButton] = useState<boolean>(false)
    const [isEdited, setIsEdited] = useState<boolean>(false)
    const [recurrenceBiweeklyOptionSelected, setRecurrenceBiweeklyOptionSelected] = useState<string>("");

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

        } catch (error: any) {
            console.error({ fetchAccountRecurrentTransactions: error });
        }
    }

    const onBottomSheetCloseFinish = async () => {
        setVisible(false)
        await delay(500)
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        await fetchAccountRecurrentTransactions()

        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, [])

    const onEdit = () => {
        ref.current?.setPage(1)
        setVisible(false)
    }

    const onSave = async () => {
        try {
            setSpin(true)
            if (recurrence && recurrenceDaySelected) {
                await updateRecurrentTransactions({
                    variables: {
                        data: {
                            repeatJobKey: transaction.jobId,
                            queueType: transaction.queueType,
                            jobName: recurrence,
                            jobTime: recurrenceDaySelected
                        }
                    }
                })

                await onRefresh()
                ref.current?.setPage(0)
                setVisible(false)
                setSpin(false)
                setTransaction({})
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setVisible(false)
            setSpin(false)
            setTransaction({})
        }
    }

    const handleDefualtJobName = (jobName: string, jobTime: string) => {
        switch (jobName) {
            case "weekly":
                return getTitleById(jobTime, recurenceWeeklyData)

            case "monthly":
                return getTitleById(jobTime, recurenceMonthlyData)

            case "biweekly":
                return "Cada 1 y 16 de cada mes";

            default:
                return "";
        }
    }

    const onSelectTransaction = async (transaction: any) => {
        const data = {
            ...transaction,
            profileImageUrl: transaction.referenceData.logo,
            repeatJobKey: transaction.repeatJobKey,
            fullName: transaction.referenceData.fullName,
            amount: transaction.amount,
            jobName: transaction.jobName,
            jobTime: transaction.jobTime
        }

        setTransaction(data)

        console.log(JSON.stringify(data, null, 2));


        const jobName = handleDefualtJobName(transaction.jobName, transaction.jobTime)
        setRecurrenceBiweeklyOptionSelected(jobName)
        setRecurrenceOptionSelected(jobName)
        setRecurrenceDaySelected(transaction.jobTime)

        setRecurrence(transaction.jobName)
        setVisible(true)
    }

    const onDelete = async () => {
        try {
            console.log(JSON.stringify(transaction, null, 2));

            setStartDeleting(true)
            const { jobId, queueType } = transaction
            if (!jobId) return

            await deleteRecurrentTransactions({
                variables: {
                    repeatJobKey: jobId,
                    queueType
                }
            })

            setTransactions(transactions.filter((transaction) => transaction.jobId !== jobId))
            await onRefresh()
            setVisible(false)
            setStartDeleting(false)

        } catch (error) {
            console.error({ onDelete: error });
            setVisible(false)
            setSpin(false)
        }
    }

    const onRecurrenceChange = (value: string) => {
        setRecurrence(value)
        setIsEdited(true)

        if (value === "weekly") {
            ref.current?.setPage(2)
        }

        else if (value === "monthly") {
            ref.current?.setPage(2)

        } else if (value === "biweekly") {
            setRecurrenceBiweeklyOptionSelected("Cada 1 y 16 de cada mes")
            setRecurrenceDaySelected(value)
        }
    }

    const RenderWeeklyOption: React.FC = () => {
        const onSelecteOption = async (id: string, title: string) => {
            setRecurrenceDaySelected(id)
            setRecurrenceOptionSelected(title)

            await delay(300)
            ref.current?.setPage(1)
        }

        return (
            <VStack px={"10px"} w={"100%"}>
                <Heading w={"100%"} mb={"20px"} px={"5px"} textAlign={"left"} fontSize={scale(20)} color={"white"}>Selecciona un día</Heading>

                <FlatList
                    scrollEnabled={false}
                    data={recurenceWeeklyData}
                    renderItem={({ item }) => (
                        <HStack my={"10px"} w={"100%"} justifyContent={"space-between"}>
                            {item?.map(({ title, id }) => (
                                <Pressable w={width * 0.46} key={id} borderRadius={"5px"} justifyContent={"center"} alignItems={"center"} h={scale(45)} bg={recurrenceDaySelected === id ? colors.mainGreen : colors.lightGray} _pressed={{ opacity: 0.5 }} onPress={() => onSelecteOption(id, title)} borderColor={colors.mainGreen}>
                                    <Heading fontSize={scale(12)} fontWeight={"500"} color={recurrenceDaySelected === id ? colors.white : colors.mainGreen}>{title}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    )} />
            </VStack>
        )
    }

    const RenderMonthlyOption: React.FC = () => {
        const onSelecteOption = async (id: string, title: string) => {
            setRecurrenceDaySelected(id)
            setRecurrenceDayOptionSelected(title)

            await delay(300)
            ref.current?.setPage(1)
        }

        return (
            <VStack h={"95%"} py={"0px"} w={"100%"} alignItems={"center"} >
                <Heading w={"100%"} mb={"20px"} px={"20px"} textAlign={"left"} fontSize={scale(20)} color={"white"}>Selecciona un día</Heading>
                <VStack space={"15px"}>
                    {recurenceMonthlyData.map((item, index) => (
                        <HStack px={"10px"} key={`recurenceMonthly${index}`} w={"100%"} justifyContent={"space-between"}>
                            {item?.map(({ title, id, day }) => (
                                <Pressable _pressed={{ opacity: 0.5 }} key={title} flexWrap={"nowrap"} onPress={() => onSelecteOption(id, title)} w={scale(width / 7)} h={scale(width / 7)} bg={recurrenceDaySelected === id ? colors.mainGreen : colors.lightGray} justifyContent={"center"} alignItems={"center"} borderRadius={10}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrenceDaySelected === id ? colors.white : colors.mainGreen}>{day}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    ))}
                </VStack>
            </VStack>
        )
    }

    const RenderOptions: React.FC = () => {
        switch (recurrence) {
            case "weekly":
                return <RenderWeeklyOption />

            case "monthly":
                return <RenderMonthlyOption />

            default:
                return null
        }

    }

    const onPressNewTransaction = () => {
        router.navigate("user")
        onCloseFinish()
    }

    const formatTransactionRecurrenceTime = (jobName: string, jobTime: string) => {
        switch (jobName) {
            case "weekly":
                return getTitleById(jobTime, recurenceWeeklyData)

            case "monthly":
                return getTitleById(jobTime, recurenceMonthlyData)

            default:
                return "Cada 1 y 16 de cada mes";
        }
    }

    const formatTransactionNextDate = (jobName: string, jobTime: string) => {
        switch (jobName) {
            case "weekly":
                return getNextDay(jobTime as WeeklyQueueTitleType)

            case "monthly":
                return getSpecificDayOfMonth(jobTime)

            default:
                return getNextBiWeeklyDate();
        }
    }

    const onCancelEdit = async () => {
        setCancelSpin(true)

        await delay(500)
        setCancelSpin(false)
        ref.current?.setPage(0)
        setTransaction({})
    }

    useEffect(() => {
        fetchAccountRecurrentTransactions()
    }, [])

    useEffect(() => {
        if (recurrence !== transaction.jobName || transaction.jobTime !== recurrenceDaySelected) {
            setEnableSaveButton(true)
        } else {
            setEnableSaveButton(false)
        }
    }, [recurrence, recurrenceDaySelected, isEdited])

    return (
        <BottomSheet onOpenFinish={fetchAccountRecurrentTransactions} onCloseFinish={onCloseFinish} open={open} height={height * 0.9}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
                <PagerView style={{ flex: 1 }} ref={ref} initialPage={0} onPageSelected={() => { }}>
                    <VStack key={"recurrent-transactions"}>
                        {transactions.length > 0 ? (
                            <ScrollView px={"20px"} w={"100%"} h={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                                <VStack>
                                    <HStack w={"100%"} justifyContent={"space-between"}>
                                        <Heading fontSize={scale(20)} mt={"30px"} fontWeight={"500"} color={"white"}>Recurrentes</Heading>
                                        <Pressable onPress={onPressNewTransaction} mt={"20px"} w={scale(35)} h={scale(35)} borderRadius={100} bg={colors.lightGray} _pressed={{ opacity: 0.5 }} justifyContent={"center"} alignItems={"center"} >
                                            <Entypo name="plus" size={scale(20)} color={colors.mainGreen} />
                                        </Pressable>
                                    </HStack>
                                    <FlatList
                                        scrollEnabled={false}
                                        data={transactions}
                                        mt={"20px"}
                                        renderItem={({ item, index }) => (
                                            <Pressable key={`${item?.repeatJobKey}-${index}`} onPress={() => onSelectTransaction(item)} my={"10px"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} justifyContent={"space-between"}>
                                                <HStack alignItems={"center"}>
                                                    {item?.referenceData?.logo ?
                                                        <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(45)} h={scale(45)} source={{ uri: item?.referenceData?.logo }} />
                                                        :
                                                        <Avatar borderRadius={100} w={scale(45)} h={scale(45)} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(item?.referenceData?.fullName || "")}>
                                                            <Heading size={"sm"} color={colors.white}>
                                                                {EXTRACT_FIRST_LAST_INITIALS(item?.referenceData?.fullName || "0")}
                                                            </Heading>
                                                        </Avatar>
                                                    }
                                                    <VStack ml={"10px"} justifyContent={"center"}>
                                                        <Heading textTransform={"capitalize"} fontSize={scale(14)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(item?.referenceData?.fullName || "")}</Heading>
                                                        <Text textTransform={"capitalize"} fontSize={scale(10)} color={colors.lightSkyGray}>{formatTransactionRecurrenceTime(item?.jobName, item?.jobTime)}</Text>
                                                        <Text textTransform={"capitalize"} fontSize={scale(10)} color={colors.lightSkyGray}>Proximo pago: {moment(formatTransactionNextDate(item?.jobName, item?.jobTime)).format("ll")}</Text>
                                                    </VStack>
                                                </HStack>
                                                <VStack ml={"10px"} justifyContent={"center"}>
                                                    <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(14)} color={"mainGreen"}>{FORMAT_CURRENCY(item?.amount)}</Heading>
                                                </VStack>
                                            </Pressable>
                                        )}
                                    />
                                </VStack>
                            </ScrollView>
                        ) : (
                            <VStack w={"100%"} h={"100%"} px={"20px"}>
                                <Heading fontSize={scale(20)} mt={"30px"} fontWeight={"500"} color={"white"}>Transacciones</Heading>

                                <VStack h={"70%"} justifyContent={"center"}>
                                    <Image resizeMode="contain" alt='logo-image' w={width} h={width / 2} source={noTransactions} />
                                    <VStack alignItems={"center"}>
                                        <Heading textTransform={"capitalize"} fontSize={scale(20)} color={"white"}>No hay transacciones</Heading>
                                        <Text textAlign={"center"} fontSize={scale(14)} color={"white"}>Todavía no hay transacciones para mostrar</Text>
                                    </VStack>
                                    <HStack w={"100%"} justifyContent={"center"}>
                                        <Pressable onPress={onPressNewTransaction} bg={colors.lightGray} w={scale(50)} h={scale(50)} borderRadius={100} mt={"20px"} _pressed={{ opacity: 0.5 }} justifyContent={"center"} alignItems={"center"} >
                                            <Entypo name="plus" size={scale(30)} color={colors.mainGreen} />
                                        </Pressable>
                                    </HStack>
                                </VStack>
                            </VStack>
                        )}
                    </VStack>
                    <VStack p={"20px"} w={"100%"} key={"Recurrente-2"} justifyContent={"space-between"}>
                        <VStack>
                            <HStack justifyContent={"space-between"}>
                                <HStack alignItems={"center"}>
                                    {transaction.profileImageUrl ?
                                        <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(45)} h={scale(45)} source={{ uri: transaction.profileImageUrl }} />
                                        :
                                        <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction.fullName || "")}>
                                            <Heading size={"sm"} color={colors.white}>
                                                {EXTRACT_FIRST_LAST_INITIALS(transaction.fullName || "0")}
                                            </Heading>
                                        </Avatar>
                                    }
                                    <VStack ml={"10px"} justifyContent={"center"}>
                                        <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction.fullName ?? "")}</Heading>
                                        <Text fontSize={scale(10)} textTransform={"capitalize"} color={colors.lightSkyGray}>{formatTransactionRecurrenceTime(transaction.jobName, transaction.jobTime)}</Text>
                                        <Text textTransform={"capitalize"} fontSize={scale(10)} color={colors.lightSkyGray}>Proximo pago: {moment(formatTransactionNextDate(transaction.jobName, transaction.jobTime)).format("ll")}</Text>
                                    </VStack>
                                </HStack>
                                <VStack ml={"10px"} justifyContent={"center"}>
                                    <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{FORMAT_CURRENCY(transaction.amount)}</Heading>
                                </VStack>
                            </HStack>
                            <VStack mt={"50px"}>
                                <Heading fontSize={scale(20)} mt={"20px"} fontWeight={"500"} color={"white"}>Envió Recurrente</Heading>
                                <HStack mt={"20px"} justifyContent={"space-between"}>
                                    <Pressable onPress={() => onRecurrenceChange("weekly")} opacity={recurrence === "weekly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "weekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                        <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "weekly" ? colors.white : colors.mainGreen}>Semanal</Heading>
                                        {recurrence === "weekly" && recurrenceOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceOptionSelected}</Text> : null}
                                    </Pressable>
                                    <Pressable onPress={() => onRecurrenceChange("biweekly")} opacity={recurrence === "biweekly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "biweekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                        <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "biweekly" ? colors.white : colors.mainGreen}>Quincenal</Heading>
                                        {recurrence === "biweekly" && recurrenceBiweeklyOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceBiweeklyOptionSelected}</Text> : null}
                                    </Pressable>
                                </HStack>
                                <HStack mt={"20px"} justifyContent={"space-between"}>
                                    <Pressable onPress={() => onRecurrenceChange("monthly")} opacity={recurrence === "monthly" ? 1 : 0.8} w={"49%"} h={scale(50)} bg={recurrence === "monthly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                        <Heading fontSize={scale(16)} fontWeight={"500"} color={recurrence === "monthly" ? colors.white : colors.mainGreen}>Mensual</Heading>
                                        {recurrence === "monthly" && recurrenceDayOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceDayOptionSelected}</Text> : null}
                                    </Pressable>
                                </HStack>
                            </VStack>
                        </VStack>
                        <HStack mb={"35px"} justifyContent={"space-between"}>
                            <Button
                                spin={cancelSpin}
                                onPress={onCancelEdit}
                                w={"49%"}
                                background={colors.lightGray}
                                color={colors.red}
                                title={"Cancel"}
                            />
                            <Button
                                spin={spin}
                                opacity={enableSaveButton ? 1 : 0.7}
                                disabled={!enableSaveButton}
                                onPress={onSave} w={"49%"}
                                background={enableSaveButton ? colors.mainGreen : colors.lightGray}
                                color={enableSaveButton ? colors.white : colors.mainGreen}
                                title={"Guardar"}
                            />
                        </HStack>
                    </VStack>
                    <VStack w={"100%"} mt={"20px"} key={"RenderOptions"}>
                        <RenderOptions />
                    </VStack>
                </PagerView>
                <BottomSheet onCloseFinish={onBottomSheetCloseFinish} height={height * 0.5} open={visible}>
                    <VStack>
                        <HStack p={"20px"} justifyContent={"space-between"}>
                            <HStack alignItems={"center"}>
                                {transaction.profileImageUrl ?
                                    <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(45)} h={scale(45)} source={{ uri: transaction.profileImageUrl }} />
                                    :
                                    <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction.fullName || "")}>
                                        <Heading size={"sm"} color={colors.white}>
                                            {EXTRACT_FIRST_LAST_INITIALS(transaction.fullName || "0")}
                                        </Heading>
                                    </Avatar>
                                }
                                <VStack ml={"10px"} justifyContent={"center"}>
                                    <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction.fullName ?? "")}</Heading>
                                    <Text fontSize={scale(10)} textTransform={"capitalize"} color={colors.lightSkyGray}>{formatTransactionRecurrenceTime(transaction.jobName, transaction.jobTime)}</Text>
                                    <Text textTransform={"capitalize"} fontSize={scale(10)} color={colors.lightSkyGray}>Proximo pago: {moment(formatTransactionNextDate(transaction.jobName, transaction.jobTime)).format("ll")}</Text>
                                </VStack>
                            </HStack>
                            <VStack ml={"10px"} justifyContent={"center"}>
                                <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{FORMAT_CURRENCY(transaction.amount)}</Heading>
                            </VStack>
                        </HStack>
                        <HStack key={"Recurrente-1"} p={"20px"} mt={"20px"} borderRadius={10} w={"100%"} space={2} >
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

                    </VStack>
                </BottomSheet>
            </SafeAreaView>
        </BottomSheet>
    )
}



export default RecurrenceTransactions