import React, { useState } from 'react'
import colors from '@/colors'
import Button from '@/components/global/Button';
import BottomSheet from '../global/BottomSheet';
import { Dimensions, Alert } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Pressable, FlatList, Avatar } from 'native-base'
import { EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, getMapLocationImage, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import { recurenceMonthlyData, recurenceWeeklyData } from '@/mocks';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useLazyQuery, useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserApolloQueries } from '@/apollo/query';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { useLocation } from '@/hooks/useLocation';
import { AccountAuthSchema } from '@/auth/accountAuth';
import { accountActions } from '@/redux/slices/accountSlice';
import { router } from 'expo-router';
import { AES } from 'cryptografia';
import { ZERO_ENCRYPTION_KEY } from '@/constants';
import { useCloudinary } from '@/hooks/useCloudinary';

type Props = {
    goBack?: () => void
    goNext?: () => void
    onCloseFinish?: () => void
}

const { width, height } = Dimensions.get("screen")
const TranferRequestDetails: React.FC<Props> = ({ goNext = () => { }, onCloseFinish = () => { }, goBack = () => { } }) => {
    const dispatch = useDispatch();

    const { authenticate } = useLocalAuthentication();
    const { getLocation } = useLocation();
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { location } = useSelector((state: any) => state.globalReducer)
    const { user } = useSelector((state: any) => state.accountReducer)

    const [createRequestTransaction] = useMutation(TransactionApolloQueries.createRequestTransaction())
    const [fetchSingleUser] = useLazyQuery(UserApolloQueries.singleUser())
    const { uploadTransactionImages } = useCloudinary();

    const { transactionDeytails } = useSelector((state: any) => state.transactionReducer)
    const [recurrenceSelected, setRecurrenceSelected] = useState<string>("");
    const [recurrenceDaySelected, setRecurrenceDaySelected] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const [openOptions, setOpenOptions] = useState<string>("")


    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

    const validateIfCanSend = async () => {
        try {
            const { data } = await fetchSingleUser({
                variables: {
                    username: receiver.username
                }
            })

            const { status, allowRequestMe } = data.singleUser.account
            if (!allowRequestMe) {
                Alert.alert("Advertencia", `${receiver.fullName} no puede recibir dinero en este momento.`, [{
                    onPress: async () => {
                        onCloseFinish()
                    }
                }])

                throw new Error(`${receiver.fullName} no puede recibir dinero en este momento.`)
            }

            if (status !== "active") {
                Alert.alert("Advertencia", `${receiver.fullName}  no se encuentra activo.`, [{
                    onPress: async () => {
                        onCloseFinish()
                    }
                }])

                throw new Error(`${receiver.fullName} no puede recibir dinero en este momento.`)
            }

            return true

        } catch (error) {
            throw error
        }
    }

    const handleOnSend = async (recurrence: { title: string, time: string }) => {
        try {
            const _location = await getLocation()
            const image = await uploadTransactionImages(getMapLocationImage({ latitude: _location.latitude, longitude: _location.longitude }))

            const data = await TransactionAuthSchema.createTransaction.parseAsync({
                transactionType: "request",
                receiver: receiver.username,
                amount: parseFloat(transactionDeytails.amount),
                location: Object.assign({}, _location, {
                    uri: image || ""
                })
            })


            const signingKey = await AES.decryptAsync(user.signingKey, ZERO_ENCRYPTION_KEY)
            const message = await AES.encryptAsync(JSON.stringify({ data, recurrence }), signingKey)
            const { data: createdRequestTransaction } = await createRequestTransaction({
                variables: { message }
            })

            const transaction = createdRequestTransaction?.createRequestTransaction
            if (transaction) {
                const accountsData = await AccountAuthSchema.account.parseAsync(transaction.from)

                await dispatch(accountActions.setAccount(accountsData))
                await dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {
                    ...formatTransaction(Object.assign({}, transaction, {
                        status: "pending",
                        to: receiver,
                        from: user
                    }))
                })))

                setLoading(false)
                goNext()

            } else {
                router.navigate("/error?title=Transaction&message=Se ha producido un error al intentar crear la transacción. Por favor, inténtalo de nuevo.")
            }


        } catch (error: any) {
            setLoading(false)
            console.error(error.message);

            onCloseFinish()
            await delay(1000).then(() => {
                router.navigate("/error?title=Transaction&message=Se ha producido un error al intentar crear la transacción. Por favor, inténtalo de nuevo.")
            })
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
            await validateIfCanSend()
            const authenticated = await authenticate()

            if (authenticated.success) {
                setLoading(true)
                await handleOnSend({
                    title: "oneTime",
                    time: "oneTime"
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
        const onSelecteOption = async (id: string) => {
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
                                <Pressable w={width * 0.46} key={id} borderRadius={"5px"} justifyContent={"center"} alignItems={"center"} h={scale(45)} bg={recurrenceSelected === id ? colors.mainGreen : colors.lightGray} _pressed={{ opacity: 0.5 }} onPress={() => onSelecteOption(id)} borderColor={colors.mainGreen}>
                                    <Heading fontSize={scale(12)} fontWeight={"500"} color={recurrenceSelected === id ? colors.white : colors.mainGreen}>{title}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    )} />
            </VStack>
        )
    }

    const RenderMonthlyOption: React.FC = () => {
        const onSelecteOption = async (id: string) => {
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
                                <Pressable _pressed={{ opacity: 0.5 }} key={title} m={"5px"} flexWrap={"nowrap"} onPress={() => onSelecteOption(id)} w={width / 6} h={width / 6} bg={recurrenceDaySelected === id ? colors.mainGreen : colors.lightGray} justifyContent={"center"} alignItems={"center"} borderRadius={10}>
                                    <Heading fontSize={scale(15)} fontWeight={"500"} color={recurrenceDaySelected === id ? colors.white : colors.mainGreen}>{day}</Heading>
                                </Pressable>
                            ))}
                        </HStack>
                    )} />
            </VStack>
        )
    }

    return (
        <SafeAreaView style={{ flex: 0.95, backgroundColor: colors.darkGray }}>
            <VStack px={"10px"} h={"100%"}>
                <VStack pb={"30px"} flex={1} justifyContent={"space-between"} alignItems={"center"} borderRadius={10}>
                    <VStack w={"100%"} pt={"20px"} alignItems={"center"} justifyContent={"center"}>
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
                        <Heading textTransform={"capitalize"} mt={"20px"} fontSize={scale(40)} color={"mainGreen"}>{FORMAT_CURRENCY(transactionDeytails?.amount)}</Heading>
                    </VStack>
                    <VStack px={"10px"} mt={"20px"} w={"100%"} justifyContent={"center"}>
                        <HStack w={"85%"} mb={"5px"}>
                            <Heading fontSize={scale(15)} textTransform={"capitalize"} color={"white"}>{location?.fullArea || "Ubicación"}</Heading>
                        </HStack>
                        <Image
                            alt='fine-location-image-alt'
                            resizeMode="cover"
                            w={"100%"}
                            h={scale(height / 3.3)}
                            source={{
                                uri: getMapLocationImage({ latitude: location?.latitude, longitude: location?.longitude })
                            }}
                            style={{
                                borderRadius: 10
                            }}
                        />
                    </VStack>

                </VStack>
                <HStack w={"100%"} mb={"5px"} px={"10px"} justifyContent={"space-between"}>
                    <Button onPress={goBack} w={"49%"} bg={colors.lightGray} color={colors.mainGreen} title={"Atrás"} />
                    <Button spin={loading} onPress={handleOnPress} w={"49%"} bg={"mainGreen"} color='white' title={"Solicitar"} />
                </HStack>
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