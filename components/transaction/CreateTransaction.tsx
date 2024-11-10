import React, { useEffect, useRef, useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack } from 'native-base'
import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import BottomSheet from '@/components/global/BottomSheet';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '../global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionAuthSchema } from '@/auth/transactionAuth';
import { useMutation } from '@apollo/client';
import { TransactionApolloQueries } from '@/apollo/query/transactionQuery';
import { globalActions } from '@/redux/slices/globalSlice';
import SingleTransactionScreen from '@/screens/SingleTransactionScreen';
import { useLocalAuthentication } from '@/hooks/useLocalAuthentication';
import PagerView from 'react-native-pager-view';
import TransactionDetailsScreen from './TranferDetails';

type Props = {
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
    nextPage?: () => void
    input: string
    setInput: (_: string) => void
}

const { height } = Dimensions.get('window')
const CreateTransaction: React.FC<Props> = ({ open = false, input, setInput, nextPage = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const ref = useRef<PagerView>(null);
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { location, account, user } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [visible, setVisible] = useState<boolean>(open);
    const [showSingleTransaction, setShowSingleTransaction] = useState<boolean>(false);
    const [showPayButton, setShowPayButton] = useState<boolean>(false);

    const handleOnSend = async (recurrence?: { title: string, time: string }) => {
        try {
            console.log({ recurrence });
            const transactionData = await TransactionAuthSchema.createTransaction.parseAsync({
                receiver: receiver.username,
                amount: parseFloat(input),
                location
            })

            const transaction = await createTransaction({
                variables: {
                    data: transactionData
                }
            })

            const transactionSent = {
                ...transaction.data.createTransaction,
                to: receiver,
                from: user
            }

            await dispatch(globalActions.setAccount(Object.assign({}, account, { balance: account.balance - transactionData.amount })))
            await dispatch(transactionActions.setTransaction({
                id: transactionSent.id,
                fullName: formatTransaction(transactionSent).fullName,
                profileImageUrl: formatTransaction(transactionSent).profileImageUrl,
                username: formatTransaction(transactionSent).username,
                isFromMe: formatTransaction(transactionSent).isFromMe,
                amount: transactionSent.amount,
                createdAt: transactionSent.createdAt
            }))

            ref.current?.setPage(1)

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
            isFromMe,
            profileImageUrl: profileImageUrl || "",
            amount: transaction.amount,
            fullName: fullName || "",
            username: username || ""
        }
    }

    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        setShowSingleTransaction(false)
        onCloseFinish()
        setVisible(false)
        setInput("0")
    }


    const onNextPage = async () => {
        try {
            const transactionData = await TransactionAuthSchema.createTransactionDetails.parseAsync({
                username: receiver.username,
                profileImageUrl: receiver.profileImageUrl,
                fullName: receiver.fullName,
                isFromMe: false,
                amount: parseFloat(input),
            })

            await dispatch(transactionActions.setTransactionDetails(transactionData))
            nextPage()

        } catch (error) {
            console.log(error);
        }
    }

    const onChange = (value: string) => {
        console.log(value);

        if (Number(value) >= 10)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }


    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <VStack flex={1} justifyContent={"space-between"}>
            <VStack>
                <HStack px={"10px"} justifyContent={"space-between"}>
                    <TouchableOpacity onPress={() => handleOnClose()}>
                        <Stack w={"50px"}>
                            <Ionicons name="chevron-back-outline" size={30} color="white" />
                        </Stack>
                    </TouchableOpacity>
                    <Stack>
                        <Heading mb={"20px"} size={"sm"} color={colors.white} textAlign={"center"}>Enviar</Heading>
                    </Stack>
                    <Stack w={"50px"} />
                </HStack>
                <HStack px={"20px"} mt={"20px"} alignItems={"center"} justifyContent={"space-between"} mb={"20px"}>
                    <HStack space={2}>
                        {receiver.profileImageUrl ?
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: receiver.profileImageUrl }} />
                            :
                            <DefaultIcon
                                value={receiver?.fullName || ""}
                                contentContainerStyle={[styles.contentContainerStyle, { backgroundColor: GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(receiver?.fullName || "") }]}
                                textStyle={styles.textStyle}
                            />
                        }
                        <VStack justifyContent={"center"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(15)} color={"white"}>{MAKE_FULL_NAME_SHORTEN(receiver?.fullName || "")}</Heading>
                            <Text color={colors.lightSkyGray}>{receiver?.username}</Text>
                        </VStack>
                    </HStack>
                    <Button opacity={showPayButton ? 1 : 0.5} fontSize={scale(13) + "px"} disabled={!showPayButton} onPress={onNextPage} h={"40px"} w={"100px"} title={"Siguiente"} bg={showPayButton ? "mainGreen" : "lightGray"} borderRadius={100} color={showPayButton ? colors.white : colors.mainGreen} />
                </HStack>
            </VStack>
            <VStack mb={"40px"}>
                <KeyNumberPad onChange={(value: string) => onChange(value)} />
            </VStack>
        </VStack>
    )
}

export default CreateTransaction


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