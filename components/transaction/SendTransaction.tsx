import React, { useEffect, useState } from 'react'
import colors from '@/colors'
import Input from '@/components/global/Input'
import DefaultIcon from 'react-native-default-icon';
import { StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native'
import { Heading, Image, Text, VStack, HStack, Stack } from 'native-base'

import { GENERATE_RAMDOM_COLOR_BASE_ON_TEXT, MAKE_FULL_NAME_SHORTEN } from '@/helpers'
import { useSqlite } from '@/hooks/useSqlite';
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

type Props = {
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const { height } = Dimensions.get('window')
const SearchUserScreen: React.FC<Props> = ({ open = false, onSendFinish = () => { }, onCloseFinish = () => { } }) => {
    const dispatch = useDispatch();
    const { receiver } = useSelector((state: any) => state.transactionReducer)
    const { location } = useSelector((state: any) => state.globalReducer)
    const [createTransaction] = useMutation(TransactionApolloQueries.createTransaction())

    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);

    const handleOnSend = async () => {
        try {
            const transactionData = await TransactionAuthSchema.createTransaction.parseAsync({
                receiver: receiver.username,
                amount: parseFloat(input),
                description: "Transferencia",
                location
            })

            const transaction = await createTransaction({
                variables: {
                    data: transactionData
                }
            })

            // onSendFinish()
            console.log(JSON.stringify(transaction.data, null, 2));

        } catch (error: any) {
            console.error(error.message);
        }
    }

    const handleOnClose = async () => {
        await dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.darkGray }}>
            <BottomSheet openTime={300} height={height} onCloseFinish={() => handleOnClose()} open={visible}>
                <VStack py={"40px"} h={"100%"} justifyContent={"space-between"}>
                    <VStack>
                        <HStack space={5} px={"10px"} justifyContent={"space-between"}>
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
                                {false ?
                                    <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={"50px"} h={"50px"} source={{ uri: "" }} />
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
                            <Button opacity={Number(input) > 0 ? 1 : 0.5} disabled={Number(input) <= 0} onPress={handleOnSend} h={"40px"} w={"100px"} title={"Pagar"} bg={Number(input) > 0 ? "mainGreen" : "lightGray"} borderRadius={100} color={Number(input) > 0 ? colors.white : colors.mainGreen} />
                        </HStack>
                    </VStack>
                    <VStack mb={"20px"}>
                        <KeyNumberPad
                            onChange={(value: string) => {
                                console.log(value, input);
                                console.log(JSON.stringify({ receiver }, null, 2));
                                setInput(value);
                            }}
                        />
                    </VStack>
                </VStack>
            </BottomSheet>
        </SafeAreaView>

    )
}

export default SearchUserScreen


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