import React, { useState } from 'react'
import colors from '@/colors'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack } from 'native-base'
import { FORMAT_CURRENCY, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { scale } from 'react-native-size-matters';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '@/components/global/Button';
import { useDispatch, useSelector } from 'react-redux';
import KeyNumberPad from '../global/KeyNumberPad';
import { transactionActions } from '@/redux/slices/transactionSlice';
import { TransactionAuthSchema } from '@/auth/transactionAuth';


type Props = {
    onSendFinish?: () => any
    onCloseFinish?: () => void
    nextPage?: () => void
    input: string
    setInput: (_: string) => void
}

const CreateTransaction: React.FC<Props> = ({ input, setInput, nextPage = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { account } = useSelector((state: any) => state.globalReducer)
    const [showPayButton, setShowPayButton] = useState<boolean>(false);

    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
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
        if (Number(value) >= 10 && Number(value) <= account.balance)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }

    return (
        <VStack flex={1} justifyContent={"space-between"}>
            <VStack>
                <HStack px={"10px"} mb={"20px"} alignItems={"center"} justifyContent={"space-between"}>
                    <TouchableOpacity onPress={() => handleOnClose()}>
                        <Stack w={"50px"}>
                            <Ionicons name="chevron-back-outline" size={30} color="white" />
                        </Stack>
                    </TouchableOpacity>
                    <Stack>
                        <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
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