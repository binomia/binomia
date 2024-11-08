import React, { useCallback, useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack, Pressable, ScrollView, FlatList } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '@/components/global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import Cards from '@/components/cards';
import { deleteIcon, depositIcon, editIcon } from '@/assets';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DefaultIcon from 'react-native-default-icon';
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers';
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
const DepositOrWithdrawTransaction: React.FC<Props> = ({ title = "Deposito", open = true, onSendFinish = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation<any>()
    const ref = useRef<PagerView>(null);

    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { card } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(false);
    const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(height * 0.45);
    const [recurrence, setRecurrence] = useState<string>("weekly");
    const [showPayButton, setShowPayButton] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);


    const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

        await delay(500)
        setBottomSheetHeight(height * 0.45)
        ref.current?.setPage(0)
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);


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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <HStack px={"10px"} mt={"3px"} alignItems={"center"} justifyContent={"space-between"}>
                <Stack w={"30px"}>
                    <TouchableOpacity onPress={() => handleOnClose()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="white" />
                    </TouchableOpacity>
                </Stack>
                <Text fontSize={"17px"} fontWeight={"550"} color={"white"}>{"Recurrentes"}</Text>
                <Heading w={"30px"} />
            </HStack>
            <ScrollView px={"20px"} w={"100%"} h={"100%"} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Heading fontSize={scale(20)} mt={"100px"} fontWeight={"500"} color={"white"}>Transacciones</Heading>
                <FlatList
                    data={[1, 2, 3]}
                    mt={"20px"}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => setVisible(true)} my={"10px"} _pressed={{ opacity: 0.5 }} flexDirection={"row"} justifyContent={"space-between"}>
                            <HStack>
                                <DefaultIcon
                                    value={"bitcoin"}
                                    contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT("bitcoin") }]}
                                    textStyle={styles.textStyle}
                                />
                                <VStack ml={"10px"} justifyContent={"center"}>
                                    <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN("bitcoin")}</Heading>
                                    <Text fontSize={scale(12)} color={colors.lightSkyGray}>{moment(Number(1619644800)).format("lll")}</Text>
                                </VStack>
                            </HStack>
                            <VStack ml={"10px"} justifyContent={"center"}>
                                <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{"+"}{FORMAT_CURRENCY(200)}</Heading>
                            </VStack>
                        </Pressable>
                    )}
                />
            </ScrollView>
            <BottomSheet onCloseFinish={onBottomSheetCloseFinish} height={bottomSheetHeight} open={visible}>
                <HStack p={"20px"} justifyContent={"space-between"}>
                    <HStack>
                        <DefaultIcon
                            value={"bitcoin"}
                            contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT("bitcoin") }]}
                            textStyle={styles.textStyle}
                        />
                        <VStack ml={"10px"} justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(16)} color={"white"}>{MAKE_FULL_NAME_SHORTEN("bitcoin")}</Heading>
                            <Text fontSize={scale(12)} color={colors.lightSkyGray}>{moment(Number(1619644800)).format("lll")}</Text>
                        </VStack>
                    </HStack>
                    <VStack ml={"10px"} justifyContent={"center"}>
                        <Heading fontWeight={"semibold"} textTransform={"capitalize"} fontSize={scale(16)} color={"mainGreen"}>{"+"}{FORMAT_CURRENCY(200)}</Heading>
                    </VStack>
                </HStack>
                <PagerView style={{ flex: 1 }} ref={ref} initialPage={0} onPageSelected={() => { }}>
                    <HStack key={"Recurrente-1"} p={"20px"} borderRadius={10} w={"100%"} space={2} justifyContent={"space-between"}>
                        <Pressable onPress={() => { }} _pressed={{ opacity: 0.5 }} w={"49%"} h={scale(120)} bg={colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"}>
                            <Image alt='logo-image' resizeMode='contain' w={scale(30)} h={scale(30)} source={deleteIcon} />
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