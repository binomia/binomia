import React, { useState } from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button';
import BottomSheet from '../global/BottomSheet';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, FlatList } from 'native-base'
import { FORMAT_CURRENCY, FORMAT_PHONE_NUMBER, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { recurenceMonthlyData, recurenceWeeklyData } from '@/mocks';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { useMutation } from '@apollo/client';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/useLocation';
import { TopUpApolloQueries } from '@/apollo/query';
import { TopUpAuthSchema } from '@/auth/topUpAuth';
import { topupActions } from '@/redux/slices/topupSlice';
import { fetchAllTransactions, fetchRecentTransactions } from '@/redux/fetchHelper';
import { accountActions } from '@/redux/slices/accountSlice';
import { AES } from 'cryptografia';
import { ZERO_ENCRYPTION_KEY } from '@/constants';

type Props = {
    goBack?: () => void
    goNext?: () => void
    onClose?: (_?: any) => void
}

const { width } = Dimensions.get("screen")
const TopTupDetails: React.FC<Props> = ({ goBack = () => { }, onClose = (_?: any) => { } }) => {
    const [createTopUp] = useMutation(TopUpApolloQueries.createTopUp())

    const { newTopUp } = useSelector((state: any) => state.topupReducer)
    const { location } = useSelector((state: any) => state.globalReducer)
    const { account, user } = useSelector((state: any) => state.accountReducer)

    const dispatch = useDispatch();
    const { authenticate } = useLocalAuthentication();
    const { getLocation } = useLocation();

    const [recurrence, setRecurrence] = useState<string>("oneTime");
    const [recurrenceSelected, setRecurrenceSelected] = useState<string>("");
    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [recurrenceOptionSelected, setRecurrenceOptionSelected] = useState<string>("");
    const [recurrenceDayOptionSelected, setRecurrenceDayOptionSelected] = useState<string>("");
    const [recurrenceBiweeklyOptionSelected, setRecurrenceBiweeklyOptionSelected] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const [openOptions, setOpenOptions] = useState<string>("")

    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

    const handleOnSend = async (recurrence: { title: string, time: string }) => {
        try {
            if (!location)
                await getLocation()

            const data = await TopUpAuthSchema.createTopUp.parseAsync({
                phone: newTopUp.phone,
                amount: newTopUp.amount,
                fullName: newTopUp.fullName?.trim(),
                companyId: Number(newTopUp.company.id),
                location,
                response: {
                    "userId": Number(user.id),
                    amount: newTopUp.amount,
                    status: "waiting",
                    "createdAt": new Date().toISOString(),
                    "updatedAt": new Date().toISOString(),
                    user: {
                        fullName: newTopUp.fullName?.trim(),
                    },
                    company: {
                        logo: newTopUp.logo
                    },
                    "phone": {
                        "fullName": newTopUp.fullName?.trim(),
                        "phone": newTopUp.phone,
                        "lastUpdated": new Date().toISOString(),
                        "createdAt": new Date().toISOString(),
                        "updatedAt": new Date().toISOString(),
                        "companyId": Number(newTopUp.company.id),
                        "userId": user.id
                    }
                }
            })
            const signingKey = await AES.decrypt(user.signingKey, ZERO_ENCRYPTION_KEY)
            const message = await AES.encrypt(JSON.stringify({ data, recurrence }), signingKey)
            
            await createTopUp({ variables: { message } })
            await onNext()

        } catch (error: any) {
            console.error(error.message);
            onClose()
        }
    }

    const onNext = async () => {
        await dispatch(accountActions.setAccount(Object.assign({}, account, { balance: account.balance - Number(newTopUp.amount) })))
        await dispatch(topupActions.setHasNewTransaction(true))
        await dispatch(fetchRecentTransactions())
        await dispatch(fetchAllTransactions({ page: 1, pageSize: 5 }))

        onClose()
    }

    const onRecurrenceChange = (value: string) => {
        if (value === "biweekly")
            setRecurrenceBiweeklyOptionSelected("Cada 1 y 16 de cada mes")

        setOpenOptions(value)
        setRecurrence(value)
    }

    const handleOnPress = async () => {
        try {
            const authenticated = await authenticate()
            if (authenticated.success) {
                setLoading(true)
                await handleOnSend({
                    title: recurrence,
                    time: recurrence === "biweekly" ? recurrence : recurrence === "monthly" ? recurrenceDaySelected : recurrence === "weekly" ? recurrenceSelected : recurrence
                })
            }

            await dispatch(fetchRecentTransactions())
            await dispatch(transactionActions.setHasNewTransaction(true))

            setLoading(false)

        } catch (error) {
            console.log({ handleOnSend: error });
        }
    }

    const onCloseFinished = () => {
        setOpenOptions("")
    }

    const RenderWeeklyOption: React.FC = () => {
        const onSelecteOption = async (id: string, title: string) => {
            setRecurrenceSelected(id)
            setRecurrenceOptionSelected(title)

            await delay(300)
            setOpenOptions("")
        }

        return (
            <VStack py={"20px"} px={"10px"} w={"100%"}>
                <FlatList
                    scrollEnabled={false}
                    data={recurenceWeeklyData}
                    renderItem={({ item }) => (
                        <HStack my={"10px"} w={"100%"} justifyContent={"space-between"}>
                            {item.map(({ title, id }) => (
                                <Pressable w={width * 0.46} key={id} borderRadius={"5px"} justifyContent={"center"} alignItems={"center"} h={scale(45)} bg={recurrenceSelected === id ? colors.mainGreen : colors.lightGray} _pressed={{ opacity: 0.5 }} onPress={() => onSelecteOption(id, title)} borderColor={colors.mainGreen}>
                                    <Heading fontSize={scale(12)} fontWeight={"500"} color={recurrenceSelected === id ? colors.white : colors.mainGreen}>{title}</Heading>
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
            setOpenOptions("")
        }

        return (
            <VStack py={"20px"} alignItems={"center"} w={"100%"}>
                <Heading mb={"20px"} fontSize={scale(20)} color={"white"}>Selecciona un día</Heading>
                <FlatList
                    scrollEnabled={false}
                    data={recurenceMonthlyData}
                    renderItem={({ item }) => (
                        <HStack w={"100%"}>
                            {item.map(({ title, id, day }) => (
                                <Pressable _pressed={{ opacity: 0.5 }} key={title} m={"5px"} flexWrap={"nowrap"} onPress={() => onSelecteOption(id, title)} w={width / 6} h={width / 6} bg={recurrenceDaySelected === id ? colors.mainGreen : colors.lightGray} justifyContent={"center"} alignItems={"center"} borderRadius={10}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrenceDaySelected === id ? colors.white : colors.mainGreen}>{day}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    )} />
            </VStack>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <VStack px={"10px"} mt={"10px"} h={"100%"}>
                <VStack pb={"30px"} mt={"10px"} flex={1} justifyContent={"space-between"} alignItems={"center"} borderRadius={10}>
                    <VStack alignItems={"center"} justifyContent={"center"}>
                        <HStack my={"10px"}>
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image-details' w={scale(60)} h={scale(60)} source={{ uri: newTopUp.logo }} />
                        </HStack>
                        <Heading textTransform={"capitalize"} fontSize={scale(25)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(newTopUp?.fullName || "")}</Heading>
                        <Text fontSize={scale(16)} color={colors.lightSkyGray}>{FORMAT_PHONE_NUMBER(newTopUp?.phone || "")}</Text>
                        <Heading textTransform={"capitalize"} fontSize={scale(40)} color={"mainGreen"}>{FORMAT_CURRENCY(newTopUp?.amount)}</Heading>
                    </VStack>
                    <VStack flex={1} mt={"20px"} justifyContent={"space-between"}>
                        <VStack p={"20px"} w={"100%"} key={"Recurrente-2"} >
                            <Heading fontSize={scale(20)} mt={"20px"} fontWeight={"500"} color={"white"}>Envió Recurrente</Heading>
                            <HStack mt={"15px"} justifyContent={"space-between"}>
                                <Pressable onPress={() => onRecurrenceChange("oneTime")} w={"49%"} h={scale(50)} bg={recurrence === "oneTime" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrence === "oneTime" ? colors.white : colors.mainGreen}>Una vez</Heading>
                                </Pressable>
                                <Pressable onPress={() => onRecurrenceChange("weekly")} w={"49%"} h={scale(50)} bg={recurrence === "weekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrence === "weekly" ? colors.white : colors.mainGreen}>Semanal</Heading>
                                    {recurrence === "weekly" && recurrenceOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceOptionSelected}</Text> : null}
                                </Pressable>
                            </HStack>
                            <HStack mt={"15px"} justifyContent={"space-between"}>
                                <Pressable onPress={() => onRecurrenceChange("biweekly")} w={"49%"} h={scale(50)} bg={recurrence === "biweekly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrence === "biweekly" ? colors.white : colors.mainGreen}>Quincenal</Heading>
                                    {recurrence === "biweekly" && recurrenceBiweeklyOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceBiweeklyOptionSelected}</Text> : null}
                                </Pressable>
                                <Pressable onPress={() => onRecurrenceChange("monthly")} w={"49%"} h={scale(50)} bg={recurrence === "monthly" ? colors.mainGreen : colors.lightGray} borderRadius={10} alignItems={"center"} justifyContent={"center"} _pressed={{ opacity: 0.5 }}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrence === "monthly" ? colors.white : colors.mainGreen}>Mensual</Heading>
                                    {recurrence === "monthly" && recurrenceDayOptionSelected ? <Text fontSize={scale(10)} color={colors.white}>{recurrenceDayOptionSelected}</Text> : null}
                                </Pressable>
                            </HStack>
                        </VStack>
                        <HStack mb="10px" px={"20px"} justifyContent={"space-between"}>
                            <Button onPress={goBack} w={"49%"} bg={colors.lightGray} color={colors.mainGreen} title={"Atrás"} />
                            <Button spin={loading} onPress={handleOnPress} w={"49%"} bg={"mainGreen"} color='white' title={"Recargar"} />
                        </HStack>
                    </VStack>
                </VStack>
            </VStack>
            <BottomSheet onCloseFinish={onCloseFinished} open={openOptions === "weekly"} height={scale(300)}>
                <RenderWeeklyOption key={"RenderWeeklyOption"} />
            </BottomSheet>
            <BottomSheet onCloseFinish={onCloseFinished} open={openOptions === "monthly"} height={(width / 6) * 10}>
                <RenderMonthlyOption key={"RenderMonthlyOption"} />
            </BottomSheet>
        </SafeAreaView>
    )
}

export default TopTupDetails