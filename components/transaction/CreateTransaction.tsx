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
import { SafeAreaView } from 'react-native-safe-area-context';


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
        <SafeAreaView style={{ width: "100%", height: "90%" }}>
            <VStack justifyContent={"space-between"} h={"100%"}>
                <VStack>
                    <HStack w={"100%"} mt={"10px"} alignItems={"center"} justifyContent={"center"}>
                        <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
                    </HStack>
                    <HStack px={"20px"} mt={"30px"} alignItems={"center"} justifyContent={"space-between"}>
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
                        <Button opacity={showPayButton ? 1 : 0.5} fontSize={scale(11) + "px"} disabled={!showPayButton} onPress={onNextPage} h={"40px"} w={"100px"} title={"Siguiente"} bg={showPayButton ? "mainGreen" : "lightGray"} borderRadius={100} color={showPayButton ? colors.white : colors.mainGreen} />
                    </HStack>
                </VStack>
                <VStack >
                    <KeyNumberPad onChange={(value: string) => onChange(value)} />
                </VStack>
            </VStack>
        </SafeAreaView>
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