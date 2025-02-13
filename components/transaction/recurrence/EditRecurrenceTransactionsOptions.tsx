import React, { useCallback, useEffect, useRef, useState } from 'react'
import colors from '@/colors'

import PagerView from 'react-native-pager-view';
import Button from '@/components/global/Button';
import { StyleSheet, Dimensions, RefreshControl } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, Spinner, ScrollView, FlatList } from 'native-base'
import { scale } from 'react-native-size-matters';
import { useLazyQuery, useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { deleteIcon, editIcon, noTransactions } from '@/assets';
import { Ionicons } from '@expo/vector-icons';
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getNextDay, getSpecificDayOfMonth, MAKE_FULL_NAME_SHORTEN } from '@/helpers';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { recurenceMonthlyData, recurenceWeeklyData, getTitleById } from '@/mocks';

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
    const [bottomSheetHeight, setBottomSheetHeight] = useState<number>(height * 0.4);
    const [recurrence, setRecurrence] = useState<string>("");
    const [startDeleting, setStartDeleting] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([])
    const [transaction, setTransaction] = useState<any>({})

    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [recurrenceOptionSelected, setRecurrenceOptionSelected] = useState<string>("");
    const [recurrenceDayOptionSelected, setRecurrenceDayOptionSelected] = useState<string>("");


    const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


  
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
                            {item.map(({ title, id }) => (
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
                            {item.map(({ title, id, day }) => (
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

    return (
        <RenderOptions />
    )
}

export default RecurrenceTransactions