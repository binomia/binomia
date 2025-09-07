import React, { useState } from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button';
import BottomSheet from '../global/BottomSheet';
import { Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, FlatList, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { recurenceMonthlyData, recurenceWeeklyData } from '@/mocks';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
// import { transactionActions } from '@/redux/slices/transactionSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountActions } from '@/redux/slices/accountSlice';
import { useLocation } from '@/hooks/useLocation'
import { AccountAuthSchema } from '@/auth/accountAuth';
import { router } from 'expo-router';
import { AES } from 'cryptografia';
import { ZERO_ENCRYPTION_KEY } from '@/constants';
import { transactionActions } from '@/redux/slices/transactionSlice';
type Props = {
    goBack?: () => void
    goNext?: () => void
    onClose?: () => void
}

const { width } = Dimensions.get("screen")
const TransactionDetails: React.FC<Props> = ({ onClose = () => { }, goNext = () => { }, goBack = () => { } }) => {
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { user } = useSelector((state: any) => state.accountReducer)

    const dispatch = useDispatch();
    const { authenticate } = useLocalAuthentication();
    const { getLocation } = useLocation();
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const { transactionDeytails } = useSelector((state: any) => state.transactionReducer)
    const [recurrence, setRecurrence] = useState<string>("oneTime");
    const [recurrenceSelected, setRecurrenceSelected] = useState<string>("");
    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [recurrenceOptionSelected, setRecurrenceOptionSelected] = useState<string>("");
    const [recurrenceDayOptionSelected, setRecurrenceDayOptionSelected] = useState<string>("");
    const [recurrenceBiweeklyOptionSelected, setRecurrenceBiweeklyOptionSelected] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const [openOptions, setOpenOptions] = useState<string>("")
    // const { uploadTransactionImages } = useCloudinary();


    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))



    const handleOnSend = async (recurrence: { title: string, time: string }) => {
        try {
            const location = await getLocation()
            const data = await TransactionAuthSchema.createTransaction.parseAsync({
                receiver: receiver.username,
                amount: parseFloat(transactionDeytails.amount),
                location: Object.assign({}, location, {})
            })

            const signingKey = await AES.decryptAsync(user.signingKey, ZERO_ENCRYPTION_KEY)
            const message = await AES.encryptAsync(JSON.stringify({ data, recurrence }), signingKey)

            const start = Date.now()
            const { data: createedTransaction } = await createTransaction({
                variables: { message }
            })


            const transaction = createedTransaction?.createTransaction
            if (transaction) {
                const accountsData = await AccountAuthSchema.account.parseAsync(transaction?.from)
                const formatedTransaction = formatTransaction(transaction)

                await dispatch(accountActions.setAccount(accountsData))
                await dispatch(transactionActions.setTransaction({
                    ...transaction,
                    amountColor: colors.red,
                    fullName: formatedTransaction.fullName,
                    profileImageUrl: formatedTransaction.profileImageUrl,
                    username: formatedTransaction.username,
                    isFromMe: true,
                    to: receiver
                }))
                setLoading(false)
                goNext()
                const end = Date.now()
                console.log({ handleOnSend: (end - start) / 1000 + "s" });
            } else {
                router.navigate("/error?title=Transaction&message=Se ha producido un error al intentar crear la transacción. Por favor, inténtalo de nuevo.")
            }


        } catch (error: any) {
            setLoading(false)
            console.error({ handleOnSend: error.message });

            let title = "Transaction"
            let message = "Se ha producido un error al intentar crear la transacción. Por favor, inténtalo de nuevo."
            if (error?.message.includes("LOCATION")) {
                message = "Debe activar la ubicación para poder realizar la transacción."
                title = "Ubicación"
                onClose()
                await delay(1000).then(() => {
                    router.navigate(`/location`)
                })
            } else {
                onClose()
                await delay(1000).then(() => {
                    router.navigate(`/error?title=${title}&message=${message}`)
                })
            }

        }
    }


    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction.from?.id === user.id

        const profileImageUrl = transaction.to?.profileImageUrl
        const fullName = isFromMe ? transaction.to?.fullName : transaction.from?.fullName
        const username = isFromMe ? transaction.from?.username : transaction.to?.username

        return {
            ...transaction,
            isFromMe,
            showMap: true,
            profileImageUrl: profileImageUrl || "",
            amount: transaction.amount,
            fullName: fullName || "",
            username: username || ""
        }
    }


    const onRecurrenceChange = (value: string) => {
        if (value === "biweekly")
            setRecurrenceBiweeklyOptionSelected("Cada 1 y 16 de cada mes")

        setOpenOptions(value)
        setRecurrence(value)
    }

    const handleOnPress = async () => {
        try {

            const { success } = await authenticate()
            if (success) {
                setLoading(true)
                await handleOnSend({
                    title: recurrence,
                    time: recurrence === "biweekly" ? recurrence : recurrence === "monthly" ? recurrenceDaySelected : recurrence === "weekly" ? recurrenceSelected : recurrence
                })
            }
        } catch (error) {
            setLoading(false)
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
                            {transactionDeytails.profileImageUrl ?
                                <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(60)} h={scale(60)} source={{ uri: transactionDeytails.profileImageUrl }} />
                                :
                                <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transactionDeytails?.fullName || "")}>
                                    <Heading size={"sm"} color={colors.white}>
                                        {EXTRACT_FIRST_LAST_INITIALS(transactionDeytails?.fullName || "0")}
                                    </Heading>
                                </Avatar>
                            }
                        </HStack>
                        <Heading textTransform={"capitalize"} fontSize={scale(25)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transactionDeytails?.fullName || "")}</Heading>
                        <Text fontSize={scale(16)} color={colors.lightSkyGray}>{transactionDeytails?.username}</Text>
                        <Heading textTransform={"capitalize"} fontSize={scale(40)} color={"mainGreen"}>{FORMAT_CURRENCY(transactionDeytails?.amount)}</Heading>
                    </VStack>
                    <VStack flex={1} justifyContent={"space-between"}>
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
                            <Button spin={loading} onPress={handleOnPress} w={"49%"} bg={"mainGreen"} color='white' title={"Enviar"} />
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

export default TransactionDetails
