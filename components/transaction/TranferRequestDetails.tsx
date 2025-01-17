import React, { useEffect, useState } from 'react'
import axios from 'axios';
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import Button from '@/components/global/Button';
import BottomSheet from '../global/BottomSheet';
import { StyleSheet, Dimensions } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, FlatList } from 'native-base'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getMapLocationImage, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { recurenceMonthlyData, recurenceWeeklyData } from '@/mocks';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';


type Props = {
    goBack?: () => void
    goNext?: () => void
}

const { width, height } = Dimensions.get("screen")
const TranferRequestDetails: React.FC<Props> = ({ goNext = () => { }, goBack = () => { } }) => {
    const dispatch = useDispatch();

    const { authenticate } = useLocalAuthentication();
    const { receiver, transactions } = useSelector((state: any) => state.transactionReducer)
    const { location, user } = useSelector((state: any) => state.globalReducer)
    const [createRequestTransaction] = useMutation(TransactionApolloQueries.createRequestTransaction())

    const { transactionDeytails } = useSelector((state: any) => state.transactionReducer)
    const [recurrence, setRecurrence] = useState<string>("oneTime");
    const [recurrenceSelected, setRecurrenceSelected] = useState<string>("");
    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const [openOptions, setOpenOptions] = useState<string>("")
    const [locationInfo, setLocationInfo] = useState<any>({})

    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

    const getLocationInfo = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            setLocationInfo(data.address)
            return data
        } catch (error) {
            console.error(error);
            setLocationInfo({})
        }
    }

    const handleOnSend = async (recurrence: { title: string, time: string }) => {
        try {
            const data = await TransactionAuthSchema.createTransaction.parseAsync({
                transactionType: "request",
                receiver: receiver.username,
                amount: parseFloat(transactionDeytails.amount),
                location: Object.assign({}, location, locationInfo)
            })

            const { data: transaction } = await createRequestTransaction({
                variables: { data, recurrence }
            })

            const transactionSent = Object.assign({}, transaction.createRequestTransaction, {
                ...transaction.createTransaction,
                to: receiver,
                from: user
            })



            await Promise.all([
                dispatch(transactionActions.setTransactions([transaction.createTransaction, ...transactions])),
                dispatch(transactionActions.setTransaction(Object.assign({}, transaction.createRequestTransaction, {
                    ...transaction.createTransaction,
                    ...formatTransaction(transactionSent),
                    to: receiver,
                    from: user
                })))
            ])

            goNext()

        } catch (error: any) {
            console.error(error.message);
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
            createdAt: transaction.createdAt,
            profileImageUrl: profileImageUrl || "",
            amount: transaction.amount,
            fullName: fullName || "",
            username: username || ""
        }
    }

    const handleOnPress = async () => {
        try {
            const authenticated = await authenticate()
            setLoading(true)

            if (authenticated.success) {
                await handleOnSend({
                    title: recurrence,
                    time: recurrence === "biweekly" ? recurrence : recurrence === "monthly" ? recurrenceDaySelected : recurrence === "weekly" ? recurrenceSelected : recurrence
                })
            }

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

            await delay(300)
            setOpenOptions("")
        }

        return (
            <VStack py={"20px"} px={"10px"} w={"100%"}>
                <Heading mb={"20px"} fontSize={scale(20)} color={"white"}>Selecciona un día</Heading>
                <FlatList
                    scrollEnabled={false}
                    data={recurenceMonthlyData}
                    contentContainerStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => (
                        <HStack w={"100%"} >
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

    const transactionLocation = (location: z.infer<typeof TransactionAuthSchema.transactionLocation>) => {
        const neighbourhood = location?.neighbourhood ? location.neighbourhood : ""
        const town = location?.town ? location.town : ""
        const county = location.county ? location.county : ""

        return `${neighbourhood}${town ? ", " : ""}${town}${county ? ", " : ""}${county}`
    }


    useEffect(() => {
        getLocationInfo(location)
    }, [])

    return (
        <SafeAreaView style={{ flex: 0.95, backgroundColor: colors.darkGray }}>
            <VStack px={"10px"} mt={"10px"} h={"100%"}>
                <VStack pb={"30px"} flex={1} justifyContent={"space-between"} alignItems={"center"} borderRadius={10}>
                    <VStack w={"100%"} pt={"20px"} alignItems={"center"} justifyContent={"center"}>
                        <HStack my={"10px"}>
                            {transactionDeytails.profileImageUrl ?
                                <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(60)} h={scale(60)} source={{ uri: transactionDeytails.profileImageUrl }} />
                                :
                                <DefaultIcon
                                    value={transactionDeytails?.fullName || "q"}
                                    contentContainerStyle={[styles.contentContainerStyle, { width: scale(60), height: scale(60), backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transactionDeytails?.fullName || "") }]}
                                    textStyle={styles.textStyle}
                                />
                            }
                        </HStack>
                        <Heading textTransform={"capitalize"} fontSize={scale(25)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(transactionDeytails?.fullName || "")}</Heading>
                        <Text fontSize={scale(16)} color={colors.lightSkyGray}>{transactionDeytails?.username}</Text>
                        <Heading textTransform={"capitalize"} fontSize={scale(45)} color={"mainGreen"}>{FORMAT_CURRENCY(transactionDeytails?.amount)}</Heading>
                    </VStack>
                    <VStack px={"20px"} w={"100%"} justifyContent={"center"}>
                        <HStack w={"85%"} mb={"5px"}>
                            <Heading fontSize={scale(16)} textTransform={"capitalize"} color={"white"}>{transactionLocation(location ?? {}) || "Ubicación"}</Heading>
                        </HStack>
                        <Image
                            alt='fine-location-image-alt'
                            resizeMode="cover"
                            w={"100%"}
                            h={height / 3}
                            source={{
                                uri: getMapLocationImage({ latitude: location?.latitude, longitude: location?.longitude })
                            }}
                            style={{
                                borderRadius: 10
                            }}
                        />
                    </VStack>

                    <HStack w={"100%"} px={"10px"} justifyContent={"space-between"}>
                        <Button onPress={goBack} w={"49%"} bg={colors.lightGray} color={colors.mainGreen} title={"Atrás"} />
                        <Button spin={loading} onPress={handleOnPress} w={"49%"} bg={"mainGreen"} color='white' title={"Solicitar"} />
                    </HStack>
                </VStack>
            </VStack>
            <BottomSheet onCloseFinish={onCloseFinished} open={openOptions === "weekly"} height={scale(300)}>
                <RenderWeeklyOption key={"RenderWeeklyOption"} />
            </BottomSheet>
            <BottomSheet onCloseFinish={onCloseFinished} open={openOptions === "monthly"} height={(width / 6) * 9}>
                <RenderMonthlyOption key={"RenderMonthlyOption"} />
            </BottomSheet>
        </SafeAreaView>
    )
}

export default TranferRequestDetails


const styles = StyleSheet.create({
    contentContainerStyle: {
        width: 55,
        height: 55,
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
    }
})